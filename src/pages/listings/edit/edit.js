import '../create/listing-form.css';
import './edit.css';
import { listingService } from '../../../scripts/services/listings.js';
import { storageService } from '../../../scripts/services/storage.js';
import { supabase } from '../../../scripts/utils/supabaseClient.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { validateListingForm, validateImages, transformNumericFields } from '../../../scripts/utils/validators.js';
import { formatFileSize } from '../../../scripts/utils/formatters.js';

export class ListingEditPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listingId = params.id;
    this.listing = null;
    this.categories = [];
    this.locations = [];
    this.existingImages = [];
    this.selectedImages = [];
    this.primaryImageIndex = 0;
    this.imagesToDelete = [];
  }

  async render() {
    if (!this.listingId) {
      window.router.navigate('/my-listings');
      return;
    }

    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.populateForm();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading edit page:', error);
      this.showError();
    }
  }

  async loadData() {
    const [listing, categories, locations] = await Promise.all([
      listingService.getListingById(this.listingId),
      listingService.getCategories(),
      listingService.getLocations()
    ]);

    this.listing = listing;
    this.categories = categories;
    this.locations = locations;
    this.existingImages = listing.listing_images || [];
  }

  getLoadingTemplate() {
    return `
      <div class="container py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане...</p>
        </div>
      </div>
    `;
  }

  getTemplate() {
    return `
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card shadow">
              <div class="card-header bg-white">
                <h2 class="h4 mb-0">
                  <i class="bi bi-pencil text-primary me-2"></i>
                  Редактиране на обява
                </h2>
              </div>
              <div class="card-body p-4">
                <form id="listing-form" enctype="multipart/form-data">
                  <!-- Title -->
                  <div class="mb-3">
                    <label for="title" class="form-label">Заглавие *</label>
                    <input type="text" class="form-control" id="title" name="title"
                      placeholder="Напр. Фреза въртяща се 50мм" maxlength="200" required>
                    <div class="form-text">Между 5 и 200 символа</div>
                    <div class="invalid-feedback" id="title-error"></div>
                  </div>

                  <!-- Description -->
                  <div class="mb-3">
                    <label for="description" class="form-label">Описание *</label>
                    <textarea class="form-control" id="description" name="description" rows="5"
                      placeholder="Опишете детайлно какво продавате..." maxlength="5000" required></textarea>
                    <div class="form-text">Между 10 и 5000 символа</div>
                    <div class="invalid-feedback" id="description-error"></div>
                  </div>

                  <div class="row">
                    <!-- Category -->
                    <div class="col-md-6 mb-3">
                      <label for="category_id" class="form-label">Категория *</label>
                      <select class="form-select" id="category_id" name="category_id" required>
                        <option value="">Изберете категория</option>
                        ${this.categories.map(cat => `
                          <option value="${cat.id}">${this.escapeHtml(cat.name_bg)}</option>
                        `).join('')}
                      </select>
                      <div class="invalid-feedback" id="category_id-error"></div>
                    </div>

                    <!-- Location -->
                    <div class="col-md-6 mb-3">
                      <label for="location_id" class="form-label">Локация</label>
                      <select class="form-select" id="location_id" name="location_id">
                        <option value="">Изберете локация</option>
                        ${this.locations.map(loc => `
                          <option value="${loc.id}">${this.escapeHtml(loc.name_bg)}</option>
                        `).join('')}
                      </select>
                    </div>
                  </div>

                  <div class="row">
                    <!-- Price -->
                    <div class="col-md-6 mb-3">
                      <label for="price" class="form-label">Цена (лв.)</label>
                      <div class="input-group">
                        <input type="number" class="form-control" id="price" name="price"
                          placeholder="0.00" min="0" step="0.01" max="9999999.99">
                        <span class="input-group-text">лв.</span>
                      </div>
                      <div class="form-text">Оставете празно за "По договаряне"</div>
                      <div class="invalid-feedback" id="price-error"></div>
                    </div>

                    <!-- Condition -->
                    <div class="col-md-6 mb-3">
                      <label for="condition" class="form-label">Състояние *</label>
                      <select class="form-select" id="condition" name="condition" required>
                        <option value="">Изберете състояние</option>
                        <option value="new">Ново</option>
                        <option value="used">Използвано</option>
                        <option value="refurbished">Реконструирано</option>
                      </select>
                      <div class="invalid-feedback" id="condition-error"></div>
                    </div>
                  </div>

                  <!-- Existing Images -->
                  <div class="mb-3">
                    <label class="form-label">Текущи снимки</label>
                    <div id="existing-images" class="row g-2">
                      ${this.existingImages.length > 0 ? '' : '<p class="text-muted">Няма качени снимки</p>'}
                    </div>
                  </div>

                  <!-- New Images -->
                  <div class="mb-4">
                    <label class="form-label">Добавете нови снимки (до 5 общо)</label>
                    <div id="drop-zone" class="drop-zone p-4 text-center border rounded mb-3">
                      <i class="bi bi-cloud-upload display-4 text-muted"></i>
                      <p class="mb-1">Плъзнете снимки тук или</p>
                      <input type="file" class="d-none" id="images" name="images"
                        accept="image/jpeg,image/png,image/webp" multiple>
                      <button type="button" class="btn btn-outline-primary btn-sm" id="browse-btn">
                        <i class="bi bi-folder me-1"></i> Изберете файлове
                      </button>
                      <div class="form-text mt-2">JPG, PNG или WebP. Максимум 5MB всяка.</div>
                    </div>

                    <!-- New Image Previews -->
                    <div id="image-previews" class="row g-2">
                      <!-- Previews will be rendered here -->
                    </div>
                  </div>

                  <!-- Submit Buttons -->
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary flex-grow-1" id="submit-btn">
                      <i class="bi bi-check-circle me-1"></i> Запази промените
                    </button>
                    <button type="button" class="btn btn-danger" id="delete-btn">
                      <i class="bi bi-trash me-1"></i> Изтрий
                    </button>
                    <a href="/my-listings" class="btn btn-outline-secondary">
                      <i class="bi bi-x-circle me-1"></i> Отказ
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  populateForm() {
    if (!this.listing) return;

    document.getElementById('title').value = this.listing.title || '';
    document.getElementById('description').value = this.listing.description || '';
    document.getElementById('category_id').value = this.listing.category_id || '';
    document.getElementById('location_id').value = this.listing.location_id || '';
    document.getElementById('price').value = this.listing.price || '';
    document.getElementById('condition').value = this.listing.condition || '';

    // Render existing images
    this.renderExistingImages();
  }

  renderExistingImages() {
    const container = document.getElementById('existing-images');
    if (!container) return;

    if (this.existingImages.length === 0) {
      container.innerHTML = '<p class="text-muted">Няма качени снимки</p>';
      return;
    }

    container.innerHTML = this.existingImages.map((img, index) => `
      <div class="col-4 col-sm-3 col-md-2" data-existing-index="${index}">
        <div class="position-relative">
          <img src="${img.url}"
            class="img-thumbnail thumbnail ${img.is_primary ? 'border-primary' : ''}"
            alt="Preview">
          <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
            data-delete-existing="${index}">
            <i class="bi bi-x"></i>
          </button>
          ${img.is_primary ? '<span class="badge bg-primary position-absolute bottom-0 start-0 m-1">Основна</span>' : ''}
        </div>
      </div>
    `).join('');

    // Attach event listeners for existing images
    container.querySelectorAll('[data-delete-existing]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.deleteExisting);
        this.markImageForDeletion(index);
      });
    });
  }

  markImageForDeletion(index) {
    const image = this.existingImages[index];
    this.imagesToDelete.push(image.id);
    this.existingImages.splice(index, 1);
    this.renderExistingImages();
  }

  attachEventListeners() {
    const form = document.getElementById('listing-form');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('images');
    const browseBtn = document.getElementById('browse-btn');
    const deleteBtn = document.getElementById('delete-btn');

    // Browse button
    if (browseBtn) {
      browseBtn.addEventListener('click', () => fileInput.click());
    }

    // File input change
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleImageSelect(e.target.files));
    }

    // Drag and drop
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        this.handleImageSelect(e.dataTransfer.files);
      });
    }

    // Form submission
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSubmit();
      });
    }

    // Delete listing
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        Toast.confirm('Сигурни ли сте, че искате да изтриете тази обява?', async () => {
          await this.handleDelete();
        });
      });
    }
  }

  handleImageSelect(files) {
    const totalImages = this.existingImages.length + this.selectedImages.length + files.length;

    if (totalImages > 5) {
      Toast.warning('Максимум 5 изображения общо');
      return;
    }

    Array.from(files).forEach(file => {
      const validation = storageService.validateImageFile(file);
      if (validation.isValid) {
        this.selectedImages.push(file);
      } else {
        Toast.error(`${file.name}: ${validation.error}`);
      }
    });

    this.renderImagePreviews();
  }

  renderImagePreviews() {
    const container = document.getElementById('image-previews');
    if (!container) return;

    if (this.selectedImages.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = this.selectedImages.map((file, index) => `
      <div class="col-4 col-sm-3 col-md-2">
        <div class="position-relative">
          <img src="${URL.createObjectURL(file)}"
            class="img-thumbnail thumbnail"
            alt="Preview">
          <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
            data-remove="${index}">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <small class="text-muted d-block text-truncate">${file.name}</small>
      </div>
    `).join('');

    // Attach event listeners
    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.remove);
        this.selectedImages.splice(index, 1);
        this.renderImagePreviews();
      });
    });
  }

  async handleSubmit() {
    const submitBtn = document.getElementById('submit-btn');

    // Get form data
    const formData = {
      title: document.getElementById('title').value.trim(),
      description: document.getElementById('description').value.trim(),
      category_id: document.getElementById('category_id').value,
      location_id: document.getElementById('location_id').value || null,
      price: document.getElementById('price').value,
      condition: document.getElementById('condition').value
    };

    // Transform numeric fields
    const transformedData = transformNumericFields(formData, ['price']);

    // Validate
    const validation = validateListingForm(transformedData);
    if (!validation.isValid) {
      this.showErrors(validation.errors);
      return;
    }

    // Clear errors
    this.clearErrors();

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Запазване...';

    try {
      // Update listing metadata
      await listingService.updateListing(this.listingId, transformedData);

      // Handle image updates (delete removed, upload new)
      await this.handleImageUpdates();

      Toast.success('Промените са запазени!');

      // Navigate to my-listings
      window.router.navigate('/my-listings');
    } catch (error) {
      console.error('Update listing error:', error);
      Toast.error(error.message || 'Грешка при запазване.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Запази промените';
    }
  }

  async handleImageUpdates() {
    // 1. Delete images marked for deletion
    for (const imageId of this.imagesToDelete) {
      const image = this.listing.listing_images.find(img => img.id === imageId);
      if (image) {
        // Delete from database
        const { error: dbError } = await supabase
          .from('listing_images')
          .delete()
          .eq('id', imageId);

        if (dbError) {
          console.error('Error deleting image from database:', dbError);
        }

        // Delete from storage
        try {
          await storageService.deleteImage(image.storage_path);
        } catch (storageError) {
          console.error('Error deleting image from storage:', storageError);
        }
      }
    }

    // 2. Upload new images
    if (this.selectedImages.length > 0) {
      const uploadedImages = await storageService.uploadListingImages(
        this.selectedImages,
        this.listingId
      );

      // 3. Insert new image records
      if (uploadedImages.length > 0) {
        // Calculate starting order_index based on remaining existing images
        const startingIndex = this.existingImages.length;

        const { error: insertError } = await supabase
          .from('listing_images')
          .insert(
            uploadedImages.map((img, i) => ({
              listing_id: this.listingId,
              storage_path: img.path,
              order_index: startingIndex + i,
              is_primary: startingIndex === 0 && i === 0 // First image is primary if no existing images
            }))
          );

        if (insertError) {
          console.error('Error inserting new images:', insertError);
          throw new Error('Грешка при запазване на новите снимки.');
        }

        // 4. Update primary image if needed (no existing images and we have new ones)
        if (startingIndex === 0 && uploadedImages.length > 0) {
          // The first new image was already marked as primary in the insert
          // No additional action needed
        }
      }
    }

    // 5. Ensure at least one primary image exists if there are images
    await this.ensurePrimaryImage();
  }

  async ensurePrimaryImage() {
    // Get current images for this listing
    const { data: currentImages, error } = await supabase
      .from('listing_images')
      .select('id, is_primary, order_index')
      .eq('listing_id', this.listingId)
      .order('order_index', { ascending: true });

    if (error || !currentImages || currentImages.length === 0) {
      return; // No images or error, nothing to do
    }

    // Check if any image is primary
    const hasPrimary = currentImages.some(img => img.is_primary);

    if (!hasPrimary) {
      // Set the first image (by order_index) as primary
      const firstImage = currentImages[0];
      await supabase
        .from('listing_images')
        .update({ is_primary: true })
        .eq('id', firstImage.id);
    }
  }

  async handleDelete() {
    try {
      await listingService.deleteListing(this.listingId);
      Toast.success('Обявата е изтрита!');
      window.router.navigate('/my-listings');
    } catch (error) {
      console.error('Delete listing error:', error);
      Toast.error(error.message || 'Грешка при изтриване.');
    }
  }

  showErrors(errors) {
    this.clearErrors();

    for (const [field, message] of Object.entries(errors)) {
      const input = document.getElementById(field);
      const errorDiv = document.getElementById(`${field}-error`);

      if (input) {
        input.classList.add('is-invalid');
      }

      if (errorDiv) {
        errorDiv.textContent = message;
      }
    }
  }

  clearErrors() {
    const inputs = document.querySelectorAll('.is-invalid');
    inputs.forEach(input => input.classList.remove('is-invalid'));

    const errorDivs = document.querySelectorAll('.invalid-feedback');
    errorDivs.forEach(div => div.textContent = '');
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на обявата.
        </div>
        <div class="text-center">
          <a href="/my-listings" class="btn btn-primary">Към моите обяви</a>
        </div>
      </div>
    `;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default ListingEditPage;
