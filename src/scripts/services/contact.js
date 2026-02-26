import { supabase } from '../utils/supabaseClient.js';

/**
 * Contact Service
 * Handles contact form submissions and management for admin/moderator
 */
export class ContactService {
  /**
   * Submit a contact form (works for both authenticated and anonymous users)
   * @param {Object} data - Contact form data
   * @param {string} data.name - Contact name
   * @param {string} data.email - Contact email
   * @param {string} [data.phone] - Contact phone (optional)
   * @param {string} data.subject - Message subject
   * @param {string} data.message - Message content
   * @param {string} [data.user_id] - User ID if authenticated
   * @returns {Promise<Object>} - Created submission
   */
  async submitContactForm(data) {
    try {
      // Only insert essential fields - let database defaults handle status and priority
      const submissionData = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      };

      // Add optional fields only if they have values
      if (data.phone) {
        submissionData.phone = data.phone;
      }
      if (data.user_id) {
        submissionData.user_id = data.user_id;
      }

      // Insert without .select() to avoid needing SELECT permission
      const { error } = await supabase
        .from('contact_submissions')
        .insert([submissionData]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Submit contact form error:', error);
      throw error;
    }
  }

  /**
   * Get contact submissions with filters and pagination
   * @param {Object} filters - Filter options
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.subject] - Filter by subject
   * @param {string} [filters.search] - Search in name, email, message
   * @param {number} [filters.page] - Page number
   * @param {number} [filters.items_per_page] - Items per page
   * @returns {Promise<Object>} - Submissions with pagination info
   */
  async getSubmissions(filters = {}) {
    try {
      let query = supabase
        .from('contact_submissions')
        .select(`
          *,
          user:profiles!contact_submissions_user_id_fkey(id, full_name, email),
          reviewer:profiles!contact_submissions_reviewed_by_fkey(id, full_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.subject) {
        query = query.eq('subject', filters.subject);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      // Apply pagination
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
        submissions: data || [],
        count: count || 0,
        page: filters.page || 1,
        itemsPerPage: filters.items_per_page || 20
      };
    } catch (error) {
      console.error('Get contact submissions error:', error);
      throw error;
    }
  }

  /**
   * Get count of new/unread submissions
   * @returns {Promise<number>}
   */
  async getNewSubmissionsCount() {
    try {
      const { count, error } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Get new submissions count error:', error);
      return 0;
    }
  }

  /**
   * Get a single submission by ID
   * @param {string} submissionId - Submission ID
   * @returns {Promise<Object>}
   */
  async getSubmission(submissionId) {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select(`
          *,
          user:profiles!contact_submissions_user_id_fkey(id, full_name, email, phone),
          reviewer:profiles!contact_submissions_reviewed_by_fkey(id, full_name)
        `)
        .eq('id', submissionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get submission error:', error);
      throw error;
    }
  }

  /**
   * Update submission status
   * @param {string} submissionId - Submission ID
   * @param {string} status - New status ('new', 'read', 'in_progress', 'resolved', 'spam')
   * @param {string} [notes] - Admin notes
   * @returns {Promise<void>}
   */
  async updateSubmissionStatus(submissionId, status, notes = '') {
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
        .from('contact_submissions')
        .update(updateData)
        .eq('id', submissionId);

      if (error) throw error;

      // Log action to admin audit log
      await this._logAction(user.id, 'update_contact_submission', 'contact_submission', submissionId, { status, notes });
    } catch (error) {
      console.error('Update submission status error:', error);
      throw error;
    }
  }

  /**
   * Mark submission as read
   * @param {string} submissionId - Submission ID
   * @returns {Promise<void>}
   */
  async markAsRead(submissionId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('contact_submissions')
        .update({
          status: 'read',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Log action
      await this._logAction(user.id, 'mark_contact_read', 'contact_submission', submissionId);
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Update priority of a submission
   * @param {string} submissionId - Submission ID
   * @param {string} priority - New priority ('low', 'normal', 'high', 'urgent')
   * @returns {Promise<void>}
   */
  async updatePriority(submissionId, priority) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('contact_submissions')
        .update({ priority })
        .eq('id', submissionId);

      if (error) throw error;

      // Log action
      await this._logAction(user.id, 'update_contact_priority', 'contact_submission', submissionId, { priority });
    } catch (error) {
      console.error('Update priority error:', error);
      throw error;
    }
  }

  /**
   * Add admin notes to a submission
   * @param {string} submissionId - Submission ID
   * @param {string} notes - Admin notes
   * @returns {Promise<void>}
   */
  async addNotes(submissionId, notes) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('contact_submissions')
        .update({ admin_notes: notes })
        .eq('id', submissionId);

      if (error) throw error;
    } catch (error) {
      console.error('Add notes error:', error);
      throw error;
    }
  }

  /**
   * Get submission statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        new: 0,
        read: 0,
        in_progress: 0,
        resolved: 0,
        spam: 0
      };

      data?.forEach(item => {
        if (stats.hasOwnProperty(item.status)) {
          stats[item.status]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Get contact stats error:', error);
      return {
        total: 0,
        new: 0,
        read: 0,
        in_progress: 0,
        resolved: 0,
        spam: 0
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
export const contactService = new ContactService();
