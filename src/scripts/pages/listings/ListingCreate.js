import { listingService } from '../../services/listings.js';
import { authService } from '../../services/auth.js';
import { storageService } from '../../services/storage.js';
import { validateListingForm, validateImages, transformNumericFields } from '../../utils/validators.js';
import { formatErrorMessage } from '../../utils/helpers.js';

export class ListingCreatePage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.categories = [];
    this.locations = [];
    this.uploadedImages = [];
  }

  async render() {
    // Check auth
    const session = await authService.getSession();
    if (!session) {
      window.router.navigate('/login');
      return;
    }

    try {
      // Load data
      await this.loadData();

      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading page:', error);
      this.showError();
    }
  }

  async loadData() {
    const [categories, locations] = await Promise.all([
      listingService.getCategories(),
      listingService.getLocations('city')
    ]);

    this.categories = categories;
    this.locations = locations;
  }

  getTemplate() {
    return `
      <div class="container py-4">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="card">
              <div class="card-header">
                <h1 class="h4 mb-0">
                  <i class="bi bi-plus-circle me-2"></i>Нова обява
                </h1>
              </div>
              <div class="card-body">
                <form id="listing-form" novalidate>
                  <!-- Title -->
                  <div class="mb-3">
                    <label for="listing-title" class="form-label">Заглавие *</label>
                    <input type="text" class="form-control" id="listing-title"
                      name="title" required minlength="5" maxlength="200"
                      placeholder="напр. Резбофрези M6 HSS">
                    <div class="form-text">Между 5 и 200 символа.</div>
                    <div class="invalid-feedback" id="title-error"></div>
                  </div>

                  <!-- Description -->
                  <div class="mb-3">
                    <label for="listing-description" class="form-label">Описание *</label>
                    <textarea class="form-control" id="listing-description"
                      name="description" required minlength="10" rows="6"
                      placeholder="Опишете детайлно продукта..."></textarea>
                    <div class="form-text">Между 10 и 5000 символа.</div>
                    <div class="invalid-feedback" id="description-error"></div>
                  </div>

                  <!-- Category & Condition Row -->
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="listing-category" class="form-label">Категория *</label>
                      <select class="form-select" id="listing-category" name="category_id" required>
                        <option value="">Изберете категория</option>
                        ${this.categories.map(cat => `
                          <option value="${cat.id}">${this.escapeHtml(cat.name_bg)}</option>
                        `).join('')}
                      </select>
                      <div class="invalid-feedback" id="category_id-error"></div>
                    </div>
                    <div class="col-md-6">
                      <label for="listing-condition" class="form-label">Състояние *</label>
                      <select class="form-select" id="listing-condition" name="condition" required>
                        <option value="">Изберете състояние</option>
                        <option value="new">Ново</option>
                        <option value="used">Използвано</option>
                        <option value="refurbished">Реконструирано</option>
                      </select>
                      <div class="invalid-feedback" id="condition-error"></div>
                    </div>
                  </div>

                  <!-- Price & Location Row -->
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="listing-price" class="form-label">Цена (лв.)</label>
                      <input type="number" class="form-control" id="listing-price"
                        name="price" min="0" step="0.01" placeholder="Оставете празно за договаряне">
                      <div class="invalid-feedback" id="price-error"></div>
                    </div>
                    <div class="col-md-6">
                      <label for="listing-location" class="form-label">Локация</label>
                      <select class="form-select" id="listing-location" name="location_id">
                        <option value="">Изберете град</option>
                        ${this.locations.map(loc => `
                          <option value="${loc.id}">${this.escapeHtml(loc.name_bg)}</option>
                        `).join('')}
                      </select>
                    </div>
                  </div>

                  <!-- Images Upload -->
                  <div class="mb-4">
                    <label class="form-label">Снимки</label>
                    <div class="border rounded p-4 text-center" id="drop-zone">
                      <input type="file" id="image-input" class="d-none"
                        accept="image/jpeg,image/png,image/webp" multiple>
                      <label for="image-input" class="btn btn-outline-primary">
                        <i class="bi bi-cloud-upload me-2"></i>Изберете снимки
                      </label>
                      <span class="mx-2">или</span>
                      <button type="button" class="btn btn-outline-secondary" id="paste-image-btn">
                        <i class="bi bi-clipboard me-2"></i>Поставете от клипборда
                      </button>
                      <div class="form-text mt-2">
                        Максимум 6 снимки, до 5MB всяка. JPG, PNG или WebP.
                        Първата снимка ще бъде основна.
                      </div>
                    </div>

                    <!-- Image Previews -->
                    <div id="image-previews" class="row g-2 mt-2">
                      <!-- Previews will be added here -->
                    </div>

                    <div id="images-error" class="text-danger small mt-1"></div>
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

                  <!-- Submit -->
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary btn-lg flex-grow-1" id="submit-btn">
                      <i class="bi bi-check-lg me-2"></i>Публикувай обявата
                    </button>
                    <button type="button" class="btn btn-outline-secondary" id="save-draft-btn">
                      <i class="bi bi-file-earmark me-2"></i>Чернова
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Back -->
            <div class="mt-3">
              <a href="/my-listings" class="text-decoration-none">
                <i class="bi bi-arrow-left me-2"></i>Назад към моите обяви
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const form = document.getElementById('listing-form');
    const imageInput = document.getElementById('image-input');
    const dropZone = document.getElementById('drop-zone');
    const pasteBtn = document.getElementById('paste-image-btn');
    const submitBtn = document.getElementById('submit-btn');
    const draftBtn = document.getElementById('save-draft-btn');

    // Image upload
    imageInput.addEventListener('change', (e) => this.handleImageSelect(e.target.files));

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-primary');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-primary');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-primary');
      if (e.dataTransfer.files.length) {
        this.handleImageSelect(e.dataTransfer.files);
      }
    });

    // Paste from clipboard
    pasteBtn.addEventListener('click', async () => {
      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              this.handleImageSelect([blob]);
              return;
            }
          }
        }
        window.showToast('Няма намерено изображение в клипборда.', 'warning');
      } catch (err) {
        console.error('Clipboard error:', err);
        window.showToast('Грешка при четене от клипборда. Използвайте бутона за качване на файлове.', 'warning');
      }
    });

    // Submit form
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submitForm('active');
    });

    // Save draft
    draftBtn.addEventListener('click', async () => {
      await this.submitForm('draft');
    });
  }

  handleImageSelect(files) {
    const validation = validateImages(Array.from(files));
    if (!validation.isValid) {
      document.getElementById('images-error').textContent = validation.error;
      return;
    }

    document.getElementById('images-error').textContent = '';

    // Add files to list (up to max)
    const remainingSlots = 6 - this.uploadedImages.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToAdd) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImages.push({
          file: file,
          preview: e.target.result,
          isPrimary: this.uploadedImages.length === 0
        });
        this.renderImagePreviews();
      };
      reader.readAsDataURL(file);
    }
  }

  renderImagePreviews() {
    const container = document.getElementById('image-previews');

    container.innerHTML = this.uploadedImages.map((img, idx) => `
      <div class="col-4 col-md-2 position-relative">
        <img src="${img.preview}" class="img-fluid rounded border"
          style="aspect-ratio: 1; object-fit: cover;">
        ${img.isPrimary ? `
          <span class="badge bg-primary position-absolute top-0 start-0 m-1">Основна</span>
        ` : `
          <button type="button" class="btn btn-sm btn-primary position-absolute top-0 start-0 m-1"
            onclick="window.listingCreate.setPrimaryImage(${idx})">
            Основна
          </button>
        `}
        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
          onclick="window.listingCreate.removeImage(${idx})">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `).join('');

    // Enable/disable input
    const imageInput = document.getElementById('image-input');
    if (imageInput) {
      imageInput.disabled = this.uploadedImages.length >= 6;
    }
  }

  setPrimaryImage(index) {
    this.uploadedImages.forEach((img, idx) => {
      img.isPrimary = idx === index;
    });
    this.renderImagePreviews();
  }

  removeImage(index) {
    this.uploadedImages.splice(index, 1);
    // Ensure first image is primary if none marked
    if (this.uploadedImages.length > 0 && !this.uploadedImages.some(img => img.isPrimary)) {
      this.uploadedImages[0].isPrimary = true;
    }
    this.renderImagePreviews();
  }

  async submitForm(status) {
    // Clear previous errors
    this.clearErrors();

    // Gather form data
    const formData = {
      title: document.getElementById('listing-title').value,
      description: document.getElementById('listing-description').value,
      category_id: document.getElementById('listing-category').value,
      condition: document.getElementById('listing-condition').value,
      price: document.getElementById('listing-price').value,
      location_id: document.getElementById('listing-location').value || null,
      is_featured: document.getElementById('listing-featured').checked,
      is_urgent: document.getElementById('listing-urgent').checked,
      status: status
    };

    // Transform empty numeric fields to null
    const processedData = transformNumericFields(formData, ['price']);

    // Validate form
    const validation = validateListingForm(processedData);
    if (!validation.isValid) {
      this.showErrors(validation.errors);
      return;
    }

    // Show loading state
    this.setLoading(true);

    try {
      // Create listing with images
      const imageFiles = this.uploadedImages.map(img => img.file);
      const listing = await listingService.createListing(processedData, imageFiles);

      window.showToast(
        status === 'active' ? 'Обявата е публикувана успешно!' : 'Черновата е запазена!',
        'success'
      );

      // Redirect to listing details
      setTimeout(() => {
        window.router.navigate(`/listings/view?id=${listing.id}`);
      }, 1500);
    } catch (error) {
      console.error('Submit error:', error);
      window.showToast(formatErrorMessage(error), 'error');
      this.setLoading(false);
    }
  }

  showErrors(errors) {
    for (const [field, message] of Object.entries(errors)) {
      const input = document.getElementById(`listing-${field}`);
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
    const inputs = this.container.querySelectorAll('.is-invalid');
    inputs.forEach(input => input.classList.remove('is-invalid'));

    const errorDivs = this.container.querySelectorAll('.invalid-feedback, #images-error');
    errorDivs.forEach(div => div.textContent = '');
  }

  setLoading(isLoading) {
    const submitBtn = document.getElementById('submit-btn');
    const draftBtn = document.getElementById('save-draft-btn');

    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Публикуване...';
      draftBtn.disabled = true;
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-check-lg me-2"></i>Публикувай обявата';
      draftBtn.disabled = false;
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    // Remove global reference
    delete window.listingCreate;
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Make methods available globally for inline onclick handlers
export default ListingCreatePage;
