import './my-listings.css';
import { listingService } from '../../../scripts/services/listings.js';
import { authService } from '../../../scripts/services/auth.js';
import { ListingCard } from '../../../scripts/components/ListingCard.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { formatPrice, formatDate, formatStatus } from '../../../scripts/utils/formatters.js';

export class MyListingsPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listings = [];
    this.currentPage = parseInt(params.page) || 1;
    this.itemsPerPage = 10;
    this.totalCount = 0;
    this.statusFilter = params.status || '';
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading my listings:', error);
      this.showError();
    }
  }

  async loadData() {
    const filters = {
      page: this.currentPage,
      items_per_page: this.itemsPerPage
    };

    if (this.statusFilter) {
      filters.status = this.statusFilter;
    }

    // Load profile to ensure avatar is available in sidebar
    const [result] = await Promise.all([
      listingService.getMyListings(filters),
      authService.getProfile()
    ]);

    this.listings = result.listings;
    this.totalCount = result.count;
  }

  getLoadingTemplate() {
    return `
      <div class="container py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на обявите...</p>
        </div>
      </div>
    `;
  }

  getTemplate() {
    return `
      <div class="container py-4">
        <div class="row">
          <!-- Sidebar -->
          <div class="col-lg-3 mb-4">
            <div class="card shadow-sm">
              <div class="card-body text-center">
                <img src="${authService.currentProfile?.avatar_url || '/images/default-avatar.png'}"
                  class="rounded-circle mb-3"
                  style="width: 80px; height: 80px; object-fit: cover;"
                  alt="Profile">
                <h6 class="card-title">${this.escapeHtml(authService.currentProfile?.full_name || 'Потребител')}</h6>
              </div>
              <div class="list-group list-group-flush">
                <a href="/profile" class="list-group-item list-group-item-action">
                  <i class="bi bi-person me-2"></i>Профил
                </a>
                <a href="/my-listings" class="list-group-item list-group-item-action active">
                  <i class="bi bi-list-ul me-2"></i>Моите обяви
                </a>
                <a href="/watchlist" class="list-group-item list-group-item-action">
                  <i class="bi bi-heart me-2"></i>Наблюдавани
                </a>
                <a href="/messages" class="list-group-item list-group-item-action">
                  <i class="bi bi-chat me-2"></i>Съобщения
                </a>
                <button class="list-group-item list-group-item-action text-danger" id="logout-btn">
                  <i class="bi bi-box-arrow-right me-2"></i>Изход
                </button>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="col-lg-9">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 class="h4 mb-1">
                  <i class="bi bi-list-ul text-primary me-2"></i>Моите обяви
                </h2>
                <p class="text-muted mb-0">${this.totalCount} обяви</p>
              </div>
              <a href="/listings/create" class="btn btn-primary">
                <i class="bi bi-plus-circle me-1"></i>Нова обява
              </a>
            </div>

            <!-- Filters -->
            <div class="mb-3">
              <div class="btn-group" role="group">
                <a href="/my-listings" class="btn btn-outline-primary ${!this.statusFilter ? 'active' : ''}">
                  Всички
                </a>
                <a href="/my-listings?status=active" class="btn btn-outline-primary ${this.statusFilter === 'active' ? 'active' : ''}">
                  Активни
                </a>
                <a href="/my-listings?status=draft" class="btn btn-outline-primary ${this.statusFilter === 'draft' ? 'active' : ''}">
                  Чернови
                </a>
                <a href="/my-listings?status=sold" class="btn btn-outline-primary ${this.statusFilter === 'sold' ? 'active' : ''}">
                  Продадени
                </a>
                <a href="/my-listings?status=expired" class="btn btn-outline-primary ${this.statusFilter === 'expired' ? 'active' : ''}">
                  Изтекли
                </a>
              </div>
            </div>

            <!-- Listings List -->
            <div id="listings-list">
              ${this.listings.length === 0 ? this.getEmptyTemplate() : this.getListTemplate()}
            </div>

            <!-- Pagination -->
            <nav id="pagination" class="mt-4">
              ${this.getPaginationTemplate()}
            </nav>
          </div>
        </div>
      </div>
    `;
  }

  getListTemplate() {
    return this.listings.map(listing => `
      <div class="card shadow-sm mb-3 listing-item" data-id="${listing.id}">
        <div class="card-body">
          <div class="row align-items-center">
            <!-- Image -->
            <div class="col-auto">
              <a href="/listings/view?id=${listing.id}">
                <img src="${this.getListingImage(listing)}"
                  class="rounded"
                  style="width: 100px; height: 80px; object-fit: cover;"
                  alt="${this.escapeHtml(listing.title)}">
              </a>
            </div>

            <!-- Info -->
            <div class="col">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h5 class="mb-1">
                    <a href="/listings/view?id=${listing.id}" class="text-decoration-none text-dark">
                      ${this.escapeHtml(listing.title)}
                    </a>
                  </h5>
                  <p class="text-muted small mb-1">
                    ${listing.categories?.name_bg || 'Без категория'}
                    ${listing.locations ? ` | ${listing.locations.name_bg}` : ''}
                  </p>
                  <div class="d-flex gap-2 align-items-center">
                    <span class="badge bg-${this.getStatusBadgeClass(listing.status)}">
                      ${formatStatus(listing.status)}
                    </span>
                    <small class="text-muted">
                      <i class="bi bi-eye me-1"></i>${listing.views_count || 0} прегледа
                    </small>
                  </div>
                </div>
                <div class="text-end">
                  <p class="h5 text-primary mb-1">
                    ${listing.price ? formatPrice(listing.price) : 'По договаряне'}
                  </p>
                  <small class="text-muted">${formatDate(listing.created_at)}</small>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="col-auto">
              <div class="btn-group-vertical btn-group-sm">
                <a href="/listings/edit?id=${listing.id}" class="btn btn-outline-primary">
                  <i class="bi bi-pencil"></i>
                </a>
                ${listing.status === 'active' ? `
                  <button class="btn btn-outline-success btn-mark-sold" data-id="${listing.id}" title="Маркирай като продадено">
                    <i class="bi bi-check-circle"></i>
                  </button>
                ` : ''}
                ${listing.status === 'expired' || listing.status === 'draft' || listing.status === 'sold' ? `
                  <button class="btn btn-outline-info btn-renew" data-id="${listing.id}" title="Поднови">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                ` : ''}
                <button class="btn btn-outline-danger btn-delete" data-id="${listing.id}" title="Изтрий">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  getEmptyTemplate() {
    // Special message for expired listings
    if (this.statusFilter === 'expired') {
      return `
        <div class="text-center py-5">
          <i class="bi bi-clock display-1 text-muted"></i>
          <h4 class="mt-3">Нямате изтекли обяви</h4>
          <p class="text-muted">Обява с давност 3 месеца се води изтекла</p>
        </div>
      `;
    }

    // Special message for sold listings
    if (this.statusFilter === 'sold') {
      return `
        <div class="text-center py-5">
          <i class="bi bi-check-circle display-1 text-muted"></i>
          <h4 class="mt-3">Нямате продадени обяви</h4>
        </div>
      `;
    }

    // Special message for draft listings
    if (this.statusFilter === 'draft') {
      return `
        <div class="text-center py-5">
          <i class="bi bi-file-earmark-text display-1 text-muted"></i>
          <h4 class="mt-3">Нямате чернови</h4>
          <p class="text-muted">Незапазените обяви се съхраняват като чернови</p>
        </div>
      `;
    }

    return `
      <div class="text-center py-5">
        <i class="bi bi-inbox display-1 text-muted"></i>
        <h4 class="mt-3">Нямате обяви</h4>
        <p class="text-muted">Започнете да продавате като създадете първата си обява</p>
        <a href="/listings/create" class="btn btn-primary mt-2">
          <i class="bi bi-plus-circle me-1"></i> Създайте обява
        </a>
      </div>
    `;
  }

  getListingImage(listing) {
    if (listing.listing_images && listing.listing_images.length > 0) {
      const primary = listing.listing_images.find(img => img.is_primary) || listing.listing_images[0];
      return primary.url || '/images/placeholder.svg';
    }
    return '/images/placeholder.svg';
  }

  getStatusBadgeClass(status) {
    const classes = {
      active: 'success',
      draft: 'secondary',
      sold: 'info',
      expired: 'warning'
    };
    return classes[status] || 'secondary';
  }

  getPaginationTemplate() {
    const totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
    if (totalPages <= 1) return '';

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(`
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `);
    }

    return `<ul class="pagination justify-content-center">${pages.join('')}</ul>`;
  }

  attachEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    const pagination = document.getElementById('pagination');

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await authService.logout();
      });
    }

    // Pagination
    if (pagination) {
      pagination.addEventListener('click', (e) => {
        e.preventDefault();
        const pageLink = e.target.closest('.page-link');
        if (pageLink) {
          const page = parseInt(pageLink.dataset.page);
          if (page && page !== this.currentPage) {
            this.currentPage = page;
            window.router.navigate('/my-listings', { page, status: this.statusFilter });
          }
        }
      });
    }

    // Mark as sold
    document.querySelectorAll('.btn-mark-sold').forEach(btn => {
      btn.addEventListener('click', () => this.markAsSold(btn.dataset.id));
    });

    // Renew
    document.querySelectorAll('.btn-renew').forEach(btn => {
      btn.addEventListener('click', () => this.renewListing(btn.dataset.id));
    });

    // Delete
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => this.deleteListing(btn.dataset.id));
    });
  }

  async markAsSold(listingId) {
    Toast.confirm('Маркиране на обявата като продадена?', async () => {
      try {
        await listingService.markAsSold(listingId);
        Toast.success('Обявата е маркирана като продадена!');
        await this.render();
      } catch (error) {
        Toast.error('Грешка при маркиране.');
      }
    });
  }

  async renewListing(listingId) {
    try {
      await listingService.renewListing(listingId);
      Toast.success('Обявата е подновена!');
      await this.render();
    } catch (error) {
      Toast.error('Грешка при подновяване.');
    }
  }

  async deleteListing(listingId) {
    Toast.confirm('Сигурни ли сте, че искате да изтриете тази обява?', async () => {
      try {
        await listingService.deleteListing(listingId);
        Toast.success('Обявата е изтрита!');
        await this.render();
      } catch (error) {
        Toast.error('Грешка при изтриване.');
      }
    });
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на обявите.
        </div>
        <div class="text-center">
          <button class="btn btn-primary" onclick="window.location.reload()">Опитайте отново</button>
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

export default MyListingsPage;
