import { adminService, hasRole } from '../../services/admin.js';

export class AdminCategories {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.categories = [];
  }

  async render() {
    const hasAccess = await hasRole('admin');
    if (!hasAccess) {
      this.showAccessDenied();
      return;
    }

    try {
      await this.loadCategories();
      this.container.innerHTML = this.getTemplate();
      this.renderCategories();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading categories:', error);
      this.showError();
    }
  }

  async loadCategories() {
    this.categories = await adminService.getCategories();
  }

  getTemplate() {
    return `
      <div class="container-fluid py-4">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="mb-0">
                <i class="bi bi-tags me-2"></i>Управление на категории
              </h1>
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                  <li class="breadcrumb-item"><a href="/admin">Admin</a></li>
                  <li class="breadcrumb-item active">Категории</li>
                </ol>
              </nav>
            </div>
            <button class="btn btn-primary" id="add-category-btn">
              <i class="bi bi-plus-lg me-2"></i>Нова категория
            </button>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Име (BG)</th>
                      <th>Име (EN)</th>
                      <th>Slug</th>
                      <th>Ред</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody id="categories-table-body"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div class="modal fade" id="categoryModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="categoryModalTitle">Категория</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="category-form">
                <input type="hidden" id="category-id">
                <div class="mb-3">
                  <label for="category-name-bg" class="form-label">Име (български)</label>
                  <input type="text" class="form-control" id="category-name-bg" required>
                </div>
                <div class="mb-3">
                  <label for="category-name-en" class="form-label">Име (английски)</label>
                  <input type="text" class="form-control" id="category-name-en">
                </div>
                <div class="mb-3">
                  <label for="category-slug" class="form-label">Slug</label>
                  <input type="text" class="form-control" id="category-slug" required>
                </div>
                <div class="mb-3">
                  <label for="category-sort" class="form-label">Ред</label>
                  <input type="number" class="form-control" id="category-sort" value="0">
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отказ</button>
              <button type="button" class="btn btn-primary" id="save-category-btn">Запази</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCategories() {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;

    if (this.categories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Няма категории.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.categories.map(c => `
      <tr>
        <td>${this.escapeHtml(c.name_bg)}</td>
        <td>${this.escapeHtml(c.name_en || '-')}</td>
        <td><code>${c.slug}</code></td>
        <td>${c.sort_order}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" data-edit="${c.id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" data-delete="${c.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  attachEventListeners() {
    const modal = document.getElementById('categoryModal');
    const bsModal = new bootstrap.Modal(modal);

    // Add button
    document.getElementById('add-category-btn')?.addEventListener('click', () => {
      document.getElementById('category-form').reset();
      document.getElementById('category-id').value = '';
      document.getElementById('categoryModalTitle').textContent = 'Нова категория';
      bsModal.show();
    });

    // Edit buttons
    this.container.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.edit;
        const cat = this.categories.find(c => c.id === id);
        if (cat) {
          document.getElementById('category-id').value = cat.id;
          document.getElementById('category-name-bg').value = cat.name_bg;
          document.getElementById('category-name-en').value = cat.name_en || '';
          document.getElementById('category-slug').value = cat.slug;
          document.getElementById('category-sort').value = cat.sort_order;
          document.getElementById('categoryModalTitle').textContent = 'Редактирай категория';
          bsModal.show();
        }
      });
    });

    // Delete buttons
    this.container.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.delete;
        if (confirm('Сигурни ли сте?')) {
          await adminService.deleteCategory(id);
          window.showToast('Категорията е изтрита.', 'success');
          await this.loadCategories();
          this.renderCategories();
          this.attachEventListeners();
        }
      });
    });

    // Save button
    document.getElementById('save-category-btn')?.addEventListener('click', async () => {
      const data = {
        id: document.getElementById('category-id').value || null,
        name_bg: document.getElementById('category-name-bg').value,
        name_en: document.getElementById('category-name-en').value,
        slug: document.getElementById('category-slug').value,
        sort_order: parseInt(document.getElementById('category-sort').value) || 0
      };

      await adminService.saveCategory(data);
      bsModal.hide();
      window.showToast('Категорията е запазена.', 'success');
      await this.loadCategories();
      this.renderCategories();
      this.attachEventListeners();
    });
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showAccessDenied() {
    this.container.innerHTML = `<div class="container py-5"><div class="alert alert-danger text-center">Нямате достъп.</div></div>`;
  }

  showError() {
    this.container.innerHTML = `<div class="container py-5"><div class="alert alert-danger text-center">Грешка при зареждане.</div></div>`;
  }

  destroy() {
    if (this.container) this.container.innerHTML = '';
  }
}

export default AdminCategories;
