import { supabase } from '../utils/supabaseClient.js';
import { APP_CONFIG } from '../config.js';

const BUCKET_NAME = 'listing-images';
const CATEGORY_ICONS_BUCKET = 'category-icons';
const AVATARS_BUCKET = 'avatars';

export class StorageService {
  /**
   * Upload image to Supabase Storage
   * @param {File} file - The file to upload
   * @param {string} listingId - The listing ID for folder structure
   * @returns {Promise<Object>} - Object with path and url
   */
  async uploadListingImage(file, listingId) {
    // Validate file type
    if (!APP_CONFIG.supportedImageFormats.includes(file.type)) {
      throw new Error('Неподдържан формат. Използвайте JPG, PNG или WebP.');
    }

    // Validate file size
    if (file.size > APP_CONFIG.maxFileSize) {
      throw new Error(`Файлът е твърде голям. Максимум ${APP_CONFIG.maxFileSize / 1024 / 1024}MB.`);
    }

    // Create unique file path: listing-id/timestamp-filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${listingId}/${fileName}`;

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const url = this.getPublicUrl(filePath);

      return { path: filePath, url, ...data };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Грешка при качване на изображение. Моля, опитайте отново.');
    }
  }

  /**
   * Upload multiple images for a listing
   * @param {FileList|File[]} files - Array of files to upload
   * @param {string} listingId - The listing ID
   * @param {Function} onProgress - Progress callback (current, total)
   * @returns {Promise<Array>} - Array of uploaded image data
   */
  async uploadListingImages(files, listingId, onProgress = null) {
    const fileArray = Array.from(files);

    // Validate number of images
    if (fileArray.length > APP_CONFIG.maxImages) {
      throw new Error(`Максимум ${APP_CONFIG.maxImages} изображения.`);
    }

    if (fileArray.length === 0) {
      return [];
    }

    const uploadedImages = [];

    // Upload sequentially to track progress
    for (let i = 0; i < fileArray.length; i++) {
      try {
        const result = await this.uploadListingImage(fileArray[i], listingId);
        uploadedImages.push({
          ...result,
          orderIndex: i,
          isPrimary: i === 0
        });

        if (onProgress) {
          onProgress(i + 1, fileArray.length);
        }
      } catch (error) {
        // Clean up previously uploaded images on error
        await this.deleteListingImages(listingId);
        throw error;
      }
    }

    return uploadedImages;
  }

  /**
   * Delete image from Supabase Storage
   * @param {string} storagePath - The storage path of the image
   * @returns {Promise<void>}
   */
  async deleteImage(storagePath) {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Delete image error:', error);
      throw new Error('Грешка при изтриване на изображение.');
    }
  }

  /**
   * Delete all images for a listing
   * @param {string} listingId - The listing ID
   * @returns {Promise<void>}
   */
  async deleteListingImages(listingId) {
    try {
      // List all files in the listing's folder
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(listingId);

      if (listError) {
        // If folder doesn't exist, we're done
        if (listError.message?.includes('not found')) {
          return;
        }
        throw listError;
      }

      if (files && files.length > 0) {
        const paths = files.map(f => `${listingId}/${f.name}`);
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(paths);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Delete listing images error:', error);
      // Don't throw - cleanup failures shouldn't block operations
    }
  }

  /**
   * Get public URL for an image
   * @param {string} storagePath - The storage path
   * @returns {string} - Public URL
   */
  getPublicUrl(storagePath) {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    return data.publicUrl;
  }

  /**
   * Get signed URL for private operations
   * @param {string} storagePath - The storage path
   * @param {number} expiresIn - Seconds until expiration (default: 60)
   * @returns {Promise<string>} - Signed URL
   */
  async getSignedUrl(storagePath, expiresIn = 60) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(storagePath, expiresIn);

      if (error) throw error;

      return data.signedUrl;
    } catch (error) {
      console.error('Get signed URL error:', error);
      throw error;
    }
  }

  /**
   * Validate image file
   * @param {File} file - File to validate
   * @returns {Object} - Validation result with isValid and error
   */
  validateImageFile(file) {
    if (!file) {
      return { isValid: false, error: 'Моля, изберете файл.' };
    }

    if (!APP_CONFIG.supportedImageFormats.includes(file.type)) {
      return { isValid: false, error: 'Неподдържан формат. Използвайте JPG, PNG или WebP.' };
    }

    if (file.size > APP_CONFIG.maxFileSize) {
      return { isValid: false, error: `Файлът е твърде голям. Максимум ${APP_CONFIG.maxFileSize / 1024 / 1024}MB.` };
    }

    return { isValid: true };
  }

  /**
   * Create a preview URL for an image file
   * @param {File} file - Image file
   * @returns {string} - Object URL for preview
   */
  createPreviewUrl(file) {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke a preview URL
   * @param {string} url - Object URL to revoke
   */
  revokePreviewUrl(url) {
    URL.revokeObjectURL(url);
  }

  /**
   * Get image dimensions
   * @param {File} file - Image file
   * @returns {Promise<Object>} - Object with width and height
   */
  async getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = this.createPreviewUrl(file);

      img.onload = () => {
        this.revokePreviewUrl(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        this.revokePreviewUrl(url);
        reject(new Error('Неуспешно зареждане на изображение.'));
      };

      img.src = url;
    });
  }

  /**
   * Upload category icon to Supabase Storage
   * @param {File} file - The icon file to upload
   * @param {string} categoryId - The category ID
   * @returns {Promise<string>} - Public URL of the uploaded icon
   */
  async uploadCategoryIcon(file, categoryId) {
    // Validate inputs
    if (!file) {
      throw new Error('Няма избран файл.');
    }
    if (!categoryId) {
      throw new Error('Липсва ID на категорията.');
    }

    // Validate file type
    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!supportedFormats.includes(file.type)) {
      throw new Error('Неподдържан формат. Използвайте JPG, PNG, WebP или SVG.');
    }

    // Validate file size (max 2MB for icons)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Файлът е твърде голям. Максимум 2MB.');
    }

    // Create unique file path with timestamp to prevent caching issues
    const fileExt = file.name.split('.').pop() || 'png';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `icon-${timestamp}-${randomSuffix}.${fileExt}`;
    const filePath = `${categoryId}/${fileName}`;

    try {
      console.log('Starting icon upload:', { categoryId, fileName, fileType: file.type, fileSize: file.size });

      // Upload to Supabase Storage (don't use upsert, use unique filename)
      const { data, error } = await supabase.storage
        .from(CATEGORY_ICONS_BUCKET)
        .upload(filePath, file, {
          cacheControl: 'no-cache',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Грешка при качване: ${error.message}`);
      }

      console.log('Upload successful:', data);

      // Get public URL with cache-busting query parameter
      const { data: urlData } = supabase.storage
        .from(CATEGORY_ICONS_BUCKET)
        .getPublicUrl(filePath);

      // Add timestamp to URL to bust browser cache
      const cacheBustedUrl = `${urlData.publicUrl}?t=${timestamp}`;
      console.log('Icon URL:', cacheBustedUrl);

      // Clean up old icons AFTER successful upload (don't await, do in background)
      this._cleanupOldIcons(categoryId, fileName).catch(err => {
        console.warn('Failed to cleanup old icons:', err);
      });

      return cacheBustedUrl;
    } catch (error) {
      console.error('Upload category icon error:', error);
      throw error.message ? error : new Error('Грешка при качване на иконата. Моля, опитайте отново.');
    }
  }

  /**
   * Clean up old icons for a category (except the current one)
   * @private
   * @param {string} categoryId - The category ID
   * @param {string} currentFileName - The current file name to keep
   */
  async _cleanupOldIcons(categoryId, currentFileName) {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(CATEGORY_ICONS_BUCKET)
        .list(categoryId);

      if (listError || !files || files.length === 0) {
        return;
      }

      // Find old files to delete (exclude current file)
      const filesToDelete = files
        .filter(f => f.name !== currentFileName)
        .map(f => `${categoryId}/${f.name}`);

      if (filesToDelete.length > 0) {
        console.log('Cleaning up old icons:', filesToDelete);
        const { error } = await supabase.storage
          .from(CATEGORY_ICONS_BUCKET)
          .remove(filesToDelete);

        if (error) {
          console.warn('Failed to delete old icons:', error);
        }
      }
    } catch (err) {
      console.warn('Cleanup error:', err);
    }
  }

  /**
   * Delete category icon from storage
   * @param {string} categoryId - The category ID
   * @returns {Promise<void>}
   */
  async deleteCategoryIcon(categoryId) {
    try {
      // List files in the category folder
      const { data: files, error: listError } = await supabase.storage
        .from(CATEGORY_ICONS_BUCKET)
        .list(categoryId);

      if (listError) {
        // If folder doesn't exist, we're done
        if (listError.message?.includes('not found')) {
          return;
        }
        throw listError;
      }

      if (files && files.length > 0) {
        const paths = files.map(f => `${categoryId}/${f.name}`);
        const { error } = await supabase.storage
          .from(CATEGORY_ICONS_BUCKET)
          .remove(paths);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Delete category icon error:', error);
      // Don't throw - cleanup failures shouldn't block operations
    }
  }

  /**
   * Upload user avatar to Supabase Storage
   * @param {File} file - The avatar file to upload
   * @param {string} userId - The user ID
   * @returns {Promise<string>} - Public URL of the uploaded avatar
   */
  async uploadAvatar(file, userId) {
    // Validate inputs
    if (!file) {
      throw new Error('Няма избран файл.');
    }
    if (!userId) {
      throw new Error('Липсва ID на потребителя.');
    }

    // Validate file type
    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedFormats.includes(file.type)) {
      throw new Error('Неподдържан формат. Използвайте JPG, PNG, WebP или GIF.');
    }

    // Validate file size (max 2MB for avatars)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Файлът е твърде голям. Максимум 2MB.');
    }

    // Create unique file path with timestamp to prevent caching issues
    const fileExt = file.name.split('.').pop() || 'png';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `avatar-${timestamp}-${randomSuffix}.${fileExt}`;

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(fileName, file, {
          cacheControl: 'no-cache',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Грешка при качване: ${error.message}`);
      }

      // Get public URL with cache-busting query parameter
      const { data: urlData } = supabase.storage
        .from(AVATARS_BUCKET)
        .getPublicUrl(fileName);

      // Add timestamp to URL to bust browser cache
      const cacheBustedUrl = `${urlData.publicUrl}?t=${timestamp}`;

      // Clean up old avatars AFTER successful upload (don't await, do in background)
      this._cleanupOldAvatars(userId, fileName).catch(err => {
        console.warn('Failed to cleanup old avatars:', err);
      });

      return cacheBustedUrl;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error.message ? error : new Error('Грешка при качване на аватара. Моля, опитайте отново.');
    }
  }

  /**
   * Clean up old avatars for a user (except the current one)
   * @private
   * @param {string} userId - The user ID
   * @param {string} currentFileName - The current file name to keep
   */
  async _cleanupOldAvatars(userId, currentFileName) {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .list();

      if (listError || !files || files.length === 0) {
        return;
      }

      // Find old files to delete (exclude current file)
      const filesToDelete = files
        .filter(f => f.name !== currentFileName)
        .map(f => f.name);

      if (filesToDelete.length > 0) {
        console.log('Cleaning up old avatars:', filesToDelete);
        const { error } = await supabase.storage
          .from(AVATARS_BUCKET)
          .remove(filesToDelete);

        if (error) {
          console.warn('Failed to delete old avatars:', error);
        }
      }
    } catch (err) {
      console.warn('Cleanup error:', err);
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
