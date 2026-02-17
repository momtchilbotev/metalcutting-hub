import { APP_CONFIG } from '../config.js';

/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {Object} - Validation result
 */
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Имейлът е задължителен.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Моля, въведете валиден имейл адрес.' };
  }

  return { isValid: true };
}

/**
 * Password validation
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return { isValid: false, error: 'Паролата трябва да е поне 6 символа.' };
  }

  return { isValid: true };
}

/**
 * Phone validation (Bulgarian phone numbers)
 * @param {string} phone - Phone to validate
 * @returns {Object} - Validation result
 */
export function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Телефонът е задължителен.' };
  }

  // Remove spaces, dashes, etc.
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Bulgarian phone: +359XXXXXXXXX or 0XXXXXXXXX
  const phoneRegex = /^(\+359|0) ?[0-9]{9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Моля, въведете валиден телефонен номер.' };
  }

  return { isValid: true };
}

/**
 * Required field validation
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} - Validation result
 */
export function validateRequired(value, fieldName = 'Полето') {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} е задължително.` };
  }

  return { isValid: true };
}

/**
 * Length validation
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} - Validation result
 */
export function validateLength(value, minLength, maxLength, fieldName = 'Полето') {
  if (!value) {
    return { isValid: false, error: `${fieldName} е задължително.` };
  }

  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} трябва да е поне ${minLength} символа.` };
  }

  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} не може да надвишава ${maxLength} символа.` };
  }

  return { isValid: true };
}

/**
 * Price validation
 * @param {string|number} price - Price to validate
 * @returns {Object} - Validation result
 */
export function validatePrice(price) {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice) || numPrice < 0) {
    return { isValid: false, error: 'Моля, въведете валидна цена.' };
  }

  if (numPrice > 9999999.99) {
    return { isValid: false, error: 'Цената не може да надвишава 9,999,999.99 лв.' };
  }

  return { isValid: true, value: numPrice };
}

/**
 * Transform empty string values to null for numeric fields
 * @param {Object} data - Form data object
 * @param {string[]} numericFields - Array of field names that should be numeric
 * @returns {Object} - Transformed data with null instead of empty strings
 */
export function transformNumericFields(data, numericFields = ['price']) {
  const transformed = { ...data };
  for (const field of numericFields) {
    if (transformed[field] === '') {
      transformed[field] = null;
    } else if (transformed[field] !== null && transformed[field] !== undefined) {
      // Parse to number to ensure it's a valid numeric value
      const parsed = parseFloat(transformed[field]);
      transformed[field] = isNaN(parsed) ? null : parsed;
    }
  }
  return transformed;
}

/**
 * Image file validation
 * @param {File[]} files - Files to validate
 * @returns {Object} - Validation result
 */
export function validateImages(files) {
  if (!files || files.length === 0) {
    return { isValid: true }; // Images are optional
  }

  if (files.length > APP_CONFIG.maxImages) {
    return { isValid: false, error: `Максимум ${APP_CONFIG.maxImages} изображения.` };
  }

  for (const file of files) {
    if (!APP_CONFIG.supportedImageFormats.includes(file.type)) {
      return { isValid: false, error: 'Неподдържан формат. Използвайте JPG, PNG или WebP.' };
    }

    if (file.size > APP_CONFIG.maxFileSize) {
      return { isValid: false, error: `Файлът е твърде голям. Максимум ${APP_CONFIG.maxFileSize / 1024 / 1024}MB.` };
    }
  }

  return { isValid: true };
}

/**
 * URL validation
 * @param {string} url - URL to validate
 * @param {boolean} required - Whether URL is required
 * @returns {Object} - Validation result
 */
export function validateUrl(url, required = false) {
  if (!url || url.trim() === '') {
    return required
      ? { isValid: false, error: 'URL адресът е задължителен.' }
      : { isValid: true };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Моля, въведете валиден URL адрес.' };
  }
}

/**
 * Listing form validation
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with errors object
 */
export function validateListingForm(formData) {
  const errors = {};

  // Title
  const titleResult = validateLength(formData.title, 5, 200, 'Заглавието');
  if (!titleResult.isValid) errors.title = titleResult.error;

  // Description
  const descResult = validateLength(formData.description, 10, 5000, 'Описанието');
  if (!descResult.isValid) errors.description = descResult.error;

  // Price (optional but must be valid if provided)
  // Check for null/undefined (not provided) vs 0 or empty string
  if (formData.price !== null && formData.price !== undefined && formData.price !== '') {
    const priceResult = validatePrice(formData.price);
    if (!priceResult.isValid) errors.price = priceResult.error;
  }

  // Category
  if (!formData.category_id) {
    errors.category_id = 'Моля, изберете категория.';
  }

  // Location (optional)

  // Condition
  if (!formData.condition) {
    errors.condition = 'Моля, изберете състояние.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Registration form validation
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with errors object
 */
export function validateRegistrationForm(formData) {
  const errors = {};

  // Email
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) errors.email = emailResult.error;

  // Password
  const passwordResult = validatePassword(formData.password);
  if (!passwordResult.isValid) errors.password = passwordResult.error;

  // Confirm password
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Паролите не съвпадат.';
  }

  // Full name
  const nameResult = validateLength(formData.full_name, 2, 100, 'Името');
  if (!nameResult.isValid) errors.full_name = nameResult.error;

  // Phone
  const phoneResult = validatePhone(formData.phone);
  if (!phoneResult.isValid) errors.phone = phoneResult.error;

  // Terms
  if (!formData.acceptTerms) {
    errors.acceptTerms = 'Трябва да приемете общите условия.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Login form validation
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with errors object
 */
export function validateLoginForm(formData) {
  const errors = {};

  // Email
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) errors.email = emailResult.error;

  // Password
  const passwordResult = validateRequired(formData.password, 'Паролата');
  if (!passwordResult.isValid) errors.password = passwordResult.error;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Message form validation
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with errors object
 */
export function validateMessageForm(formData) {
  const errors = {};

  // Content
  const contentResult = validateLength(formData.content, 5, 2000, 'Съобщението');
  if (!contentResult.isValid) errors.content = contentResult.error;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  if (!input) return '';

  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate and sanitize multiple fields
 * @param {Object} data - Data object with fields
 * @param {Array} fields - Array of field names to sanitize
 * @returns {Object} - Sanitized data
 */
export function sanitizeFormData(data, fields) {
  const sanitized = { ...data };

  for (const field of fields) {
    if (sanitized[field]) {
      sanitized[field] = sanitizeInput(sanitized[field]);
    }
  }

  return sanitized;
}
