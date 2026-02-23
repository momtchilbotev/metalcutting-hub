import '../../../pages/admin/categories/categories.css';
import { adminService } from '../../../scripts/services/admin.js';
import { storageService } from '../../../scripts/services/storage.js';
import { Toast } from '../../../scripts/components/Toast.js';

export class ModeratorCategoriesPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.categories = [];
    this.editingCategory = null;
    this.selectedIconFile = null;
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading moderator categories:', error);
      this.showError();
    }
  }

  async loadData() {
    this.categories = await adminService.getCategories();
  }

  getLoadingTemplate() {
    return `
      <div class="container-fluid py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на категориите...</p>
        </div>
      </div>
    `;
  }

  getTemplate() {
    return `
      <div class="container-fluid py-4">
        <div class="row mb-4">
          <div class="col d-flex justify-content-between align-items-center">
            <div>
              <h2 class="h3 mb-0">
                <i class="bi bi-tags text-primary me-2"></i>Управление на категории
              </h2>
              <p class="text-muted">${this.categories.length} категории</p>
            </div>
            <button class="btn btn-primary" id="add-category-btn">
              <i class="bi bi-plus-circle me-1"></i>Нова категория
            </button>
          </div>
        </div>

        <div class="row">
          <!-- Categories List -->
          <div class="col-lg-7">
            <div class="card shadow-sm">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Ред</th>
                      <th>Име (BG)</th>
                      <th>Име (EN)</th>
                      <th>Slug</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.categories.length === 0 ? `
                      <tr>
                        <td colspan="5" class="text-center py-4 text-muted">
                          Няма категории
                        </td>
                      </tr>
                    ` : this.categories.map(cat => `
                      <tr>
                        <td>${cat.sort_order}</td>
                        <td>${this.escapeHtml(cat.name_bg)}</td>
                        <td>${this.escapeHtml(cat.name_en || '-')}</td>
                        <td><code>${this.escapeHtml(cat.slug)}</code></td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary btn-edit"
                              data-id="${cat.id}" title="Редактирай">
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-delete"
                              data-id="${cat.id}" title="Изтрий">
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Category Form -->
          <div class="col-lg-5 d-none" id="category-form-container">
            <div class="card shadow-sm">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0" id="form-title">
                  <i class="bi bi-plus-circle me-2"></i>Нова категория
                </h5>
                <button type="button" class="btn-close" id="close-form-btn" aria-label="Затвори"></button>
              </div>
              <div class="card-body">
                <form id="category-form">
                  <input type="hidden" id="category_id" name="id">

                  <div class="mb-3">
                    <label for="name_bg" class="form-label">Име (Български) *</label>
                    <input type="text" class="form-control" id="name_bg" name="name_bg" required>
                  </div>

                  <div class="mb-3">
                    <label for="name_en" class="form-label">Име (English)</label>
                    <input type="text" class="form-control" id="name_en" name="name_en">
                  </div>

                  <div class="mb-3">
                    <label for="slug" class="form-label">Slug *</label>
                    <input type="text" class="form-control" id="slug" name="slug" required>
                    <div class="form-text">URL-friendly идентификатор (напр. metalcutting-tools)</div>
                  </div>

                  <div class="mb-3">
                    <label for="sort_order" class="form-label">Ред</label>
                    <input type="number" class="form-control" id="sort_order" name="sort_order" value="0" min="0">
                  </div>

                  <!-- Icon Upload -->
                  <div class="mb-3">
                    <label class="form-label">Икона на категорията</label>
                    <input type="hidden" id="icon_url" name="icon_url">
                    <div class="icon-upload-area" id="icon-dropzone">
                      <div id="icon-preview-container" class="icon-preview-container d-none">
                        <img id="icon-preview" src="" alt="Icon preview">
                        <button type="button" class="btn btn-sm btn-danger icon-remove-btn" id="remove-icon-btn">
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                      <div id="icon-upload-prompt" class="icon-upload-prompt">
                        <i class="bi bi-cloud-upload display-4 text-muted"></i>
                        <p class="mb-1">Влачете и пуснете икона тук</p>
                        <small class="text-muted">или</small>
                        <label class="btn btn-outline-primary btn-sm mt-2 mb-0">
                          <i class="bi bi-folder me-1"></i>Изберете файл
                          <input type="file" id="icon-file-input" accept="image/*" class="d-none">
                        </label>
                        <small class="text-muted d-block mt-2">JPG, PNG, WebP или SVG (макс. 2MB)</small>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary flex-grow-1">
                      <i class="bi bi-check me-1"></i>Запази
                    </button>
                    <button type="button" class="btn btn-outline-secondary" id="cancel-btn">
                      <i class="bi bi-x me-1"></i>Отказ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const addBtn = document.getElementById('add-category-btn');
    const form = document.getElementById('category-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const closeFormBtn = document.getElementById('close-form-btn');
    const formContainer = document.getElementById('category-form-container');

    // Add new - show form
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.resetForm();
        if (formContainer) formContainer.classList.remove('d-none');
      });
    }

    // Form submission
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveCategory();
      });
    }

    // Cancel - hide form
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideForm());
    }

    // Close button - hide form
    if (closeFormBtn) {
      closeFormBtn.addEventListener('click', () => this.hideForm());
    }

    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => this.editCategory(btn.dataset.id));
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => this.deleteCategory(btn.dataset.id));
    });

    // Auto-generate slug
    const nameBgInput = document.getElementById('name_bg');
    const slugInput = document.getElementById('slug');

    if (nameBgInput && slugInput) {
      nameBgInput.addEventListener('input', () => {
        if (!slugInput.value || this.editingCategory === null) {
          slugInput.value = this.slugify(nameBgInput.value);
        }
      });
    }

    // Icon upload - drag and drop
    this.attachIconUploadListeners();
  }

  attachIconUploadListeners() {
    const dropzone = document.getElementById('icon-dropzone');
    const fileInput = document.getElementById('icon-file-input');
    const removeBtn = document.getElementById('remove-icon-btn');

    if (!dropzone || !fileInput) return;

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.classList.remove('dragover');
      });
    });

    // Handle dropped files
    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleIconFile(files[0]);
      }
    });

    // Handle file input selection
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleIconFile(e.target.files[0]);
      }
    });

    // Remove icon
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearIconPreview();
      });
    }

    // Click on dropzone to open file dialog (only if no preview)
    dropzone.addEventListener('click', (e) => {
      if (!e.target.closest('label') && !e.target.closest('.icon-remove-btn')) {
        fileInput.click();
      }
    });
  }

  handleIconFile(file) {
    // Validate file type
    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!supportedFormats.includes(file.type)) {
      Toast.error('Неподдържан формат. Използвайте JPG, PNG, WebP или SVG.');
      return;
    }

    // Validate file size
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      Toast.error('Файлът е твърде голям. Максимум 2MB.');
      return;
    }

    this.selectedIconFile = file;
    this.showIconPreview(file);
  }

  showIconPreview(file) {
    const previewContainer = document.getElementById('icon-preview-container');
    const uploadPrompt = document.getElementById('icon-upload-prompt');
    const previewImg = document.getElementById('icon-preview');

    if (previewContainer && uploadPrompt && previewImg) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewContainer.classList.remove('d-none');
        uploadPrompt.classList.add('d-none');
      };
      reader.readAsDataURL(file);
    }
  }

  showIconPreviewFromUrl(url) {
    const previewContainer = document.getElementById('icon-preview-container');
    const uploadPrompt = document.getElementById('icon-upload-prompt');
    const previewImg = document.getElementById('icon-preview');

    if (previewContainer && uploadPrompt && previewImg && url) {
      previewImg.src = url;
      previewContainer.classList.remove('d-none');
      uploadPrompt.classList.add('d-none');
    }
  }

  clearIconPreview() {
    const previewContainer = document.getElementById('icon-preview-container');
    const uploadPrompt = document.getElementById('icon-upload-prompt');
    const previewImg = document.getElementById('icon-preview');
    const iconUrlInput = document.getElementById('icon_url');

    if (previewContainer) previewContainer.classList.add('d-none');
    if (uploadPrompt) uploadPrompt.classList.remove('d-none');
    if (previewImg) previewImg.src = '';
    if (iconUrlInput) iconUrlInput.value = '';
    this.selectedIconFile = null;
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9а-я\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  resetForm() {
    this.editingCategory = null;
    this.selectedIconFile = null;
    document.getElementById('category_id').value = '';
    document.getElementById('name_bg').value = '';
    document.getElementById('name_en').value = '';
    document.getElementById('slug').value = '';
    document.getElementById('sort_order').value = '0';
    document.getElementById('icon_url').value = '';
    document.getElementById('form-title').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Нова категория';
    this.clearIconPreview();
  }

  hideForm() {
    const formContainer = document.getElementById('category-form-container');
    if (formContainer) formContainer.classList.add('d-none');
    this.resetForm();
  }

  showForm() {
    const formContainer = document.getElementById('category-form-container');
    if (formContainer) formContainer.classList.remove('d-none');
  }

  editCategory(categoryId) {
    const category = this.categories.find(c => c.id === categoryId);
    if (!category) return;

    this.editingCategory = category;
    this.selectedIconFile = null;

    document.getElementById('category_id').value = category.id;
    document.getElementById('name_bg').value = category.name_bg || '';
    document.getElementById('name_en').value = category.name_en || '';
    document.getElementById('slug').value = category.slug || '';
    document.getElementById('sort_order').value = category.sort_order || 0;
    document.getElementById('icon_url').value = category.icon_url || '';
    document.getElementById('form-title').innerHTML = '<i class="bi bi-pencil me-2"></i>Редактиране на категория';

    // Show existing icon if any
    if (category.icon_url) {
      this.showIconPreviewFromUrl(category.icon_url);
    } else {
      this.clearIconPreview();
    }

    this.showForm();
  }

  async saveCategory() {
    const categoryId = document.getElementById('category_id').value || null;
    const existingIconUrl = document.getElementById('icon_url').value.trim() || null;

    const formData = {
      id: categoryId,
      name_bg: document.getElementById('name_bg').value.trim(),
      name_en: document.getElementById('name_en').value.trim(),
      slug: document.getElementById('slug').value.trim(),
      sort_order: parseInt(document.getElementById('sort_order').value) || 0,
      icon_url: existingIconUrl
    };

    if (!formData.name_bg || !formData.slug) {
      Toast.error('Моля, попълнете задължителните полета.');
      return;
    }

    try {
      // For EXISTING categories: upload new icon FIRST before saving
      if (this.selectedIconFile && categoryId) {
        const iconUrl = await storageService.uploadCategoryIcon(this.selectedIconFile, categoryId);
        formData.icon_url = iconUrl;
        await adminService.saveCategory(formData);
      } else if (this.selectedIconFile && !categoryId) {
        // NEW category with icon: need two-step process
        const savedCategory = await adminService.saveCategory(formData);
        const newCategoryId = savedCategory?.id;

        if (newCategoryId) {
          const iconUrl = await storageService.uploadCategoryIcon(this.selectedIconFile, newCategoryId);
          await adminService.saveCategory({
            ...formData,
            id: newCategoryId,
            icon_url: iconUrl
          });
        }
      } else {
        // No new icon selected - single save
        await adminService.saveCategory(formData);
      }

      Toast.success(categoryId ? 'Категорията е обновена!' : 'Категорията е създадена!');
      this.hideForm();
      await this.render();
    } catch (error) {
      console.error('Save category error:', error);
      Toast.error(error.message || 'Грешка при запазване.');
    }
  }

  async deleteCategory(categoryId) {
    Toast.confirm('Сигурни ли сте, че искате да изтриете тази категория?', async () => {
      try {
        await adminService.deleteCategory(categoryId);
        Toast.success('Категорията е изтрита!');
        await this.render();
      } catch (error) {
        Toast.error(error.message || 'Грешка при изтриване.');
      }
    });
  }

  showError() {
    this.container.innerHTML = `
      <div class="container-fluid py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на категориите.
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

export default ModeratorCategoriesPage;
