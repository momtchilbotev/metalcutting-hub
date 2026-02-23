import { supabase } from '../utils/supabaseClient.js';

/**
 * Check if current user is exactly moderator (not admin)
 * @returns {Promise<boolean>}
 */
export async function isModeratorOnly() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'moderator';
  } catch (error) {
    console.error('Check moderator only error:', error);
    return false;
  }
}

/**
 * Check if user is moderator OR admin
 * @returns {Promise<boolean>}
 */
export async function isModerator() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'moderator' || profile?.role === 'admin';
  } catch (error) {
    console.error('Check moderator error:', error);
    return false;
  }
}

/**
 * Get the current user's role
 * @returns {Promise<string|null>}
 */
export async function getUserRole() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role || 'user';
  } catch (error) {
    console.error('Get user role error:', error);
    return null;
  }
}

/**
 * Route guard - allows moderator access, blocks regular users
 * Note: Admins also pass this guard but they should use /admin
 * @returns {Promise<boolean>}
 */
export async function moderatorGuard() {
  const hasAccess = await isModerator();
  if (!hasAccess) {
    window.router.navigate('/');
    window.showToast('Нямате достъп до тази страница.', 'error');
    return false;
  }
  return true;
}
