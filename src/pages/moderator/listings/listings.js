import '../../../pages/admin/listings/listings.css';
import { adminService } from '../../../scripts/services/admin.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { formatPrice, formatDate, formatStatus } from '../../../scripts/utils/formatters.js';

export class ModeratorListingsPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listings = [];
    this.currentPage = parseInt(params.page) || 1;
    this.itemsPerPage = 20;
    this.totalCount = 0;
    this.filters = {
      status: params.status || '',
      search: params.search || ''
    };
    this.baseRoute = '/moderator/listings';
    this.rejectListingId = null;
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading moderator listings:', error);
      this.showError();
    }
  }

  async loadData() {
    const result = await adminService.getListings({
      page: this.currentPage,
      items_per_page: this.itemsPerPage,
      status: this.filters.status || undefined,
      search: this.filters.search || undefined
    });

    this.listings = result.listings;
    this.totalCount = result.count;
  }

  getLoadingTemplate() {
    return `
      <div class="container-fluid py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на обявите...</p>
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
              <i class="bi bi-list-ul text-primary me-2"></i>Управление на обяви
            </h2>
            <p class="text-muted">${this.totalCount} обяви общо</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <form id="filter-form" class="row g-3">
              <div class="col-md-4">
                <input type="text" class="form-control" id="search" name="search"
                  value="${this.escapeHtml(this.filters.search)}" placeholder="Търсене по заглавие...">
              </div>
              <div class="col-md-3">
                <select class="form-select" id="status" name="status">
                  <option value="">Всички статуси</option>
                  <option value="pending" ${this.filters.status === 'pending' ? 'selected' : ''}>Чакащи одобрение</option>
                  <option value="active" ${this.filters.status === 'active' ? 'selected' : ''}>Активни</option>
                  <option value="draft" ${this.filters.status === 'draft' ? 'selected' : ''}>Чернови</option>
                  <option value="rejected" ${this.filters.status === 'rejected' ? 'selected' : ''}>Отхвърлени</option>
                  <option value="sold" ${this.filters.status === 'sold' ? 'selected' : ''}>Продадени</option>
                  <option value="expired" ${this.filters.status === 'expired' ? 'selected' : ''}>Изтекли</option>
                </select>
              </div>
              <div class="col-md-3">
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-search me-1"></i>Търси
                </button>
                <button type="button" class="btn btn-outline-secondary" id="clear-filters">
                  <i class="bi bi-x me-1"></i>Изчисти
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Listings Table -->
        <div class="card shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Обява</th>
                  <th>Продавач</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                ${this.listings.length === 0 ? `
                  <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                      Няма намерени обяви
                    </td>
                  </tr>
                ` : this.listings.map(listing => `
                  <tr>
                    <td>
                      <a href="/listings/view?id=${listing.id}" target="_blank" class="text-decoration-none">
                        ${this.escapeHtml(listing.title)}
                      </a>
                      ${listing.is_featured ? '<span class="badge bg-warning ms-1">Препоръчано</span>' : ''}
                      ${listing.is_urgent ? '<span class="badge bg-danger ms-1">Спешно</span>' : ''}
                    </td>
                    <td>${this.escapeHtml(listing.profiles?.full_name || 'N/A')}</td>
                    <td>${this.escapeHtml(listing.categories?.name_bg || 'N/A')}</td>
                    <td>${listing.price ? formatPrice(listing.price, false) : '-'}</td>
                    <td>
                      <span class="badge bg-${this.getStatusBadgeClass(listing.status)}">
                        ${formatStatus(listing.status)}
                      </span>
                      ${listing.rejection_reason ? `<br><small class="text-danger">${this.escapeHtml(listing.rejection_reason.substring(0, 50))}${listing.rejection_reason.length > 50 ? '...' : ''}</small>` : ''}
                    </td>
                    <td><small>${formatDate(listing.created_at)}</small></td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-toggle-featured"
                          data-id="${listing.id}" data-featured="${listing.is_featured}"
                          title="${listing.is_featured ? 'Премахни от препоръчани' : 'Направи препоръчано'}">
                          <i class="bi bi-star${listing.is_featured ? '-fill' : ''}"></i>
                        </button>
                        ${listing.status === 'pending' || listing.status === 'draft' ? `
                          <button class="btn btn-outline-success btn-approve" data-id="${listing.id}" title="Одобри">
                            <i class="bi bi-check"></i>
                          </button>
                        ` : ''}
                        ${listing.status === 'pending' || listing.status === 'active' || listing.status === 'draft' ? `
                          <button class="btn btn-outline-danger btn-reject" data-id="${listing.id}" title="Отхвърли">
                            <i class="bi bi-x"></i>
                          </button>
                        ` : ''}
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

        <!-- Rejection Modal -->
        <div class="modal fade" id="rejectModal" tabindex="-1" aria-labelledby="rejectModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="rejectModalLabel">
                  <i class="bi bi-exclamation-triangle text-danger me-2"></i>Отхвърляне на обява
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p class="text-muted">Моля, посочете причината за отхвърляне. Тя ще бъде изпратена на потребителя.</p>
                <textarea class="form-control" id="rejection-reason" rows="4"
                  placeholder="Напр: Обявата не отговаря на правилата на сайта..." required></textarea>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отказ</button>
                <button type="button" class="btn btn-danger" id="confirm-reject" disabled>
                  <i class="bi bi-x me-1"></i>Отхвърли
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStatusBadgeClass(status) {
    const classes = {
      active: 'success',
      draft: 'secondary',
      sold: 'info',
      expired: 'warning',
      pending: 'warning',
      rejected: 'danger'
    };
    return classes[status] || 'secondary';
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
    const rejectModal = document.getElementById('rejectModal');
    const rejectionReason = document.getElementById('rejection-reason');
    const confirmRejectBtn = document.getElementById('confirm-reject');

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

    // Toggle featured
    document.querySelectorAll('.btn-toggle-featured').forEach(btn => {
      btn.addEventListener('click', () => this.toggleFeatured(btn.dataset.id, btn.dataset.featured === 'true'));
    });

    // Approve
    document.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', () => this.approveListing(btn.dataset.id));
    });

    // Reject - open modal
    document.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', () => this.openRejectModal(btn.dataset.id));
    });

    // Rejection reason textarea - enable/disable confirm button
    if (rejectionReason) {
      rejectionReason.addEventListener('input', () => {
        confirmRejectBtn.disabled = rejectionReason.value.trim().length < 5;
      });
    }

    // Confirm reject button
    if (confirmRejectBtn) {
      confirmRejectBtn.addEventListener('click', () => this.confirmReject());
    }

    // Clear modal on close
    if (rejectModal) {
      rejectModal.addEventListener('hidden.bs.modal', () => {
        rejectionReason.value = '';
        confirmRejectBtn.disabled = true;
        this.rejectListingId = null;
      });
    }

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
    const search = document.getElementById('search').value;
    const status = document.getElementById('status').value;

    const params = { page: 1 };
    if (search) params.search = search;
    if (status) params.status = status;

    window.router.navigate(this.baseRoute, params);
  }

  async toggleFeatured(listingId, isCurrentlyFeatured) {
    try {
      await adminService.toggleFeatured(listingId, !isCurrentlyFeatured);
      Toast.success(isCurrentlyFeatured ? 'Премахнато от препоръчани' : 'Добавено в препоръчани');
      await this.render();
    } catch (error) {
      Toast.error('Грешка при промяна на статуса.');
    }
  }

  async approveListing(listingId) {
    try {
      await adminService.approveListing(listingId);
      Toast.success('Обявата е одобрена!');
      await this.render();
    } catch (error) {
      Toast.error('Грешка при одобряване.');
    }
  }

  openRejectModal(listingId) {
    this.rejectListingId = listingId;
    const modal = new bootstrap.Modal(document.getElementById('rejectModal'));
    modal.show();
  }

  async confirmReject() {
    const rejectionReason = document.getElementById('rejection-reason').value.trim();

    if (!this.rejectListingId || rejectionReason.length < 5) {
      Toast.error('Моля, въведете причина за отхвърляне (минимум 5 символа).');
      return;
    }

    try {
      await adminService.rejectListing(this.rejectListingId, rejectionReason);
      Toast.success('Обявата е отхвърлена и потребителят е уведомен!');

      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('rejectModal'));
      modal.hide();

      await this.render();
    } catch (error) {
      Toast.error('Грешка при отхвърляне.');
    }
  }

  showError() {
    this.container.innerHTML = `
      <div class="container-fluid py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на обявите.
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

export default ModeratorListingsPage;
