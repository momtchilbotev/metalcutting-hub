import { adminService, hasRole } from '../../services/admin.js';
import { formatDate, formatRole } from '../../utils/formatters.js';

export class AdminUsers {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.users = [];
    this.page = 1;
  }

  async render() {
    const hasAccess = await hasRole('admin');
    if (!hasAccess) {
      this.showAccessDenied();
      return;
    }

    try {
      await this.loadUsers();
      this.container.innerHTML = this.getTemplate();
      this.renderUsers();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading users:', error);
      this.showError();
    }
  }

  async loadUsers() {
    const result = await adminService.getUsers(this.page, 20);
    this.users = result.users;
    this.total = result.total;
    this.totalPages = Math.ceil(result.total / 20);
  }

  getTemplate() {
    return `
      <div class="container-fluid py-4">
        <div class="container">
          <div class="mb-4">
            <h1 class="mb-0">
              <i class="bi bi-people me-2"></i>Управление на потребители
            </h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/admin">Admin</a></li>
                <li class="breadcrumb-item active">Потребители</li>
              </ol>
            </nav>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Потребител</th>
                      <th>Телефон</th>
                      <th>Локация</th>
                      <th>Роля</th>
                      <th>Верифициран</th>
                      <th>Регистриран</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody id="users-table-body"></tbody>
                </table>
              </div>
              ${this.renderPagination()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (this.users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Няма потребители.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.users.map(u => `
      <tr>
        <td>
          <div class="fw-bold">${this.escapeHtml(u.full_name || 'Няма име')}</div>
          <small class="text-muted">${u.id}</small>
        </td>
        <td>${this.escapeHtml(u.phone || '-')}</td>
        <td>${u.location_name || '-'}</td>
        <td>
          <select class="form-select form-select-sm" data-role-user="${u.id}" style="width: auto;">
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>Потребител</option>
            <option value="moderator" ${u.role === 'moderator' ? 'selected' : ''}>Модератор</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Администратор</option>
          </select>
        </td>
        <td>
          <span class="badge ${u.is_verified ? 'bg-success' : 'bg-secondary'}">
            ${u.is_verified ? 'Да' : 'Не'}
          </span>
        </td>
        <td><small>${formatDate(u.created_at)}</small></td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-verify="${u.id}">
            <i class="bi bi-check-circle"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  renderPagination() {
    if (this.totalPages <= 1) return '';

    return `
      <nav class="mt-3">
        <ul class="pagination justify-content-center">
          <li class="page-item ${this.page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${this.page - 1}">Предишна</a>
          </li>
          ${Array.from({ length: this.totalPages }, (_, i) => i + 1).map(p => `
            <li class="page-item ${p === this.page ? 'active' : ''}">
              <a class="page-link" href="#" data-page="${p}">${p}</a>
            </li>
          `).join('')}
          <li class="page-item ${this.page === this.totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${this.page + 1}">Следваща</a>
          </li>
        </ul>
      </nav>
    `;
  }

  attachEventListeners() {
    // Role changes
    this.container.querySelectorAll('[data-role-user]').forEach(select => {
      select.addEventListener('change', async () => {
        const userId = select.dataset.roleUser;
        const newRole = select.value;
        await adminService.updateUserRole(userId, newRole);
        window.showToast('Ролята е обновена.', 'success');
      });
    });

    // Verify buttons
    this.container.querySelectorAll('[data-verify]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.verify;
        await adminService.toggleUserVerification(userId, true);
        window.showToast('Потребителят е верифициран.', 'success');
      });
    });

    // Pagination
    this.container.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.page = parseInt(link.dataset.page);
        this.loadUsers().then(() => {
          this.container.innerHTML = this.getTemplate();
          this.renderUsers();
          this.attachEventListeners();
        });
      });
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

export default AdminUsers;
