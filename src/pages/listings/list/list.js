import './list.css';
import { listingService } from '../../../scripts/services/listings.js';
import { ListingCard } from '../../../scripts/components/ListingCard.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { debounce } from '../../../scripts/utils/helpers.js';

export class ListingListPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listings = [];
    this.categories = [];
    this.locations = [];
    this.currentPage = parseInt(params.page) || 1;
    this.itemsPerPage = 12;
    this.totalCount = 0;
    this.filters = {
      category: params.category || '',
      location: params.location || '',
      condition: params.condition || '',
      minPrice: params.minPrice || '',
      maxPrice: params.maxPrice || '',
      search: params.q || ''
    };
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.renderListings();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading listings:', error);
      this.showError();
    }
  }

  async loadData() {
    // Load categories and locations for filters
    const [categories, locations] = await Promise.all([
      listingService.getCategories(),
      listingService.getLocations()
    ]);

    this.categories = categories;
    this.locations = locations;

    // Build filter object
    const filterParams = {
      status: 'active',
      page: this.currentPage,
      items_per_page: this.itemsPerPage
    };

    if (this.filters.category) {
      const cat = this.categories.find(c => c.slug === this.filters.category);
      if (cat) filterParams.category_id = cat.id;
    }

    if (this.filters.location) {
      filterParams.location_id = this.filters.location;
    }

    if (this.filters.condition) {
      filterParams.condition = this.filters.condition;
    }

    if (this.filters.minPrice) {
      filterParams.min_price = parseFloat(this.filters.minPrice);
    }

    if (this.filters.maxPrice) {
      filterParams.max_price = parseFloat(this.filters.maxPrice);
    }

    if (this.filters.search) {
      filterParams.search = this.filters.search;
    }

    // Load listings
    const result = await listingService.getListings(filterParams);
    this.listings = result.listings;
    this.totalCount = result.count;
  }

  getLoadingTemplate() {
    return `
      <div class="container py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на обяви...</p>
        </div>
      </div>
    `;
  }

  getTemplate() {
    return `
      <div class="container py-4">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-1">
              <i class="bi bi-list-ul text-primary"></i> Обяви
            </h1>
            <p class="text-muted mb-0">${this.totalCount} обяви намерени</p>
          </div>
          <a href="/listings/create" class="btn btn-primary">
            <i class="bi bi-plus-circle me-1"></i> Нова обява
          </a>
        </div>

        <div class="row">
          <!-- Filters Sidebar -->
          <div class="col-lg-3 mb-4">
            <div class="card">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="bi bi-funnel me-2"></i>Филтри
                </h5>
              </div>
              <div class="card-body">
                <form id="filter-form">
                  <!-- Search -->
                  <div class="mb-3">
                    <label for="search" class="form-label">Търсене</label>
                    <input type="text" class="form-control" id="search" name="search"
                      value="${this.escapeHtml(this.filters.search)}"
                      placeholder="Търсете обяви...">
                  </div>

                  <!-- Category -->
                  <div class="mb-3">
                    <label for="category" class="form-label">Категория</label>
                    <select class="form-select" id="category" name="category">
                      <option value="">Всички категории</option>
                      ${this.categories.map(cat => `
                        <option value="${cat.slug}" ${this.filters.category === cat.slug ? 'selected' : ''}>
                          ${this.escapeHtml(cat.name_bg)}
                        </option>
                      `).join('')}
                    </select>
                  </div>

                  <!-- Location -->
                  <div class="mb-3">
                    <label for="location" class="form-label">Локация</label>
                    <select class="form-select" id="location" name="location">
                      <option value="">Всички локации</option>
                      ${this.locations.map(loc => `
                        <option value="${loc.id}" ${this.filters.location === loc.id ? 'selected' : ''}>
                          ${this.escapeHtml(loc.name_bg)}
                        </option>
                      `).join('')}
                    </select>
                  </div>

                  <!-- Condition -->
                  <div class="mb-3">
                    <label for="condition" class="form-label">Състояние</label>
                    <select class="form-select" id="condition" name="condition">
                      <option value="">Всички</option>
                      <option value="new" ${this.filters.condition === 'new' ? 'selected' : ''}>Ново</option>
                      <option value="used" ${this.filters.condition === 'used' ? 'selected' : ''}>Използвано</option>
                      <option value="refurbished" ${this.filters.condition === 'refurbished' ? 'selected' : ''}>Реконструирано</option>
                    </select>
                  </div>

                  <!-- Price Range -->
                  <div class="mb-3">
                    <label class="form-label">Цена (лв.)</label>
                    <div class="row g-2">
                      <div class="col-6">
                        <input type="number" class="form-control" id="minPrice" name="minPrice"
                          value="${this.filters.minPrice}" placeholder="От" min="0">
                      </div>
                      <div class="col-6">
                        <input type="number" class="form-control" id="maxPrice" name="maxPrice"
                          value="${this.filters.maxPrice}" placeholder="До" min="0">
                      </div>
                    </div>
                  </div>

                  <!-- Filter Actions -->
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary">
                      <i class="bi bi-search me-1"></i> Търси
                    </button>
                    <button type="button" class="btn btn-outline-secondary" id="clear-filters">
                      <i class="bi bi-x-circle me-1"></i> Изчисти
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Listings Grid -->
          <div class="col-lg-9">
            <!-- Active Filters -->
            <div id="active-filters" class="mb-3">
              ${this.getActiveFiltersTemplate()}
            </div>

            <!-- Listings -->
            <div id="listings-grid" class="row g-4">
              <!-- Listings will be rendered here -->
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

  getActiveFiltersTemplate() {
    const activeFilters = [];

    if (this.filters.search) {
      activeFilters.push(`Търсене: "${this.filters.search}"`);
    }

    if (this.filters.category) {
      const cat = this.categories.find(c => c.slug === this.filters.category);
      if (cat) activeFilters.push(`Категория: ${cat.name_bg}`);
    }

    if (this.filters.condition) {
      const conditions = { new: 'Ново', used: 'Използвано', refurbished: 'Реконструирано' };
      activeFilters.push(`Състояние: ${conditions[this.filters.condition]}`);
    }

    if (activeFilters.length === 0) {
      return '';
    }

    return `
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <span class="text-muted">Активни филтри:</span>
        ${activeFilters.map(f => `
          <span class="badge bg-light text-dark">${this.escapeHtml(f)}</span>
        `).join('')}
      </div>
    `;
  }

  renderListings() {
    const grid = document.getElementById('listings-grid');
    if (!grid) return;

    if (this.listings.length === 0) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="text-center py-5">
            <i class="bi bi-inbox display-1 text-muted"></i>
            <h4 class="mt-3">Няма намерени обяви</h4>
            <p class="text-muted">Опитайте да промените филтрите си</p>
            <a href="/listings/create" class="btn btn-primary mt-2">
              <i class="bi bi-plus-circle me-1"></i> Създайте първата обява
            </a>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.listings.map(listing => {
      const card = new ListingCard(listing);
      return card.render();
    }).join('');

    // Attach watchlist event listeners
    this.attachWatchlistListeners();
  }

  getPaginationTemplate() {
    const totalPages = Math.ceil(this.totalCount / this.itemsPerPage);

    if (totalPages <= 1) return '';

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    pages.push(`
      <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${this.currentPage - 1}">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
    `);

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(`
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `);
    }

    // Next button
    pages.push(`
      <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${this.currentPage + 1}">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    `);

    return `
      <ul class="pagination justify-content-center">
        ${pages.join('')}
      </ul>
    `;
  }

  attachEventListeners() {
    const filterForm = document.getElementById('filter-form');
    const clearFiltersBtn = document.getElementById('clear-filters');

    // Filter form submission
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.applyFilters();
      });
    }

    // Clear filters
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        window.router.navigate('/listings');
      });
    }

    // Pagination clicks
    const pagination = document.getElementById('pagination');
    if (pagination) {
      pagination.addEventListener('click', (e) => {
        e.preventDefault();
        const pageLink = e.target.closest('.page-link');
        if (pageLink && !pageLink.parentElement.classList.contains('disabled')) {
          const page = parseInt(pageLink.dataset.page);
          if (page) {
            this.currentPage = page;
            this.applyFilters();
          }
        }
      });
    }

    // Real-time search (debounced)
    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => {
        this.filters.search = searchInput.value;
      }, 300));
    }
  }

  attachWatchlistListeners() {
    const watchlistBtns = document.querySelectorAll('.btn-watchlist');
    watchlistBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const listingId = btn.dataset.listingId;
        try {
          const isInWatchlist = await listingService.isInWatchlist(listingId);

          if (isInWatchlist) {
            await listingService.removeFromWatchlist(listingId);
            btn.innerHTML = '<i class="bi bi-heart"></i>';
            Toast.info('Премахнато от наблюдавани');
          } else {
            await listingService.addToWatchlist(listingId);
            btn.innerHTML = '<i class="bi bi-heart-fill text-danger"></i>';
            Toast.success('Добавено в наблюдавани');
          }
        } catch (error) {
          Toast.error('Моля, влезте за да добавите в наблюдавани');
        }
      });
    });
  }

  applyFilters() {
    const params = {};

    const search = document.getElementById('search')?.value;
    const category = document.getElementById('category')?.value;
    const location = document.getElementById('location')?.value;
    const condition = document.getElementById('condition')?.value;
    const minPrice = document.getElementById('minPrice')?.value;
    const maxPrice = document.getElementById('maxPrice')?.value;

    if (search) params.q = search;
    if (category) params.category = category;
    if (location) params.location = location;
    if (condition) params.condition = condition;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (this.currentPage > 1) params.page = this.currentPage;

    window.router.navigate('/listings', params);
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на обявите.
        </div>
        <div class="text-center">
          <button class="btn btn-primary" onclick="window.location.reload()">
            <i class="bi bi-arrow-clockwise me-1"></i> Опитайте отново
          </button>
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

export default ListingListPage;
