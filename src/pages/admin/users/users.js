import './users.css';
import { adminService } from '../../../scripts/services/admin.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { formatDate, formatRole } from '../../../scripts/utils/formatters.js';

export class AdminUsersPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.users = [];
    this.currentPage = parseInt(params.page) || 1;
    this.itemsPerPage = 20;
    this.totalCount = 0;
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading admin users:', error);
      this.showError();
    }
  }

  async loadData() {
    const result = await adminService.getUsers(this.currentPage, this.itemsPerPage);
    this.users = result.users;
    this.totalCount = result.total;
  }

  getLoadingTemplate() {
    return `
      <div class="container-fluid py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на потребителите...</p>
        </div>
      </div>
    `;
  }

  getTemplate() {
    return `
      <div class="container-fluid py-4">
        <div class="row mb-4">
          <div class="col">
            <h2 class="h3 mb-0">
              <i class="bi bi-people text-primary me-2"></i>Управление на потребители
            </h2>
            <p class="text-muted">${this.totalCount} потребители</p>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Потребител</th>
                  <th>Имейл</th>
                  <th>Роля</th>
                  <th>Статус</th>
                  <th>Регистриран</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                ${this.users.length === 0 ? `
                  <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                      Няма намерени потребители
                    </td>
                  </tr>
                ` : this.users.map(user => `
                  <tr>
                    <td>
                      <div class="d-flex align-items-center">
                        <img src="${user.avatar_url || '/images/default-avatar.png'}"
                          class="rounded-circle me-2"
                          style="width: 40px; height: 40px; object-fit: cover;"
                          alt="">
                        <div>
                          <div class="fw-semibold">${this.escapeHtml(user.full_name || 'N/A')}</div>
                          <small class="text-muted">ID: ${user.id.substring(0, 8)}...</small>
                        </div>
                      </div>
                    </td>
                    <td>${this.escapeHtml(user.email || 'N/A')}</td>
                    <td>
                      <span class="badge bg-${this.getRoleBadgeClass(user.role)}">
                        ${formatRole(user.role)}
                      </span>
                    </td>
                    <td>
                      ${user.is_verified ?
                        '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Потвърден</span>' :
                        '<span class="badge bg-secondary">Непотвърден</span>'
                      }
                    </td>
                    <td><small>${formatDate(user.created_at)}</small></td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-role"
                          data-id="${user.id}" data-role="${user.role}"
                          title="Промени роля">
                          <i class="bi bi-person-gear"></i>
                        </button>
                        <button class="btn btn-outline-${user.is_verified ? 'warning' : 'success'} btn-verify"
                          data-id="${user.id}" data-verified="${user.is_verified}"
                          title="${user.is_verified ? 'Премахни верификация' : 'Верифицирай'}">
                          <i class="bi bi-patch-check"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <nav class="mt-4">
          ${this.getPaginationTemplate()}
        </nav>
      </div>
    `;
  }

  getRoleBadgeClass(role) {
    const classes = {
      user: 'primary',
      moderator: 'warning',
      admin: 'danger'
    };
    return classes[role] || 'secondary';
  }

  getPaginationTemplate() {
    const totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
    if (totalPages <= 1) return '';

    const pages = [];
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
      pages.push(`
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `);
    }

    return `<ul class="pagination justify-content-center">${pages.join('')}</ul>`;
  }

  attachEventListeners() {
    // Role change
    document.querySelectorAll('.btn-role').forEach(btn => {
      btn.addEventListener('click', () => this.changeRole(btn.dataset.id, btn.dataset.role));
    });

    // Verify toggle
    document.querySelectorAll('.btn-verify').forEach(btn => {
      btn.addEventListener('click', () => this.toggleVerification(btn.dataset.id, btn.dataset.verified === 'true'));
    });

    // Pagination
    document.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(link.dataset.page);
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          window.router.navigate('/admin/users', { page });
        }
      });
    });
  }

  async changeRole(userId, currentRole) {
    const roles = [
      { value: 'user', label: 'Потребител' },
      { value: 'moderator', label: 'Модератор' },
      { value: 'admin', label: 'Администратор' }
    ];

    // Create modal HTML
    const modalHtml = `
      <div class="modal fade" id="roleModal" tabindex="-1">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Изберете роля</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              ${roles.map(role => `
                <div class="form-check mb-2">
                  <input class="form-check-input" type="radio" name="roleSelect"
                    id="role-${role.value}" value="${role.value}"
                    ${role.value === currentRole ? 'checked' : ''}>
                  <label class="form-check-label d-flex align-items-center" for="role-${role.value}">
                    <span class="badge bg-${this.getRoleBadgeClass(role.value)} me-2">${role.label}</span>
                  </label>
                </div>
              `).join('')}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отказ</button>
              <button type="button" class="btn btn-primary" id="confirmRoleChange">Запази</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('roleModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalEl = document.getElementById('roleModal');
    const modal = new bootstrap.Modal(modalEl);

    // Handle confirm
    document.getElementById('confirmRoleChange').addEventListener('click', async () => {
      const selectedRole = document.querySelector('input[name="roleSelect"]:checked')?.value;

      if (selectedRole && selectedRole !== currentRole) {
        try {
          await adminService.updateUserRole(userId, selectedRole);
          Toast.success('Ролята е променена!');
          modal.hide();
          await this.render();
        } catch (error) {
          Toast.error('Грешка при промяна на ролята.');
        }
      } else {
        modal.hide();
      }
    });

    // Clean up modal on hide
    modalEl.addEventListener('hidden.bs.modal', () => {
      modalEl.remove();
    });

    modal.show();
  }

  async toggleVerification(userId, isCurrentlyVerified) {
    try {
      await adminService.toggleUserVerification(userId, !isCurrentlyVerified);
      Toast.success(isCurrentlyVerified ? 'Верификацията е премахната' : 'Потребителят е верифициран');
      await this.render();
    } catch (error) {
      Toast.error('Грешка при промяна на верификацията.');
    }
  }

  showError() {
    this.container.innerHTML = `
      <div class="container-fluid py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на потребителите.
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

export default AdminUsersPage;
