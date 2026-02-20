import './categories.css';
import { adminService } from '../../../scripts/services/admin.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { formatDate } from '../../../scripts/utils/formatters.js';

export class AdminCategoriesPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.categories = [];
    this.editingCategory = null;
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading admin categories:', error);
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
          <div class="col-lg-5">
            <div class="card shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0" id="form-title">
                  <i class="bi bi-plus-circle me-2"></i>Нова категория
                </h5>
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

                  <div class="mb-3">
                    <label for="icon_url" class="form-label">URL на икона</label>
                    <input type="url" class="form-control" id="icon_url" name="icon_url" placeholder="https://...">
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

    // Add new
    if (addBtn) {
      addBtn.addEventListener('click', () => this.resetForm());
    }

    // Form submission
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveCategory();
      });
    }

    // Cancel
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.resetForm());
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
    document.getElementById('category_id').value = '';
    document.getElementById('name_bg').value = '';
    document.getElementById('name_en').value = '';
    document.getElementById('slug').value = '';
    document.getElementById('sort_order').value = '0';
    document.getElementById('icon_url').value = '';
    document.getElementById('form-title').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Нова категория';
  }

  editCategory(categoryId) {
    const category = this.categories.find(c => c.id === categoryId);
    if (!category) return;

    this.editingCategory = category;

    document.getElementById('category_id').value = category.id;
    document.getElementById('name_bg').value = category.name_bg || '';
    document.getElementById('name_en').value = category.name_en || '';
    document.getElementById('slug').value = category.slug || '';
    document.getElementById('sort_order').value = category.sort_order || 0;
    document.getElementById('icon_url').value = category.icon_url || '';
    document.getElementById('form-title').innerHTML = '<i class="bi bi-pencil me-2"></i>Редактиране на категория';
  }

  async saveCategory() {
    const formData = {
      id: document.getElementById('category_id').value || null,
      name_bg: document.getElementById('name_bg').value.trim(),
      name_en: document.getElementById('name_en').value.trim(),
      slug: document.getElementById('slug').value.trim(),
      sort_order: parseInt(document.getElementById('sort_order').value) || 0,
      icon_url: document.getElementById('icon_url').value.trim() || null
    };

    if (!formData.name_bg || !formData.slug) {
      Toast.error('Моля, попълнете задължителните полета.');
      return;
    }

    try {
      await adminService.saveCategory(formData);
      Toast.success(formData.id ? 'Категорията е обновена!' : 'Категорията е създадена!');
      this.resetForm();
      await this.render();
    } catch (error) {
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

export default AdminCategoriesPage;
