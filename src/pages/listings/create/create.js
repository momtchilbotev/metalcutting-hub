import './listing-form.css';
import { listingService } from '../../../scripts/services/listings.js';
import { storageService } from '../../../scripts/services/storage.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { validateListingForm, validateImages, transformNumericFields } from '../../../scripts/utils/validators.js';
import { formatFileSize } from '../../../scripts/utils/formatters.js';

export class ListingCreatePage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.categories = [];
    this.locations = [];
    this.selectedImages = [];
    this.primaryImageIndex = 0;
    this.userRole = 'user';
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading create page:', error);
      this.showError();
    }
  }

  async loadData() {
    const [categories, locations, userRole] = await Promise.all([
      listingService.getCategories(),
      listingService.getLocations(),
      listingService.getUserRole()
    ]);

    this.categories = categories;
    this.locations = locations;
    this.userRole = userRole;
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
                  <i class="bi bi-plus-circle text-primary me-2"></i>
                  Нова обява
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

                  <!-- Images -->
                  <div class="mb-4">
                    <label class="form-label">Снимки (до 5)</label>
                    <div class="form-text mb-2">Първата снимка ще бъде основна.</div>
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

                    <!-- Image Previews -->
                    <div id="image-previews" class="row g-2">
                      <!-- Previews will be rendered here -->
                    </div>
                  </div>

                  <!-- Options -->
                  <div class="mb-4">
                    <div class="form-check mb-2">
                      <input class="form-check-input" type="checkbox" id="listing-featured"
                        name="is_featured">
                      <label class="form-check-label" for="listing-featured">
                        <i class="bi bi-star-fill text-warning me-1"></i>
                        Препоръчана обява
                      </label>
                      <div class="form-text">Платена опция за по-добра видимост.</div>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="listing-urgent"
                        name="is_urgent">
                      <label class="form-check-label" for="listing-urgent">
                        <i class="bi bi-exclamation-triangle-fill text-danger me-1"></i>
                        Спешна обява
                      </label>
                      <div class="form-text">Забележи, че продавате спешно.</div>
                    </div>
                  </div>

                  <!-- Submit Buttons -->
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary flex-grow-1" id="submit-btn">
                      <i class="bi bi-check-circle me-1"></i> ${this.userRole === 'user' ? 'Изпрати за одобрение' : 'Публикувай'}
                    </button>
                    <button type="button" class="btn btn-outline-secondary" id="save-draft-btn">
                      <i class="bi bi-save me-1"></i> Запази чернова
                    </button>
                    <a href="/listings" class="btn btn-outline-secondary">
                      <i class="bi bi-x-circle me-1"></i> Отказ
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-4">
          <a href="/my-listings" class="text-decoration-none">← Назад към моите обяви</a>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const form = document.getElementById('listing-form');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('images');
    const browseBtn = document.getElementById('browse-btn');
    const saveDraftBtn = document.getElementById('save-draft-btn');

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

      dropZone.addEventListener('click', (e) => {
        if (e.target !== browseBtn) {
          fileInput.click();
        }
      });
    }

    // Form submission
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSubmit('active');
      });
    }

    // Save draft
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', async () => {
        await this.handleSubmit('draft');
      });
    }
  }

  handleImageSelect(files) {
    const validation = validateImages([...this.selectedImages, ...Array.from(files)]);

    if (!validation.isValid) {
      Toast.error(validation.error);
      return;
    }

    // Add new files
    Array.from(files).forEach(file => {
      if (this.selectedImages.length >= 5) {
        Toast.warning('Максимум 5 изображения');
        return;
      }

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
            class="img-thumbnail thumbnail ${index === this.primaryImageIndex ? 'border-primary' : ''}"
            alt="Preview" data-index="${index}">
          <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
            data-remove="${index}">
            <i class="bi bi-x"></i>
          </button>
          ${index === this.primaryImageIndex ? '<span class="badge bg-primary position-absolute bottom-0 start-0 m-1">Основна</span>' : ''}
        </div>
        <small class="text-muted d-block text-truncate">${file.name}</small>
        <small class="text-muted">${formatFileSize(file.size)}</small>
      </div>
    `).join('');

    // Attach event listeners
    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.remove);
        this.removeImage(index);
      });
    });

    container.querySelectorAll('.thumbnail').forEach(img => {
      img.addEventListener('click', () => {
        this.primaryImageIndex = parseInt(img.dataset.index);
        this.renderImagePreviews();
      });
    });
  }

  removeImage(index) {
    this.selectedImages.splice(index, 1);

    // Adjust primary image index
    if (this.primaryImageIndex >= this.selectedImages.length) {
      this.primaryImageIndex = Math.max(0, this.selectedImages.length - 1);
    }

    this.renderImagePreviews();
  }

  async handleSubmit(status) {
    const submitBtn = document.getElementById('submit-btn');
    const saveDraftBtn = document.getElementById('save-draft-btn');

    // Get form data
    const formData = {
      title: document.getElementById('title').value.trim(),
      description: document.getElementById('description').value.trim(),
      category_id: document.getElementById('category_id').value,
      location_id: document.getElementById('location_id').value || null,
      price: document.getElementById('price').value,
      condition: document.getElementById('condition').value,
      is_featured: document.getElementById('listing-featured')?.checked || false,
      is_urgent: document.getElementById('listing-urgent')?.checked || false
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
    const loadingBtn = status === 'active' || status === 'pending' ? submitBtn : saveDraftBtn;
    loadingBtn.disabled = true;
    loadingBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Запазване...';

    try {
      // Create listing
      const listing = await listingService.createListing(
        { ...transformedData, status },
        this.selectedImages
      );

      // Show appropriate success message based on role and status
      if (status === 'draft') {
        Toast.success('Черновата е запазена!');
      } else if (this.userRole === 'user') {
        Toast.success('Вашата обява е изпратена за одобрение!');
      } else {
        Toast.success('Обявата е публикувана!');
      }

      // Navigate to listing details
      window.router.navigate(`/listings/view?id=${listing.id}`);
    } catch (error) {
      console.error('Create listing error:', error);
      Toast.error(error.message || 'Грешка при създаване на обявата.');
      loadingBtn.disabled = false;
      loadingBtn.innerHTML = this.userRole === 'user'
        ? '<i class="bi bi-check-circle me-1"></i> Изпрати за одобрение'
        : '<i class="bi bi-check-circle me-1"></i> Публикувай';
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
          Грешка при зареждане.
        </div>
        <div class="text-center">
          <a href="/listings" class="btn btn-primary">Към обявите</a>
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
    // Clean up object URLs
    this.selectedImages.forEach(file => {
      // URLs are created in renderImagePreviews
    });

    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default ListingCreatePage;
