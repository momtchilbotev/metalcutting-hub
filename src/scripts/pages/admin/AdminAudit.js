import { adminService, hasRole } from '../../services/admin.js';
import { formatDate, formatAdminAction, formatTargetType } from '../../utils/formatters.js';

export class AdminAudit {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.logs = [];
    this.page = 1;
  }

  async render() {
    const hasAccess = await hasRole('admin');
    if (!hasAccess) {
      this.showAccessDenied();
      return;
    }

    try {
      await this.loadLogs();
      this.container.innerHTML = this.getTemplate();
      this.renderLogs();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading audit log:', error);
      this.showError();
    }
  }

  async loadLogs() {
    const result = await adminService.getAuditLog(100, this.page);
    this.logs = result.logs;
    this.total = result.total;
    this.totalPages = Math.ceil(result.total / 100);
  }

  getTemplate() {
    return `
      <div class="container-fluid py-4">
        <div class="container">
          <div class="mb-4">
            <h1 class="mb-0">
              <i class="bi bi-journal-text me-2"></i>Одитен лог
            </h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/admin">Admin</a></li>
                <li class="breadcrumb-item active">Одит</li>
              </ol>
            </nav>
          </div>

          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">История на административните действия</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Администратор</th>
                      <th>Действие</th>
                      <th>Цел</th>
                      <th>Детайли</th>
                    </tr>
                  </thead>
                  <tbody id="logs-table-body"></tbody>
                </table>
              </div>
              ${this.renderPagination()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderLogs() {
    const tbody = document.getElementById('logs-table-body');
    if (!tbody) return;

    if (this.logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Няма записи.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.logs.map(log => `
      <tr>
        <td><small>${formatDate(log.created_at, true)}</small></td>
        <td>${this.escapeHtml(log.admin?.full_name || 'System')}</td>
        <td><strong>${formatAdminAction(log.action)}</strong></td>
        <td>${log.target_type ? formatTargetType(log.target_type) : '-'}</td>
        <td><code class="small">${this.formatDetails(log.details)}</code></td>
      </tr>
    `).join('');
  }

  renderPagination() {
    if (this.totalPages <= 1) return '';

    return `
      <nav class="mt-3">
        <ul class="pagination justify-content-center">
          ${Array.from({ length: this.totalPages }, (_, i) => i + 1).map(p => `
            <li class="page-item ${p === this.page ? 'active' : ''}">
              <a class="page-link" href="#" data-page="${p}">${p}</a>
            </li>
          `).join('')}
        </ul>
      </nav>
    `;
  }

  attachEventListeners() {
    this.container.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.page = parseInt(link.dataset.page);
        this.loadLogs().then(() => {
          this.container.innerHTML = this.getTemplate();
          this.renderLogs();
          this.attachEventListeners();
        });
      });
    });
  }

  formatDetails(details) {
    if (!details) return '-';
    try {
      return JSON.stringify(details).substring(0, 50);
    } catch {
      return String(details).substring(0, 50);
    }
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

export default AdminAudit;
