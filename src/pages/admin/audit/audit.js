import './audit.css';
import { adminService } from '../../../scripts/services/admin.js';
import { formatDate, formatAdminAction, formatTargetType } from '../../../scripts/utils/formatters.js';

export class AdminAuditPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.logs = [];
    this.currentPage = parseInt(params.page) || 1;
    this.itemsPerPage = 50;
    this.totalCount = 0;
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading audit log:', error);
      this.showError();
    }
  }

  async loadData() {
    const result = await adminService.getAuditLog(this.itemsPerPage, this.currentPage);
    this.logs = result.logs;
    this.totalCount = result.total;
  }

  getLoadingTemplate() {
    return `
      <div class="container-fluid py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на журнала...</p>
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
              <i class="bi bi-clipboard-check text-primary me-2"></i>Audit Log
            </h2>
            <p class="text-muted">${this.totalCount} записа</p>
          </div>
        </div>

        <!-- Audit Table -->
        <div class="card shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Дата/Час</th>
                  <th>Админ</th>
                  <th>Действие</th>
                  <th>Тип</th>
                  <th>ID на цел</th>
                  <th>Детайли</th>
                </tr>
              </thead>
              <tbody>
                ${this.logs.length === 0 ? `
                  <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                      Няма записи в журнала
                    </td>
                  </tr>
                ` : this.logs.map(log => `
                  <tr>
                    <td><small>${formatDate(log.created_at, true)}</small></td>
                    <td>${this.escapeHtml(log.admin?.full_name || 'System')}</td>
                    <td>
                      <span class="badge bg-${this.getActionBadgeClass(log.action)}">
                        ${formatAdminAction(log.action)}
                      </span>
                    </td>
                    <td>${formatTargetType(log.target_type)}</td>
                    <td><code>${log.target_id ? log.target_id.substring(0, 8) + '...' : '-'}</code></td>
                    <td>
                      ${log.details ? `
                        <button class="btn btn-sm btn-outline-secondary btn-details"
                          data-details='${JSON.stringify(log.details).replace(/'/g, "&#39;")}'>
                          <i class="bi bi-eye"></i>
                        </button>
                      ` : '-'}
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

  getActionBadgeClass(action) {
    if (action.includes('delete') || action.includes('reject')) return 'danger';
    if (action.includes('create') || action.includes('approve')) return 'success';
    if (action.includes('update') || action.includes('toggle')) return 'warning';
    return 'secondary';
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
    // Details buttons
    document.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const details = JSON.parse(btn.dataset.details);
        alert(JSON.stringify(details, null, 2));
      });
    });

    // Pagination
    document.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(link.dataset.page);
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          window.router.navigate('/admin/audit', { page });
        }
      });
    });
  }

  showError() {
    this.container.innerHTML = `
      <div class="container-fluid py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на журнала.
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

export default AdminAuditPage;
