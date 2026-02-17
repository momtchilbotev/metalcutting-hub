import { APP_CONFIG } from '../config.js';

/**
 * Format price in Bulgarian Lev (BGN)
 * @param {number|string} price - Price to format
 * @param {boolean} withSymbol - Include currency symbol
 * @returns {string} - Formatted price
 */
export function formatPrice(price, withSymbol = true) {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return withSymbol ? '0.00 лв.' : '0.00';
  }

  // Format with Bulgarian locale (uses comma as decimal separator)
  const formatted = numPrice.toLocaleString('bg-BG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return withSymbol ? `${formatted} лв.` : formatted;
}

/**
 * Format date to Bulgarian locale
 * @param {string|Date} date - Date to format
 * @param {boolean} withTime - Include time
 * @returns {string} - Formatted date
 */
export function formatDate(date, withTime = false) {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  if (withTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return dateObj.toLocaleDateString('bg-BG', options);
}

/**
 * Format relative time (e.g., "преди 2 часа")
 * @param {string|Date} date - Date to format
 * @returns {string} - Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'току-що';
  if (diffMins < 60) return `преди ${diffMins} ${getBulgarianMinutes(diffMins)}`;
  if (diffHours < 24) return `преди ${diffHours} ${getBulgarianHours(diffHours)}`;
  if (diffDays < 30) return `преди ${diffDays} ${getBulgarianDays(diffDays)}`;
  if (diffMonths < 12) return `преди ${diffMonths} ${getBulgarianMonths(diffMonths)}`;
  return `преди ${diffYears} ${getBulgarianYears(diffYears)}`;
}

/**
 * Get correct Bulgarian word form for minutes
 * @param {number} num - Number
 * @returns {string} - Bulgarian word
 */
function getBulgarianMinutes(num) {
  if (num === 1) return 'минута';
  if (num >= 2 && num <= 4) return 'минути';
  return 'минути';
}

/**
 * Get correct Bulgarian word form for hours
 * @param {number} num - Number
 * @returns {string} - Bulgarian word
 */
function getBulgarianHours(num) {
  if (num === 1) return 'час';
  if (num >= 2 && num <= 4) return 'часа';
  return 'часа';
}

/**
 * Get correct Bulgarian word form for days
 * @param {number} num - Number
 * @returns {string} - Bulgarian word
 */
function getBulgarianDays(num) {
  if (num === 1) return 'ден';
  if (num >= 2 && num <= 4) return 'дни';
  return 'дни';
}

/**
 * Get correct Bulgarian word form for months
 * @param {number} num - Number
 * @returns {string} - Bulgarian word
 */
function getBulgarianMonths(num) {
  if (num === 1) return 'месец';
  if (num >= 2 && num <= 4) return 'месеца';
  return 'месеца';
}

/**
 * Get correct Bulgarian word form for years
 * @param {number} num - Number
 * @returns {string} - Bulgarian word
 */
function getBulgarianYears(num) {
  if (num === 1) return 'година';
  if (num >= 2 && num <= 4) return 'години';
  return 'години';
}

/**
 * Format listing condition in Bulgarian
 * @param {string} condition - Condition value
 * @returns {string} - Bulgarian condition text
 */
export function formatCondition(condition) {
  const conditions = {
    'new': 'Ново',
    'used': 'Използвано',
    'refurbished': 'Реконструирано'
  };
  return conditions[condition] || condition;
}

/**
 * Format listing status in Bulgarian
 * @param {string} status - Status value
 * @returns {string} - Bulgarian status text
 */
export function formatStatus(status) {
  const statuses = {
    'active': 'Активна',
    'sold': 'Продадена',
    'draft': 'Чернова',
    'expired': 'Изтекла'
  };
  return statuses[status] || status;
}

/**
 * Format user role in Bulgarian
 * @param {string} role - Role value
 * @returns {string} - Bulgarian role text
 */
export function formatRole(role) {
  const roles = {
    'user': 'Потребител',
    'moderator': 'Модератор',
    'admin': 'Администратор'
  };
  return roles[role] || role;
}

/**
 * Format phone number (Bulgarian format)
 * @param {string} phone - Phone number
 * @returns {string} - Formatted phone number
 */
export function formatPhone(phone) {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format: +359 XXX XXX XXX or 0XXX XXX XXX
  if (cleaned.startsWith('359') && cleaned.length === 12) {
    return `+359 ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
  }

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }

  return phone;
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export function formatNumber(num) {
  if (isNaN(num)) return '0';
  return num.toLocaleString('bg-BG');
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format listing URL
 * @param {Object} listing - Listing object
 * @returns {string} - Formatted URL slug
 */
export function formatListingSlug(listing) {
  if (!listing) return '';

  // Create slug from title (basic implementation)
  const slug = listing.title
    .toLowerCase()
    .replace(/[^a-z0-9а-я\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  return `/listings/${listing.id}/${slug}`;
}

/**
 * Format image URL for listing
 * @param {Object} image - Image object with storage_path
 * @returns {string} - Public URL
 */
export function formatImageUrl(image) {
  if (!image || !image.storage_path) {
    return '/images/placeholder.svg';
  }
  return image.url || `/images/placeholder.svg`;
}

/**
 * Format pagination info
 * @param {number} current - Current page
 * @param {number} total - Total pages
 * @returns {string} - Formatted pagination text
 */
export function formatPagination(current, total) {
  return `Страница ${current} от ${total}`;
}

/**
 * Format admin action in Bulgarian
 * @param {string} action - Action value
 * @returns {string} - Bulgarian action text
 */
export function formatAdminAction(action) {
  const actions = {
    'approve_listing': 'Одобри обява',
    'reject_listing': 'Отхвърли обява',
    'toggle_featured': 'Промени препоръчана обява',
    'update_role': 'Промени роля',
    'toggle_verification': 'Промени верификация',
    'ban_user': 'Блокирай потребител',
    'unban_user': 'Отблокирай потребител',
    'create_category': 'Създай категория',
    'update_category': 'Редактирай категория',
    'delete_category': 'Изтрий категория'
  };
  return actions[action] || action;
}

/**
 * Format target type in Bulgarian
 * @param {string} targetType - Target type value
 * @returns {string} - Bulgarian target type text
 */
export function formatTargetType(targetType) {
  const types = {
    'listing': 'Обява',
    'user': 'Потребител',
    'category': 'Категория'
  };
  return types[targetType] || targetType;
}

/**
 * Convert first letter to uppercase (Bulgarian safe)
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Pluralize Bulgarian word based on count
 * @param {number} count - Count
 * @param {string[]} forms - Array of forms [one, two-to-four, many]
 * @returns {string} - Correct form
 */
export function pluralize(count, forms) {
  if (count === 1) return forms[0];
  if (count >= 2 && count <= 4) return forms[1];
  return forms[2];
}

/**
 * Format count with Bulgarian word
 * @param {number} count - Count
 * @param {string} word - Word to pluralize
 * @returns {string} - Formatted string
 */
export function formatCount(count, word) {
  const words = {
    'обява': ['обява', 'обяви', 'обяви'],
    'потребител': ['потребител', 'потребители', 'потребители'],
    'съобщение': ['съобщение', 'съобщения', 'съобщения'],
    'категория': ['категория', 'категории', 'категории']
  };

  const forms = words[word] || [word, word + 'а', word + 'а'];
  return `${count} ${pluralize(count, forms)}`;
}
