import { supabase } from '../utils/supabaseClient.js';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentProfile = null;
  }

  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} fullName - User's full name
   * @returns {Promise<Object>} - The created user data
   */
  async register(email, password, fullName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) throw error;

      // Create profile (will be auto-created by trigger, but we can update additional fields)
      if (data.user) {
        this.currentUser = data.user;

        // Wait for profile to be created and then update
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          updated_at: new Date().toISOString()
        });

        if (profileError) {
          console.warn('Profile update warning:', profileError);
        }
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - The session data
   */
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Login with Google OAuth
   * @returns {Promise<void>}
   */
  async loginWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      this.currentUser = null;
      this.currentProfile = null;

      // Refresh navbar to show logged-out state
      if (window.navbar) {
        await window.navbar.refresh();
      }

      // Navigate to home
      window.router.navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get current session
   * @returns {Promise<Object|null>} - The session or null
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      this.currentUser = session?.user || null;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Get current user
   * @returns {Promise<Object|null>} - The user or null
   */
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Object|null>} - The profile or null
   */
  async getProfile(userId = null) {
    try {
      let uid = userId;

      if (!uid) {
        const user = await this.getUser();
        if (!user) return null;
        uid = user.id;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, return null
          return null;
        }
        throw error;
      }

      if (!userId) {
        this.currentProfile = data;
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - The updated profile
   */
  async updateProfile(updates) {
    try {
      const user = await this.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      this.currentProfile = data;
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Verify current password
   * @param {string} currentPassword - Current password to verify
   * @returns {Promise<boolean>} - True if password is correct
   */
  async verifyPassword(currentPassword) {
    try {
      const user = await this.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Try to sign in with the current password to verify it
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Verify password error:', error);
      return false;
    }
  }

  /**
   * Update password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    const session = await this.getSession();
    return !!session;
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check ('user', 'moderator', 'admin')
   * @returns {Promise<boolean>}
   */
  async hasRole(role) {
    try {
      const profile = await this.getProfile();
      if (!profile) return false;

      const roleHierarchy = { user: 0, moderator: 1, admin: 2 };
      return roleHierarchy[profile.role] >= roleHierarchy[role];
    } catch (error) {
      console.error('Check role error:', error);
      return false;
    }
  }

  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Callback function
   * @returns {Object} - Subscription object
   */
  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      this.currentProfile = null; // Reset profile cache
      callback(event, session);
    });

    return data.subscription;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Auth guard for protected routes
export function authGuard() {
  return authService.getSession().then(session => {
    if (!session) {
      window.router.navigate('/login');
      return false;
    }
    return true;
  });
}
