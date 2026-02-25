import { supabase } from '../utils/supabaseClient.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export class SubscriptionService {
  /**
   * Subscribe an email to the newsletter
   * @param {string} email - Email address to subscribe
   * @returns {Promise<Object>} - The subscription data
   */
  async subscribe(email) {
    try {
      // Insert the email into the newsletter_subscriptions table
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email }])
        .select()
        .single();

      if (error) {
        // Handle duplicate email error
        if (error.code === '23505') {
          throw new Error('DUPLICATE_EMAIL');
        }
        throw error;
      }

      // Call Edge Function to send confirmation email
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            token: data.verification_token
          })
        });
      } catch (fetchError) {
        console.warn('Failed to send confirmation email:', fetchError);
        // Don't throw here - subscription was successful
      }

      return data;
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  }

  /**
   * Verify an email subscription using the verification token
   * @param {string} token - The verification token
   * @returns {Promise<Object>} - The updated subscription data
   */
  async verifyEmail(token) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('verification_token', token)
        .select()
        .single();

      if (error) {
        throw new Error('INVALID_TOKEN');
      }

      if (!data) {
        throw new Error('TOKEN_NOT_FOUND');
      }

      return data;
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe an email from the newsletter
   * @param {string} email - Email address to unsubscribe
   * @returns {Promise<Object>} - The updated subscription data
   */
  async unsubscribe(email) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          unsubscribed_at: new Date().toISOString()
        })
        .eq('email', email)
        .is('unsubscribed_at', null)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      throw error;
    }
  }

  /**
   * Check if an email is subscribed and verified
   * @param {string} email - Email address to check
   * @returns {Promise<Object|null>} - Subscription status or null
   */
  async getSubscriptionStatus(email) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get subscription status error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
