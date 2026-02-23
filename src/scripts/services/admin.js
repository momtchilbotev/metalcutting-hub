import { supabase } from '../utils/supabaseClient.js';

/**
 * Check if current user has admin role
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin' || profile?.role === 'moderator';
  } catch (error) {
    console.error('Check admin error:', error);
    return false;
  }
}

/**
 * Check if user has specific role
 * @param {string} requiredRole - Role to check ('user', 'moderator', 'admin')
 * @returns {Promise<boolean>}
 */
export async function hasRole(requiredRole) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const roleHierarchy = { user: 0, moderator: 1, admin: 2 };
    const userRole = profile?.role || 'user';
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  } catch (error) {
    console.error('Check role error:', error);
    return false;
  }
}

export class AdminService {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>}
   */
  async getDashboardStats() {
    try {
      const [listingsResult, usersResult, messagesResult, categoriesResult] = await Promise.all([
        supabase.from('listings').select('id, status', { count: 'exact', head: true }),
        supabase.from('profiles').select('id, role', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true })
      ]);

      // Get active/sold listings count
      const { data: listingsByStatus } = await supabase
        .from('listings')
        .select('status')
        .not('status', 'eq', 'draft');

      const statusCounts = (listingsByStatus || []).reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
      }, {});

      return {
        totalListings: listingsResult.count || 0,
        activeListings: statusCounts.active || 0,
        soldListings: statusCounts.sold || 0,
        totalUsers: usersResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalCategories: categoriesResult.count || 0
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  /**
   * Get all listings with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  async getListings(filters = {}) {
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          profiles:profiles!listings_user_id_fkey(id, full_name),
          categories:categories!listings_category_id_fkey(name_bg),
          locations:locations!listings_location_id_fkey(name_bg)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters.page && filters.items_per_page) {
        const from = (filters.page - 1) * filters.items_per_page;
        const to = from + filters.items_per_page - 1;
        query = query.range(from, to);
      } else if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        listings: data || [],
        count: count || 0,
        page: filters.page || 1,
        itemsPerPage: filters.items_per_page || 20
      };
    } catch (error) {
      console.error('Get admin listings error:', error);
      throw error;
    }
  }

  /**
   * Approve a listing (set to active)
   * @param {string} listingId - Listing ID
   * @returns {Promise<void>}
   */
  async approveListing(listingId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update listing status
      const { error } = await supabase
        .from('listings')
        .update({ status: 'active' })
        .eq('id', listingId);

      if (error) throw error;

      // Log action
      await this._logAction(user.id, 'approve_listing', 'listing', listingId);
    } catch (error) {
      console.error('Approve listing error:', error);
      throw error;
    }
  }

  /**
   * Reject/delete a listing
   * @param {string} listingId - Listing ID
   * @param {string} reason - Reason for rejection
   * @returns {Promise<void>}
   */
  async rejectListing(listingId, reason = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Soft delete by setting to expired
      const { error } = await supabase
        .from('listings')
        .update({ status: 'expired' })
        .eq('id', listingId);

      if (error) throw error;

      await this._logAction(user.id, 'reject_listing', 'listing', listingId, { reason });
    } catch (error) {
      console.error('Reject listing error:', error);
      throw error;
    }
  }

  /**
   * Toggle featured status
   * @param {string} listingId - Listing ID
   * @param {boolean} isFeatured - Featured status
   * @returns {Promise<void>}
   */
  async toggleFeatured(listingId, isFeatured) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('listings')
        .update({ is_featured: isFeatured })
        .eq('id', listingId);

      if (error) throw error;

      await this._logAction(user.id, 'toggle_featured', 'listing', listingId, { isFeatured });
    } catch (error) {
      console.error('Toggle featured error:', error);
      throw error;
    }
  }

  /**
   * Get all users with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>}
   */
  async getUsers(page = 1, limit = 20) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        users: data || [],
        total: count || 0,
        page,
        itemsPerPage: limit
      };
    } catch (error) {
      console.error('Get admin users error:', error);
      throw error;
    }
  }

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} newRole - New role ('user', 'moderator', 'admin')
   * @returns {Promise<void>}
   */
  async updateUserRole(userId, newRole) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      await this._logAction(user.id, 'update_role', 'user', userId, { newRole });
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  /**
   * Toggle user verification status
   * @param {string} userId - User ID
   * @param {boolean} isVerified - Verification status
   * @returns {Promise<void>}
   */
  async toggleUserVerification(userId, isVerified) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('id', userId);

      if (error) throw error;

      await this._logAction(user.id, 'toggle_verification', 'user', userId, { isVerified });
    } catch (error) {
      console.error('Toggle user verification error:', error);
      throw error;
    }
  }

  /**
   * Get audit log
   * @param {number} limit - Maximum number of entries
   * @param {number} page - Page number
   * @returns {Promise<Object>}
   */
  async getAuditLog(limit = 100, page = 1) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('admin_audit_log')
        .select(`
          *,
          admin:profiles!admin_audit_log_admin_id_fkey(full_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        logs: data || [],
        total: count || 0,
        page,
        itemsPerPage: limit
      };
    } catch (error) {
      console.error('Get audit log error:', error);
      throw error;
    }
  }

  /**
   * Get today's activity log
   * @param {number} limit - Maximum number of entries
   * @returns {Promise<Array>}
   */
  async getTodayActivity(limit = 20) {
    try {
      // Get start of today in ISO format
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data, error } = await supabase
        .from('admin_audit_log')
        .select(`
          *,
          admin:profiles!admin_audit_log_admin_id_fkey(full_name)
        `)
        .gte('created_at', todayISO)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get today activity error:', error);
      return [];
    }
  }

  /**
   * Get all reports with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  async getReports(filters = {}) {
    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          listing:listings(id, title, status),
          reporter:profiles!reports_reporter_id_fkey(id, full_name, email),
          reviewer:profiles!reports_reviewed_by_fkey(id, full_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.page && filters.items_per_page) {
        const from = (filters.page - 1) * filters.items_per_page;
        const to = from + filters.items_per_page - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        reports: data || [],
        count: count || 0,
        page: filters.page || 1,
        itemsPerPage: filters.items_per_page || 20
      };
    } catch (error) {
      console.error('Get reports error:', error);
      throw error;
    }
  }

  /**
   * Update report status
   * @param {string} reportId - Report ID
   * @param {string} status - New status ('reviewed', 'resolved', 'dismissed')
   * @param {string} notes - Admin notes
   * @returns {Promise<void>}
   */
  async updateReportStatus(reportId, status, notes = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = {
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      };

      if (notes) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      await this._logAction(user.id, 'update_report', 'report', reportId, { status, notes });
    } catch (error) {
      console.error('Update report status error:', error);
      throw error;
    }
  }

  /**
   * Get pending reports count
   * @returns {Promise<number>}
   */
  async getPendingReportsCount() {
    try {
      const { count, error } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Get pending reports count error:', error);
      return 0;
    }
  }

  /**
   * Create or update category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>}
   */
  async saveCategory(categoryData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let result;

      if (categoryData.id) {
        // Update existing
        const { data, error } = await supabase
          .from('categories')
          .update({
            name_bg: categoryData.name_bg,
            name_en: categoryData.name_en,
            slug: categoryData.slug,
            icon_url: categoryData.icon_url,
            sort_order: categoryData.sort_order
          })
          .eq('id', categoryData.id)
          .select()
          .single();

        if (error) throw error;
        result = data;

        await this._logAction(user.id, 'update_category', 'category', categoryData.id);
      } else {
        // Create new
        const { data, error } = await supabase
          .from('categories')
          .insert([{
            name_bg: categoryData.name_bg,
            name_en: categoryData.name_en,
            slug: categoryData.slug,
            icon_url: categoryData.icon_url,
            sort_order: categoryData.sort_order || 0
          }])
          .select()
          .single();

        if (error) throw error;
        result = data;

        await this._logAction(user.id, 'create_category', 'category', data.id);
      }

      return result;
    } catch (error) {
      console.error('Save category error:', error);
      throw error;
    }
  }

  /**
   * Delete category
   * @param {string} categoryId - Category ID
   * @returns {Promise<void>}
   */
  async deleteCategory(categoryId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if category has listings
      const { data: listings } = await supabase
        .from('listings')
        .select('id')
        .eq('category_id', categoryId)
        .limit(1);

      if (listings && listings.length > 0) {
        throw new Error('Cannot delete category with existing listings');
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      await this._logAction(user.id, 'delete_category', 'category', categoryId);
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   * @returns {Promise<Array>}
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get admin categories error:', error);
      return [];
    }
  }

  /**
   * Get system health info
   * @returns {Promise<Object>}
   */
  async getSystemHealth() {
    try {
      // Get database size (approximate)
      const { data: dbStats } = await supabase
        .rpc('get_db_stats');

      // Get storage info
      const { data: storageData } = await supabase
        .storage
        .listBuckets();

      return {
        database: dbStats,
        storage: storageData
      };
    } catch (error) {
      console.error('Get system health error:', error);
      return {
        database: null,
        storage: null
      };
    }
  }

  /**
   * Log admin action to audit table
   * @private
   * @param {string} adminId - Admin user ID
   * @param {string} action - Action performed
   * @param {string} targetType - Target entity type
   * @param {string} targetId - Target entity ID
   * @param {Object} details - Additional details
   */
  async _logAction(adminId, action, targetType, targetId, details = null) {
    try {
      await supabase.from('admin_audit_log').insert([{
        admin_id: adminId,
        action,
        target_type: targetType,
        target_id: targetId,
        details
      }]);
    } catch (error) {
      console.error('Log action error:', error);
      // Don't throw - logging failures shouldn't block operations
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();

// Admin guard for protected admin routes
export async function adminGuard(requiredRole = 'admin') {
  const hasAccess = await hasRole(requiredRole);
  if (!hasAccess) {
    window.router.navigate('/');
    window.showToast('Нямате достъп до тази страница.', 'error');
    return false;
  }
  return true;
}
