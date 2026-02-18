import { listingService } from '../../services/listings.js';
import { authService } from '../../services/auth.js';
import { storageService } from '../../services/storage.js';
import { validateListingForm, validateImages, transformNumericFields } from '../../utils/validators.js';
import { formatErrorMessage } from '../../utils/helpers.js';
import { supabase } from '../../utils/supabaseClient.js';

export class ListingEditPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listing = null;
    this.categories = [];
    this.locations = [];
    this.uploadedImages = [];
    this.existingImages = [];
  }

  async render() {
    // Check auth
    const session = await authService.getSession();
    if (!session) {
      window.router.navigate('/login');
      return;
    }

    // Get listing ID from params
    const listingId = this.params.id;
    if (!listingId) {
      this.showNotFound();
      return;
    }

    try {
      // Load data
      await this.loadData(listingId);

      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading page:', error);
      this.showError();
    }
  }

  async loadData(id) {
    const [categories, locations] = await Promise.all([
      listingService.getCategories(),
      listingService.getLocations('city')
    ]);

    this.categories = categories;
    this.locations = locations;

    // Load listing
    this.listing = await listingService.getListingById(id);

    if (!this.listing) {
      this.showNotFound();
      return;
    }

    // Check ownership
    const user = await authService.getUser();
    if (this.listing.user_id !== user.id) {
      window.showToast('Нямате право да редактирате тази обява.', 'error');
      window.router.navigate('/');
      return;
    }

    // Load existing images
    this.existingImages = [...(this.listing.listing_images || [])];
  }

  getTemplate() {
    const listing = this.listing;

    return `
      <div class="container py-4">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="card">
              <div class="card-header">
                <h1 class="h4 mb-0">
                  <i class="bi bi-pencil me-2"></i>Редактирай обява
                </h1>
              </div>
              <div class="card-body">
                <form id="listing-form" novalidate>
                  <!-- Title -->
                  <div class="mb-3">
                    <label for="listing-title" class="form-label">Заглавие *</label>
                    <input type="text" class="form-control" id="listing-title"
                      name="title" required minlength="5" maxlength="200"
                      value="${this.escapeHtml(listing.title || '')}">
                    <div class="invalid-feedback" id="title-error"></div>
                  </div>

                  <!-- Description -->
                  <div class="mb-3">
                    <label for="listing-description" class="form-label">Описание *</label>
                    <textarea class="form-control" id="listing-description"
                      name="description" required minlength="10" rows="6">${this.escapeHtml(listing.description || '')}</textarea>
                    <div class="invalid-feedback" id="description-error"></div>
                  </div>

                  <!-- Category & Condition Row -->
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="listing-category" class="form-label">Категория *</label>
                      <select class="form-select" id="listing-category" name="category_id" required>
                        <option value="">Изберете категория</option>
                        ${this.categories.map(cat => `
                          <option value="${cat.id}" ${listing.category_id === cat.id ? 'selected' : ''}>
                            ${this.escapeHtml(cat.name_bg)}
                          </option>
                        `).join('')}
                      </select>
                      <div class="invalid-feedback" id="category_id-error"></div>
                    </div>
                    <div class="col-md-6">
                      <label for="listing-condition" class="form-label">Състояние *</label>
                      <select class="form-select" id="listing-condition" name="condition" required>
                        <option value="">Изберете състояние</option>
                        <option value="new" ${listing.condition === 'new' ? 'selected' : ''}>Ново</option>
                        <option value="used" ${listing.condition === 'used' ? 'selected' : ''}>Използвано</option>
                        <option value="refurbished" ${listing.condition === 'refurbished' ? 'selected' : ''}>Реконструирано</option>
                      </select>
                      <div class="invalid-feedback" id="condition-error"></div>
                    </div>
                  </div>

                  <!-- Price & Location Row -->
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="listing-price" class="form-label">Цена (лв.)</label>
                      <input type="number" class="form-control" id="listing-price"
                        name="price" min="0" step="0.01"
                        value="${listing.price || ''}"
                        placeholder="Оставете празно за договаряне">
                      <div class="invalid-feedback" id="price-error"></div>
                    </div>
                    <div class="col-md-6">
                      <label for="listing-location" class="form-label">Локация</label>
                      <select class="form-select" id="listing-location" name="location_id">
                        <option value="">Изберете град</option>
                        ${this.locations.map(loc => `
                          <option value="${loc.id}" ${listing.location_id === loc.id ? 'selected' : ''}>
                            ${this.escapeHtml(loc.name_bg)}
                          </option>
                        `).join('')}
                      </select>
                    </div>
                  </div>

                  <!-- Images -->
                  <div class="mb-4">
                    <label class="form-label">Снимки</label>

                    <!-- Existing Images -->
                    ${this.existingImages.length > 0 ? `
                      <div class="row g-2 mb-3" id="existing-images">
                        ${this.existingImages.map((img, idx) => `
                          <div class="col-4 col-md-2 position-relative" data-idx="${idx}">
                            <img src="${img.url}" class="img-fluid rounded border"
                              style="aspect-ratio: 1; object-fit: cover;">
                            ${img.is_primary ? `
                              <span class="badge bg-primary position-absolute top-0 start-0 m-1">Основна</span>
                            ` : `
                              <button type="button" class="btn btn-sm btn-primary position-absolute top-0 start-0 m-1"
                                onclick="window.listingEdit.setPrimaryExistingImage(${idx})">
                                Основна
                              </button>
                            `}
                            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                              onclick="window.listingEdit.removeExistingImage(${idx})">
                              <i class="bi bi-x"></i>
                            </button>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}

                    <!-- New Image Upload -->
                    <div class="border rounded p-3 text-center">
                      <input type="file" id="image-input" class="d-none"
                        accept="image/jpeg,image/png,image/webp" multiple>
                      <label for="image-input" class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-cloud-upload me-2"></i>Добави снимки
                      </label>
                      <div class="form-text small">
                        Максимум 6 снимки общо. Използвайте първата снимка като основна.
                      </div>
                    </div>

                    <!-- New Image Previews -->
                    <div id="image-previews" class="row g-2 mt-2"></div>
                    <div id="images-error" class="text-danger small mt-1"></div>
                  </div>

                  <!-- Status -->
                  <div class="mb-4">
                    <label for="listing-status" class="form-label">Статус</label>
                    <select class="form-select" id="listing-status" name="status">
                      <option value="active" ${listing.status === 'active' ? 'selected' : ''}>Активна</option>
                      <option value="sold" ${listing.status === 'sold' ? 'selected' : ''}>Продадена</option>
                      <option value="draft" ${listing.status === 'draft' ? 'selected' : ''}>Чернова</option>
                    </select>
                  </div>

                  <!-- Submit -->
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary btn-lg flex-grow-1" id="submit-btn">
                      <i class="bi bi-check-lg me-2"></i>Запази промените
                    </button>
                    <a href="/listings/view?id=${listing.id}" class="btn btn-outline-secondary">
                      <i class="bi bi-x-lg me-2"></i>Отказ
                    </a>
                  </div>
                </form>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="card mt-3 border-danger">
              <div class="card-body">
                <h6 class="text-danger">Опасна зона</h6>
                <button class="btn btn-outline-danger btn-sm" id="delete-btn">
                  <i class="bi bi-trash me-2"></i>Изтрий обявата
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const form = document.getElementById('listing-form');
    const imageInput = document.getElementById('image-input');
    const deleteBtn = document.getElementById('delete-btn');

    // Make methods available globally
    window.listingEdit = {
      setPrimaryExistingImage: (idx) => this.setPrimaryExistingImage(idx),
      removeExistingImage: (idx) => this.removeExistingImage(idx),
      setPrimaryNewImage: (idx) => this.setPrimaryNewImage(idx),
      removeNewImage: (idx) => this.removeNewImage(idx)
    };

    // Image upload
    imageInput.addEventListener('change', (e) => {
      const totalImages = this.existingImages.length + this.uploadedImages.length;
      const remainingSlots = 6 - totalImages;
      if (remainingSlots <= 0) {
        document.getElementById('images-error').textContent = 'Максимум 6 снимки.';
        return;
      }

      const files = Array.from(e.target.files).slice(0, remainingSlots);
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.uploadedImages.push({
            file: file,
            preview: e.target.result,
            isPrimary: false
          });
          this.renderNewImagePreviews();
        };
        reader.readAsDataURL(file);
      }
    });

    // Submit form
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submitForm();
    });

    // Delete listing
    deleteBtn.addEventListener('click', () => this.deleteListing());
  }

  renderNewImagePreviews() {
    const container = document.getElementById('image-previews');
    container.innerHTML = this.uploadedImages.map((img, idx) => `
      <div class="col-4 col-md-2 position-relative">
        <img src="${img.preview}" class="img-fluid rounded border"
          style="aspect-ratio: 1; object-fit: cover;">
        <button type="button" class="btn btn-sm btn-primary position-absolute top-0 start-0 m-1"
          onclick="window.listingEdit.setPrimaryNewImage(${idx})">
          Основна
        </button>
        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
          onclick="window.listingEdit.removeNewImage(${idx})">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `).join('');
  }

  setPrimaryExistingImage(idx) {
    this.existingImages.forEach((img, i) => {
      img.is_primary = i === idx;
    });
    // Re-render existing images section
    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
  }

  removeExistingImage(idx) {
    // Mark for deletion (will be handled in submit)
    this.existingImages[idx]._delete = true;
    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
  }

  setPrimaryNewImage(idx) {
    // Remove primary from all existing images
    this.existingImages.forEach(img => img.is_primary = false);
    // Set primary on this new image
    this.uploadedImages.forEach((img, i) => {
      img.isPrimary = i === idx;
    });
    this.renderNewImagePreviews();
  }

  removeNewImage(idx) {
    this.uploadedImages.splice(idx, 1);
    this.renderNewImagePreviews();
  }

  async submitForm() {
    this.clearErrors();

    const formData = {
      title: document.getElementById('listing-title').value,
      description: document.getElementById('listing-description').value,
      category_id: document.getElementById('listing-category').value,
      condition: document.getElementById('listing-condition').value,
      price: document.getElementById('listing-price').value,
      location_id: document.getElementById('listing-location').value || null,
      status: document.getElementById('listing-status').value
    };

    // Transform empty numeric fields to null
    const processedData = transformNumericFields(formData, ['price']);

    const validation = validateListingForm(processedData);
    if (!validation.isValid) {
      this.showErrors(validation.errors);
      return;
    }

    this.setLoading(true);

    try {
      // Update listing
      const updated = await listingService.updateListing(this.listing.id, processedData);

      // Handle image deletions
      const toDelete = this.existingImages.filter(img => img._delete);
      for (const img of toDelete) {
        await storageService.deleteImage(img.storage_path);
        // Remove from database
        await this.deleteImageFromDB(img.id);
      }

      // Upload new images
      if (this.uploadedImages.length > 0) {
        for (const img of this.uploadedImages) {
          const uploaded = await storageService.uploadListingImage(img.file, this.listing.id);
          // Save to database
          await this.saveImageToDB({
            listing_id: this.listing.id,
            storage_path: uploaded.path,
            is_primary: img.isPrimary || false,
            order_index: 0
          });
        }
      }

      // Update primary image if needed
      const primaryImage = this.existingImages.find(img => img.is_primary && !img._delete)
        || this.uploadedImages.find(img => img.isPrimary);
      if (primaryImage) {
        // Reset all primary flags and set new one
        // (This would be handled by the storage service ideally)
      }

      window.showToast('Обявата е обновена успешно!', 'success');

      // Wait for database propagation before navigating
      setTimeout(() => {
        // window.router.navigate('/listings/view', {id: this.listing.id});
        window.router.navigate('/my-listings');
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      window.showToast(formatErrorMessage(error), 'error');
      this.setLoading(false);
    }
  }

  async deleteImageFromDB(imageId) {
    const { error } = await supabase
      .from('listing_images')
      .delete()
      .eq('id', imageId);
    if (error) throw error;
  }

  async saveImageToDB(imageData) {
    const { data, error } = await supabase
      .from('listing_images')
      .insert([imageData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteListing() {
    const confirmed = await new Promise(resolve => {
      if (confirm('Сигурни ли сте, че искате да изтриете тази обява? Това действие не може да бъде отменено.')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    if (!confirmed) return;

    try {
      await listingService.deleteListing(this.listing.id);
      window.showToast('Обявата е изтрита.', 'success');
      setTimeout(() => {
        window.router.navigate('/my-listings');
      }, 1000);
    } catch (error) {
      console.error('Delete error:', error);
      window.showToast(formatErrorMessage(error), 'error');
    }
  }

  showErrors(errors) {
    for (const [field, message] of Object.entries(errors)) {
      const input = document.getElementById(`listing-${field}`);
      const errorDiv = document.getElementById(`${field}-error`);
      if (input) input.classList.add('is-invalid');
      if (errorDiv) errorDiv.textContent = message;
    }
  }

  clearErrors() {
    const inputs = this.container.querySelectorAll('.is-invalid');
    inputs.forEach(input => input.classList.remove('is-invalid'));
    const errorDivs = this.container.querySelectorAll('.invalid-feedback');
    errorDivs.forEach(div => div.textContent = '');
  }

  setLoading(isLoading) {
    const submitBtn = document.getElementById('submit-btn');
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Запазване...';
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-check-lg me-2"></i>Запази промените';
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showNotFound() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-warning text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Обявата не е намерена.
        </div>
      </div>
    `;
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Възникна грешка при зареждане на страницата.
        </div>
      </div>
    `;
  }

  destroy() {
    delete window.listingEdit;
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default ListingEditPage;
