import '../../../pages/admin/reports/reports.css';
import { adminService } from '../../../scripts/services/admin.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { formatDate } from '../../../scripts/utils/formatters.js';

export class ModeratorReportsPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.reports = [];
    this.currentPage = parseInt(params.page) || 1;
    this.itemsPerPage = 20;
    this.totalCount = 0;
    this.filters = {
      status: params.status || ''
    };
    this.baseRoute = '/moderator/reports';
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading moderator reports:', error);
      this.showError();
    }
  }

  async loadData() {
    const result = await adminService.getReports({
      page: this.currentPage,
      items_per_page: this.itemsPerPage,
      status: this.filters.status || undefined
    });

    this.reports = result.reports;
    this.totalCount = result.count;
  }

  getLoadingTemplate() {
    return `
      <div class="container-fluid py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на докладите...</p>
        </div>
      </div>
    `;
  }

  getTemplate() {
    const pendingCount = this.reports.filter(r => r.status === 'pending').length;

    return `
      <div class="container-fluid py-4">
        <div class="row mb-4">
          <div class="col">
            <h2 class="h3 mb-0">
              <i class="bi bi-flag text-danger me-2"></i>Доклади за нередности
            </h2>
            <p class="text-muted">
              ${this.totalCount} доклада общо
              ${pendingCount > 0 ? `<span class="badge bg-danger ms-2">${pendingCount} нови</span>` : ''}
            </p>
          </div>
        </div>

        <!-- Filters -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <form id="filter-form" class="row g-3">
              <div class="col-md-4">
                <select class="form-select" id="status" name="status">
                  <option value="">Всички статуси</option>
                  <option value="pending" ${this.filters.status === 'pending' ? 'selected' : ''}>Чакащи</option>
                  <option value="reviewed" ${this.filters.status === 'reviewed' ? 'selected' : ''}>Прегледани</option>
                  <option value="resolved" ${this.filters.status === 'resolved' ? 'selected' : ''}>Решени</option>
                  <option value="dismissed" ${this.filters.status === 'dismissed' ? 'selected' : ''}>Отхвърлени</option>
                </select>
              </div>
              <div class="col-md-3">
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-search me-1"></i>Филтрирай
                </button>
                <button type="button" class="btn btn-outline-secondary" id="clear-filters">
                  <i class="bi bi-x me-1"></i>Изчисти
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Reports Table -->
        <div class="card shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Обява</th>
                  <th>Докладвано от</th>
                  <th>Причина</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                ${this.reports.length === 0 ? `
                  <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                      Няма доклади
                    </td>
                  </tr>
                ` : this.reports.map(report => `
                  <tr class="${report.status === 'pending' ? 'table-warning' : ''}">
                    <td>
                      ${report.listing ? `
                        <a href="/listings/view?id=${report.listing.id}" target="_blank" class="text-decoration-none">
                          ${this.escapeHtml(report.listing.title)}
                        </a>
                        <br><small class="text-muted">ID: ${report.listing.id.substring(0, 8)}...</small>
                      ` : '<span class="text-muted">Изтрита обява</span>'}
                    </td>
                    <td>
                      ${this.escapeHtml(report.reporter?.full_name || 'Unknown')}
                      <br><small class="text-muted">${report.reporter?.email || ''}</small>
                    </td>
                    <td>
                      <span class="report-reason" title="${this.escapeHtml(report.reason)}">
                        ${this.escapeHtml(report.reason.length > 50 ? report.reason.substring(0, 50) + '...' : report.reason)}
                      </span>
                    </td>
                    <td>
                      <span class="badge bg-${this.getStatusBadgeClass(report.status)}">
                        ${this.getStatusLabel(report.status)}
                      </span>
                      ${report.reviewed_by ? `<br><small class="text-muted">от ${this.escapeHtml(report.reviewer?.full_name || 'admin')}</small>` : ''}
                    </td>
                    <td><small>${formatDate(report.created_at)}</small></td>
                    <td>
                      ${report.status === 'pending' ? `
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-success btn-resolve" data-id="${report.id}" title="Реши">
                            <i class="bi bi-check"></i>
                          </button>
                          <button class="btn btn-outline-secondary btn-dismiss" data-id="${report.id}" title="Отхвърли">
                            <i class="bi bi-x"></i>
                          </button>
                        </div>
                      ` : `
                        <button class="btn btn-outline-info btn-sm btn-view" data-id="${report.id}" data-reason="${this.escapeHtml(report.reason)}" data-notes="${this.escapeHtml(report.admin_notes || '')}">
                          <i class="bi bi-eye"></i> Виж
                        </button>
                      `}
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

  getStatusBadgeClass(status) {
    const classes = {
      pending: 'warning',
      reviewed: 'info',
      resolved: 'success',
      dismissed: 'secondary'
    };
    return classes[status] || 'secondary';
  }

  getStatusLabel(status) {
    const labels = {
      pending: 'Чакащ',
      reviewed: 'Прегледан',
      resolved: 'Решен',
      dismissed: 'Отхвърлен'
    };
    return labels[status] || status;
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
    const filterForm = document.getElementById('filter-form');
    const clearFiltersBtn = document.getElementById('clear-filters');

    // Filter form
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.applyFilters();
      });
    }

    // Clear filters
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        window.router.navigate(this.baseRoute);
      });
    }

    // Resolve buttons
    document.querySelectorAll('.btn-resolve').forEach(btn => {
      btn.addEventListener('click', () => this.resolveReport(btn.dataset.id));
    });

    // Dismiss buttons
    document.querySelectorAll('.btn-dismiss').forEach(btn => {
      btn.addEventListener('click', () => this.dismissReport(btn.dataset.id));
    });

    // View buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => this.viewReportDetails(btn.dataset.reason, btn.dataset.notes));
    });

    // Pagination
    document.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(link.dataset.page);
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          this.render();
        }
      });
    });
  }

  applyFilters() {
    const status = document.getElementById('status').value;

    const params = { page: 1 };
    if (status) params.status = status;

    window.router.navigate(this.baseRoute, params);
  }

  async resolveReport(reportId) {
    const notes = prompt('Бележки (по желание):');
    if (notes === null) return; // Cancelled

    try {
      await adminService.updateReportStatus(reportId, 'resolved', notes);
      Toast.success('Докладът е маркиран като решен!');
      await this.render();
    } catch (error) {
      Toast.error('Грешка при обновяване на доклада.');
    }
  }

  async dismissReport(reportId) {
    const notes = prompt('Причина за отхвърляне (по желание):');
    if (notes === null) return; // Cancelled

    try {
      await adminService.updateReportStatus(reportId, 'dismissed', notes);
      Toast.success('Докладът е отхвърлен!');
      await this.render();
    } catch (error) {
      Toast.error('Грешка при обновяване на доклада.');
    }
  }

  viewReportDetails(reason, notes) {
    alert(`Причина:\n${reason}\n\nБележки на администратора:\n${notes || 'Няма бележки'}`);
  }

  showError() {
    this.container.innerHTML = `
      <div class="container-fluid py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на докладите.
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

export default ModeratorReportsPage;
