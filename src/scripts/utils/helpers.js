/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));

  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {Object} - Parsed query object
 */
export function parseQueryString(queryString) {
  if (!queryString) return {};

  const params = new URLSearchParams(queryString);
  const result = {};

  for (const [key, value] of params) {
    result[key] = value;
  }

  return result;
}

/**
 * Build query string from object
 * @param {Object} params - Query parameters
 * @returns {string} - Query string
 */
export function buildQueryString(params) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get query parameter from URL
 * @param {string} name - Parameter name
 * @returns {string|null} - Parameter value or null
 */
export function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Set query parameter in URL
 * @param {string} name - Parameter name
 * @param {string} value - Parameter value
 * @param {boolean} replace - Replace current history state
 */
export function setQueryParam(name, value, replace = false) {
  const url = new URL(window.location);
  url.searchParams.set(name, value);

  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }
}

/**
 * Remove query parameter from URL
 * @param {string} name - Parameter name
 */
export function removeQueryParam(name) {
  const url = new URL(window.location);
  url.searchParams.delete(name);
  window.history.replaceState({}, '', url);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (error) {
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
}

/**
 * Download file from URL
 * @param {string} url - File URL
 * @param {string} filename - Download filename
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} - Is in viewport
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 * @param {string|Element} target - Target selector or element
 * @param {Object} options - Scroll options
 */
export function scrollTo(target, options = {}) {
  const element = typeof target === 'string'
    ? document.querySelector(target)
    : target;

  if (!element) return;

  const defaultOptions = {
    behavior: 'smooth',
    block: 'start'
  };

  element.scrollIntoView({ ...defaultOptions, ...options });
}

/**
 * Get scroll position
 * @returns {Object} - Scroll position {x, y}
 */
export function getScrollPosition() {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  };
}

/**
 * Set scroll position
 * @param {number} x - X position
 * @param {number} y - Y position
 */
export function setScrollPosition(x, y) {
  window.scrollTo(x, y);
}

/**
 * Parse and format JSON safely
 * @param {string} json - JSON string
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} - Parsed object or default value
 */
export function safeJSONParse(json, defaultValue = null) {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * Stringify JSON safely
 * @param {*} obj - Object to stringify
 * @param {string} defaultValue - Default value if stringifying fails
 * @returns {string} - JSON string or default value
 */
export function safeJSONStringify(obj, defaultValue = '{}') {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
}

/**
 * Local storage wrapper with error handling
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? safeJSONParse(item, defaultValue) : defaultValue;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, safeJSONStringify(value));
      return true;
    } catch (error) {
      console.error('LocalStorage set error:', error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('LocalStorage remove error:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('LocalStorage clear error:', error);
      return false;
    }
  }
};

/**
 * Session storage wrapper with error handling
 */
export const sessionStorage = {
  get(key, defaultValue = null) {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? safeJSONParse(item, defaultValue) : defaultValue;
    } catch (error) {
      console.error('SessionStorage get error:', error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      window.sessionStorage.setItem(key, safeJSONStringify(value));
      return true;
    } catch (error) {
      console.error('SessionStorage set error:', error);
      return false;
    }
  },

  remove(key) {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('SessionStorage remove error:', error);
      return false;
    }
  },

  clear() {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('SessionStorage clear error:', error);
      return false;
    }
  }
};

/**
 * Get random item from array
 * @param {Array} array - Array to pick from
 * @returns {*} - Random item
 */
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} - Array of chunks
 */
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Group array items by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} - Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Check if device is mobile
 * @returns {boolean} - Is mobile device
 */
export function isMobile() {
  return window.innerWidth < 768;
}

/**
 * Check if device is tablet
 * @returns {boolean} - Is tablet device
 */
export function isTablet() {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

/**
 * Check if device is desktop
 * @returns {boolean} - Is desktop device
 */
export function isDesktop() {
  return window.innerWidth >= 1024;
}

/**
 * Get device type
 * @returns {string} - Device type ('mobile', 'tablet', 'desktop')
 */
export function getDeviceType() {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}

/**
 * Format file extension
 * @param {string} filename - File name
 * @returns {string} - File extension
 */
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Check if file is an image
 * @param {File} file - File to check
 * @returns {boolean} - Is image file
 */
export function isImageFile(file) {
  return file.type.startsWith('image/');
}

/**
 * Create debounced resize listener
 * @param {Function} callback - Callback function
 * @returns {Function} - Resize listener function
 */
export function onResize(callback) {
  const listener = debounce(() => {
    callback({
      width: window.innerWidth,
      height: window.innerHeight,
      deviceType: getDeviceType()
    });
  }, 150);

  window.addEventListener('resize', listener);
  return () => window.removeEventListener('resize', listener);
}

/**
 * Get browser locale
 * @returns {string} - Browser locale
 */
export function getBrowserLocale() {
  return navigator.language || navigator.userLanguage || 'bg-BG';
}

/**
 * Format error message for user display
 * @param {Error} error - Error object
 * @returns {string} - Formatted error message
 */
export function formatErrorMessage(error) {
  if (error?.message) {
    // Common error translations
    const translations = {
      'Invalid login credentials': 'Грешен имейл или парола.',
      'User already registered': 'Потребителят вече е регистриран.',
      'Email not confirmed': 'Моля, потвърдете вашия имейл адрес.',
      'Invalid email': 'Моля, въведете валиден имейл адрес.',
      'Password should be at least 6 characters': 'Паролата трябва да е поне 6 символа.',
      'Network request failed': 'Проблем с връзката. Моля, проверете интернет връзката си.',
      'Not found': 'Ресурсът не е намерен.',
      'Unauthorized': 'Нямате достъп до този ресурс.'
    };

    return translations[error.message] || error.message;
  }

  return 'Възникна грешка. Моля, опитайте отново.';
}
