import { supabase } from '../utils/supabaseClient.js';
import { storageService } from './storage.js';

export class ListingService {
  /**
   * Get listings with filters and pagination
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - Listings data with count
   */
  async getListings(filters = {}) {
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          profiles:profiles!listings_user_id_fkey(id, full_name, avatar_url),
          categories:categories!listings_category_id_fkey(id, name_bg, slug),
          locations:locations!listings_location_id_fkey(id, name_bg),
          listing_images(
            id,
            storage_path,
            is_primary,
            order_index
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        if (filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        // If status === 'all', don't apply any status filter (fetch all)
      } else {
        query = query.eq('status', 'active'); // Default to active only for public queries
      }

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.location_id) {
        query = query.eq('location_id', filters.location_id);
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }

      if (filters.min_price) {
        query = query.gte('price', filters.min_price);
      }

      if (filters.max_price) {
        query = query.lte('price', filters.max_price);
      }

      if (filters.is_featured) {
        query = query.eq('is_featured', true);
      }

      if (filters.is_urgent) {
        query = query.eq('is_urgent', true);
      }

      // Search query
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Ordering
      const orderBy = filters.order_by || 'created_at';
      const orderDirection = filters.order_direction || 'desc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Pagination
      if (filters.page && filters.items_per_page) {
        const from = (filters.page - 1) * filters.items_per_page;
        const to = from + filters.items_per_page - 1;
        query = query.range(from, to);
      } else if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Add image URLs to listing images
      const listingsWithData = data ? data.map(listing => {
        if (listing.listing_images && listing.listing_images.length > 0) {
          listing.listing_images = listing.listing_images.map(img => ({
            ...img,
            url: storageService.getPublicUrl(img.storage_path)
          }));
        }
        return listing;
      }) : [];

      return {
        listings: listingsWithData,
        count: count || 0,
        page: filters.page || 1,
        itemsPerPage: filters.items_per_page || filters.limit || 20
      };
    } catch (error) {
      console.error('Get listings error:', error);
      throw error;
    }
  }

  /**
   * Get a single listing by ID
   * @param {string} id - Listing ID
   * @returns {Promise<Object>} - Listing data
   */
  async getListingById(id) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:profiles!listings_user_id_fkey(id, full_name, phone, avatar_url, location_id, locations:locations(name_bg)),
          categories:categories!listings_category_id_fkey(id, name_bg, slug),
          locations:locations!listings_location_id_fkey(id, name_bg),
          listing_images(
            id,
            storage_path,
            is_primary,
            order_index
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Increment view count (fire and forget)
      this.incrementViews(id).catch(console.error);

      // Add image URLs to listing images
      if (data.listing_images) {
        data.listing_images = data.listing_images.map(img => ({
          ...img,
          url: storageService.getPublicUrl(img.storage_path)
        }));
      }

      return data;
    } catch (error) {
      console.error('Get listing error:', error);
      throw error;
    }
  }

  /**
   * Create a new listing
   * @param {Object} listingData - Listing data
   * @param {File[]} images - Array of image files
   * @returns {Promise<Object>} - Created listing
   */
  async createListing(listingData, images = []) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create listing first
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert([{
          ...listingData,
          user_id: user.id,
          status: listingData.status || 'active',
          expires_at: listingData.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single();

      if (listingError) throw listingError;

      // Upload images if provided
      if (images.length > 0) {
        const uploadedImages = await storageService.uploadListingImages(images, listing.id);

        // Save image references to database
        if (uploadedImages.length > 0) {
          const { error: imagesError } = await supabase
            .from('listing_images')
            .insert(uploadedImages.map(img => ({
              listing_id: listing.id,
              storage_path: img.path,
              order_index: img.orderIndex,
              is_primary: img.isPrimary
            })));

          if (imagesError) {
            // Clean up uploaded images on database error
            await storageService.deleteListingImages(listing.id);
            throw imagesError;
          }
        }
      }

      // Fetch complete listing data
      return await this.getListingById(listing.id);
    } catch (error) {
      console.error('Create listing error:', error);
      throw error;
    }
  }

  /**
   * Update an existing listing
   * @param {string} id - Listing ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated listing
   */
  async updateListing(id, updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Verify ownership
      const { data: existing } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!existing) {
        throw new Error('Listing not found');
      }

      if (existing.user_id !== user.id) {
        throw new Error('Not authorized');
      }

      // Update listing
      const { data, error } = await supabase
        .from('listings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Update listing error:', error);
      throw error;
    }
  }

  /**
   * Delete a listing
   * @param {string} id - Listing ID
   * @returns {Promise<void>}
   */
  async deleteListing(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Verify ownership
      const { data: existing } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!existing) {
        throw new Error('Listing not found');
      }

      if (existing.user_id !== user.id) {
        throw new Error('Not authorized');
      }

      // Delete images from storage
      await storageService.deleteListingImages(id);

      // Delete listing (cascade will handle listing_images)
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Delete listing error:', error);
      throw error;
    }
  }

  /**
   * Increment listing view count
   * @param {string} id - Listing ID
   * @returns {Promise<void>}
   */
  async incrementViews(id) {
    try {
      await supabase.rpc('increment_views', { listing_id: id });
    } catch (error) {
      console.error('Increment views error:', error);
    }
  }

  /**
   * Get featured listings
   * @param {number} limit - Maximum number of listings
   * @returns {Promise<Array>} - Array of featured listings
   */
  async getFeaturedListings(limit = 10) {
    return await this.getListings({
      is_featured: true,
      status: 'active',
      limit,
      order_by: 'created_at',
      order_direction: 'desc'
    });
  }

  /**
   * Get listings for current user
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} - User's listings
   */
  async getMyListings(filters = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    return await this.getListings({
      ...filters,
      user_id: user.id,
      status: filters.status || 'all' // Default to 'all' for own listings
    });
  }

  /**
   * Add listing to watchlist
   * @param {string} listingId - Listing ID
   * @returns {Promise<void>}
   */
  async addToWatchlist(listingId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('watchlist')
        .insert([{
          user_id: user.id,
          listing_id: listingId
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Add to watchlist error:', error);
      throw error;
    }
  }

  /**
   * Remove listing from watchlist
   * @param {string} listingId - Listing ID
   * @returns {Promise<void>}
   */
  async removeFromWatchlist(listingId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (error) throw error;
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      throw error;
    }
  }

  /**
   * Check if listing is in user's watchlist
   * @param {string} listingId - Listing ID
   * @returns {Promise<boolean>}
   */
  async isInWatchlist(listingId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('watchlist')
        .select('user_id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (error) return false;
      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get similar listings
   * @param {string} listingId - Original listing ID
   * @param {string} categoryId - Category ID
   * @param {number} limit - Maximum number of listings
   * @returns {Promise<Array>} - Similar listings
   */
  async getSimilarListings(listingId, categoryId, limit = 4) {
    try {
      const { listings } = await this.getListings({
        category_id: categoryId,
        status: 'active',
        limit: limit + 1 // Get one extra in case the original listing is included
      });

      // Filter out the original listing
      return listings.filter(l => l.id !== listingId).slice(0, limit);
    } catch (error) {
      console.error('Get similar listings error:', error);
      return [];
    }
  }

  /**
   * Get categories
   * @returns {Promise<Array>} - Array of categories
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
      console.error('Get categories error:', error);
      return [];
    }
  }

  /**
   * Get locations
   * @param {string} type - Filter by type ('city' or 'region')
   * @returns {Promise<Array>} - Array of locations
   */
  async getLocations(type = null) {
    try {
      let query = supabase
        .from('locations')
        .select('*')
        .order('name_bg', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get locations error:', error);
      return [];
    }
  }

  /**
   * Mark listing as sold
   * @param {string} id - Listing ID
   * @returns {Promise<Object>} - Updated listing
   */
  async markAsSold(id) {
    return await this.updateListing(id, { status: 'sold' });
  }

  /**
   * Renew listing (extend expiration)
   * @param {string} id - Listing ID
   * @param {number} days - Days to extend (default: 30)
   * @returns {Promise<Object>} - Updated listing
   */
  async renewListing(id, days = 30) {
    const newExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    return await this.updateListing(id, {
      expires_at: newExpiry,
      status: 'active'
    });
  }

  /**
   * Report a listing
   * @param {string} listingId - Listing ID
   * @param {string} reason - Reason for report
   * @returns {Promise<Object>} - Created report
   */
  async reportListing(listingId, reason) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('reports')
        .insert([{
          listing_id: listingId,
          reporter_id: user.id,
          reason: reason
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Вече сте докладвали тази обява.');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Report listing error:', error);
      throw error;
    }
  }

  /**
   * Check if user has already reported a listing
   * @param {string} listingId - Listing ID
   * @returns {Promise<boolean>}
   */
  async hasReportedListing(listingId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', user.id)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (error) return false;
      return !!data;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const listingService = new ListingService();
