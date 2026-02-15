import { listingService } from '../../services/listings.js';
import { authService } from '../../services/auth.js';
import { formatPrice, formatDate, formatStatus, formatCondition } from '../../utils/formatters.js';

export class MyListingsPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listings = [];
    this.filter = 'all'; // all, active, sold, draft, expired
  }

  async render() {
    // Check auth
    const session = await authService.getSession();
    if (!session) {
      window.router.navigate('/login');
      return;
    }

    try {
      await this.loadListings();
      this.container.innerHTML = this.getTemplate();
      this.renderListings();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading listings:', error);
      this.showError();
    }
  }

  async loadListings() {
    const result = await listingService.getMyListings({ status: undefined });
    this.listings = result.listings;
  }

  getTemplate() {
    const activeCount = this.listings.filter(l => l.status === 'active').length;
    const soldCount = this.listings.filter(l => l.status === 'sold').length;
    const draftCount = this.listings.filter(l => l.status === 'draft').length;

    return `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <i class="bi bi-list-ul me-2"></i>Моите обяви
          </h1>
          <a href="/listings/create" class="btn btn-primary">
            <i class="bi bi-plus-circle me-2"></i>Нова обява
          </a>
        </div>

        <!-- Stats Cards -->
        <div class="row g-3 mb-4">
          <div class="col-md-3 col-6">
            <div class="card text-center">
              <div class="card-body">
                <h3 class="mb-0">${this.listings.length}</h3>
                <small class="text-muted">Общо</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="card text-center">
              <div class="card-body">
                <h3 class="mb-0 text-success">${activeCount}</h3>
                <small class="text-muted">Активни</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="card text-center">
              <div class="card-body">
                <h3 class="mb-0 text-primary">${soldCount}</h3>
                <small class="text-muted">Продадени</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="card text-center">
              <div class="card-body">
                <h3 class="mb-0 text-warning">${draftCount}</h3>
                <small class="text-muted">Чернови</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <button class="nav-link ${this.filter === 'all' ? 'active' : ''}" data-filter="all">
              Всички (${this.listings.length})
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link ${this.filter === 'active' ? 'active' : ''}" data-filter="active">
              Активни (${activeCount})
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link ${this.filter === 'sold' ? 'active' : ''}" data-filter="sold">
              Продадени (${soldCount})
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link ${this.filter === 'draft' ? 'active' : ''}" data-filter="draft">
              Чернови (${draftCount})
            </button>
          </li>
        </ul>

        <!-- Listings Table -->
        <div class="card">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Обява</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th>Прегледания</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody id="listings-table-body">
                <!-- Listings will be rendered here -->
              </tbody>
            </table>
          </div>
        </div>

        ${this.listings.length === 0 ? `
          <div class="text-center py-5">
            <i class="bi bi-inbox display-1 text-muted"></i>
            <p class="text-muted mt-3">Все още нямате обяви.</p>
            <a href="/listings/create" class="btn btn-primary">
              <i class="bi bi-plus-circle me-2"></i>Създай първата си обява
            </a>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderListings() {
    const tbody = document.getElementById('listings-table-body');
    if (!tbody) return;

    const filteredListings = this.filter === 'all'
      ? this.listings
      : this.listings.filter(l => l.status === this.filter);

    if (filteredListings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-4">
            Няма обяви в тази категория.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredListings.map(listing => {
      const primaryImage = listing.listing_images?.find(img => img.is_primary) || listing.listing_images?.[0];
      const imageUrl = primaryImage?.url || '/images/placeholder.jpg';

      return `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <img src="${imageUrl}" alt="" class="rounded me-3"
                style="width: 60px; height: 60px; object-fit: cover;">
              <div>
                <a href="/listings/view?id=${listing.id}" class="text-decoration-none fw-bold">
                  ${this.escapeHtml(listing.title)}
                </a>
                <small class="d-block text-muted">
                  ${formatCondition(listing.condition)}
                  ${listing.is_urgent ? ' • <span class="text-danger">Спешно</span>' : ''}
                </small>
              </div>
            </div>
          </td>
          <td>
            <span class="text-primary fw-bold">
              ${listing.price ? formatPrice(listing.price) : 'По договаряне'}
            </span>
          </td>
          <td>
            <span class="badge ${this.getStatusBadgeClass(listing.status)}">
              ${formatStatus(listing.status)}
            </span>
          </td>
          <td>${listing.views_count || 0}</td>
          <td>
            <small>${formatDate(listing.created_at)}</small>
          </td>
          <td>
            <div class="btn-group btn-group-sm">
              <a href="/listings/view?id=${listing.id}" class="btn btn-outline-primary">
                <i class="bi bi-eye"></i>
              </a>
              <a href="/listings/edit?id=${listing.id}" class="btn btn-outline-secondary">
                <i class="bi bi-pencil"></i>
              </a>
              <button class="btn btn-outline-danger" data-delete-id="${listing.id}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  attachEventListeners() {
    // Filter tabs
    this.container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filter = btn.dataset.filter;
        this.container.innerHTML = this.getTemplate();
        this.renderListings();
        this.attachEventListeners();
      });
    });

    // Delete buttons
    this.container.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const listingId = btn.dataset.deleteId;
        await this.deleteListing(listingId);
      });
    });
  }

  async deleteListing(id) {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази обява?')) {
      return;
    }

    try {
      await listingService.deleteListing(id);
      window.showToast('Обявата е изтрита.', 'success');
      await this.loadListings();
      this.container.innerHTML = this.getTemplate();
      this.renderListings();
      this.attachEventListeners();
    } catch (error) {
      console.error('Delete error:', error);
      window.showToast('Грешка при изтриване.', 'error');
    }
  }

  getStatusBadgeClass(status) {
    const classes = {
      'active': 'bg-success',
      'sold': 'bg-primary',
      'draft': 'bg-warning text-dark',
      'expired': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
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
          Възникна грешка при зареждане на обявите.
        </div>
      </div>
    `;
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default MyListingsPage;
