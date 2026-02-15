import { supabase } from './utils/supabaseClient.js';

export const APP_CONFIG = {
  appName: 'Metalcutting Hub',
  currency: 'BGN',
  currencySymbol: 'лв',
  locale: 'bg-BG',
  dateFormat: 'DD.MM.YYYY',
  timeFormat: 'HH:mm',
  itemsPerPage: 20,
  maxImages: 6,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedImageFormats: ['image/jpeg', 'image/png', 'image/webp'],
  listingExpiryDays: 30,
  messagesPerPage: 25
};

export async function initializeApp() {
  try {
    // Check auth session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
    }

    // Set up auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
      window.dispatchEvent(new CustomEvent('auth-change', {
        detail: { event, session }
      }));

      // Update navbar when auth state changes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        window.dispatchEvent(new CustomEvent('refresh-navbar'));
      }
    });

    return { session };
  } catch (error) {
    console.error('Error initializing app:', error);
    return { session: null };
  }
}

export function getCurrentUser() {
  return supabase.auth.getUser();
}

export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}
