import { listingService } from '../../services/listings.js';
import { ListingCard } from '../../components/ListingCard.js';

export class ListingListPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listings = [];
    this.categories = [];
    this.locations = [];
    this.filters = {
      page: 1,
      itemsPerPage: 20,
      status: 'active'
    };
  }

  async render() {
    try {
      // Parse query params
      this.parseQueryParams();

      // Load data
      await this.loadData();

      this.container.innerHTML = this.getTemplate();

      // Render content
      this.renderFilters();
      this.renderListings();
      this.renderPagination();

      // Attach event listeners
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading listings:', error);
      this.showError();
    }
  }

  parseQueryParams() {
    // Parse URL query params
    const params = new URLSearchParams(window.location.search);

    if (params.get('q')) {
      this.filters.search = params.get('q');
    }
    if (params.get('category')) {
      this.filters.category_slug = params.get('category');
    }
    if (params.get('location')) {
      this.filters.location_id = params.get('location');
    }
    if (params.get('condition')) {
      this.filters.condition = params.get('condition');
    }
    if (params.get('min_price')) {
      this.filters.min_price = parseFloat(params.get('min_price'));
    }
    if (params.get('max_price')) {
      this.filters.max_price = parseFloat(params.get('max_price'));
    }
    if (params.get('sort')) {
      const [orderBy, direction] = params.get('sort').split('_');
      this.filters.order_by = orderBy || 'created_at';
      this.filters.order_direction = direction || 'desc';
    }
    if (params.get('page')) {
      this.filters.page = parseInt(params.get('page')) || 1;
    }
  }

  async loadData() {
    // Load categories and locations for filters
    const [categoriesResult, locationsResult, listingsResult] = await Promise.all([
      listingService.getCategories(),
      listingService.getLocations('city'),
      listingService.getListings(this.filters)
    ]);

    this.categories = categoriesResult;
    this.locations = locationsResult;
    this.listings = listingsResult.listings;
    this.pagination = {
      count: listingsResult.count,
      page: listingsResult.page,
      itemsPerPage: listingsResult.itemsPerPage,
      totalPages: Math.ceil(listingsResult.count / listingsResult.itemsPerPage)
    };

    // Resolve category_id from slug
    if (this.filters.category_slug) {
      const category = this.categories.find(c => c.slug === this.filters.category_slug);
      if (category) {
        this.filters.category_id = category.id;
      }
    }
  }

  getTemplate() {
    return `
      <div class="container-fluid py-4">
        <div class="container">
          <div class="row">
            <!-- Filters Sidebar -->
            <div class="col-lg-3 mb-4">
              <div class="card">
                <div class="card-header bg-white">
                  <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                      <i class="bi bi-funnel me-2"></i>Филтри
                    </h5>
                    <button class="btn btn-sm btn-outline-secondary" id="clear-filters">
                      Изчисти
                    </button>
                  </div>
                </div>
                <div class="card-body">
                  <form id="filters-form">
                    <!-- Search -->
                    <div class="mb-3">
                      <label for="filter-search" class="form-label">Търсене</label>
                      <input type="text" class="form-control" id="filter-search"
                        placeholder="Търси в заглавието..."
                        value="${this.filters.search || ''}">
                    </div>

                    <!-- Category -->
                    <div class="mb-3">
                      <label for="filter-category" class="form-label">Категория</label>
                      <select class="form-select" id="filter-category">
                        <option value="">Всички категории</option>
                        ${this.categories.map(cat => `
                          <option value="${cat.slug}" ${this.filters.category_slug === cat.slug ? 'selected' : ''}>
                            ${this.escapeHtml(cat.name_bg)}
                          </option>
                        `).join('')}
                      </select>
                    </div>

                    <!-- Location -->
                    <div class="mb-3">
                      <label for="filter-location" class="form-label">Локация</label>
                      <select class="form-select" id="filter-location">
                        <option value="">Всички градове</option>
                        ${this.locations.map(loc => `
                          <option value="${loc.id}" ${this.filters.location_id == loc.id ? 'selected' : ''}>
                            ${this.escapeHtml(loc.name_bg)}
                          </option>
                        `).join('')}
                      </select>
                    </div>

                    <!-- Condition -->
                    <div class="mb-3">
                      <label class="form-label d-block">Състояние</label>
                      ${['new', 'used', 'refurbished'].map(cond => `
                        <div class="form-check">
                          <input class="form-check-input" type="radio" name="condition"
                            id="cond-${cond}" value="${cond}"
                            ${this.filters.condition === cond ? 'checked' : ''}>
                          <label class="form-check-label" for="cond-${cond}">
                            ${this.getConditionLabel(cond)}
                          </label>
                        </div>
                      `).join('')}
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="condition"
                          id="cond-all" value="" ${!this.filters.condition ? 'checked' : ''}>
                        <label class="form-check-label" for="cond-all">
                          Всички
                        </label>
                      </div>
                    </div>

                    <!-- Price Range -->
                    <div class="mb-3">
                      <label class="form-label">Цена (лв.)</label>
                      <div class="row g-2">
                        <div class="col-6">
                          <input type="number" class="form-control form-control-sm"
                            id="filter-min-price" placeholder="От"
                            value="${this.filters.min_price || ''}">
                        </div>
                        <div class="col-6">
                          <input type="number" class="form-control form-control-sm"
                            id="filter-max-price" placeholder="До"
                            value="${this.filters.max_price || ''}">
                        </div>
                      </div>
                    </div>

                    <!-- Apply Filters Button -->
                    <button type="submit" class="btn btn-primary w-100">
                      <i class="bi bi-check-lg me-2"></i>Приложи филтри
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <!-- Listings Grid -->
            <div class="col-lg-9">
              <!-- Results Header -->
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h1 class="h4 mb-1">Обяви</h1>
                  <small class="text-muted">
                    ${this.pagination.count} ${this.getCountLabel(this.pagination.count)}
                  </small>
                </div>
                <div class="d-flex gap-2">
                  <select class="form-select form-select-sm" id="sort-select" style="width: auto;">
                    <option value="created_at_desc" ${this.filters.order_by === 'created_at' && this.filters.order_direction === 'desc' ? 'selected' : ''}>
                      Най-нови
                    </option>
                    <option value="created_at_asc" ${this.filters.order_by === 'created_at' && this.filters.order_direction === 'asc' ? 'selected' : ''}>
                      Най-стари
                    </option>
                    <option value="price_asc" ${this.filters.order_by === 'price' && this.filters.order_direction === 'asc' ? 'selected' : ''}>
                      Цена: ниска към висока
                    </option>
                    <option value="price_desc" ${this.filters.order_by === 'price' && this.filters.order_direction === 'desc' ? 'selected' : ''}>
                      Цена: висока към ниска
                    </option>
                  </select>
                </div>
              </div>

              <!-- Active Filters -->
              ${this.renderActiveFilters()}

              <!-- Listings Grid -->
              <div id="listings-grid" class="row g-4">
                <!-- Listings will be rendered here -->
              </div>

              <!-- Pagination -->
              <div id="pagination-container" class="mt-4">
                <!-- Pagination will be rendered here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderFilters() {
    // Filters are rendered in template
  }

  renderListings() {
    const grid = document.getElementById('listings-grid');
    if (!grid) return;

    if (this.listings.length === 0) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <i class="bi bi-info-circle me-2"></i>
            Не са намерени обяви, отговарящи на критериите.
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.listings.map(listing => {
      const card = new ListingCard(listing);
      return card.render();
    }).join('');

    // Attach watchlist/share button listeners
    this.attachCardListeners();
  }

  renderPagination() {
    const container = document.getElementById('pagination-container');
    if (!container || this.pagination.totalPages <= 1) return;

    const { page, totalPages } = this.pagination;

    let paginationHtml = '<nav aria-label="Пагинация"><ul class="pagination justify-content-center">';

    // Previous button
    paginationHtml += `
      <li class="page-item ${page === 1 ? 'disabled' : ''}">
        <a class="page-link" href="?page=${page - 1}" aria-label="Предишна">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    `;

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    if (startPage > 1) {
      paginationHtml += '<li class="page-item"><a class="page-link" href="?page=1">1</a></li>';
      if (startPage > 2) {
        paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHtml += `
        <li class="page-item ${i === page ? 'active' : ''}">
          <a class="page-link" href="?page=${i}">${i}</a>
        </li>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
      paginationHtml += `<li class="page-item"><a class="page-link" href="?page=${totalPages}">${totalPages}</a></li>`;
    }

    // Next button
    paginationHtml += `
      <li class="page-item ${page === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="?page=${page + 1}" aria-label="Следваща">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `;

    paginationHtml += '</ul></nav>';
    container.innerHTML = paginationHtml;
  }

  renderActiveFilters() {
    const activeFilters = [];

    if (this.filters.search) activeFilters.push({ label: `Търсене: ${this.filters.search}`, key: 'search' });
    if (this.filters.category_slug) {
      const cat = this.categories.find(c => c.slug === this.filters.category_slug);
      if (cat) activeFilters.push({ label: cat.name_bg, key: 'category' });
    }
    if (this.filters.location_id) {
      const loc = this.locations.find(l => l.id == this.filters.location_id);
      if (loc) activeFilters.push({ label: loc.name_bg, key: 'location' });
    }
    if (this.filters.condition) activeFilters.push({ label: this.getConditionLabel(this.filters.condition), key: 'condition' });
    if (this.filters.min_price) activeFilters.push({ label: `От ${this.filters.min_price} лв.`, key: 'min_price' });
    if (this.filters.max_price) activeFilters.push({ label: `До ${this.filters.max_price} лв.`, key: 'max_price' });

    if (activeFilters.length === 0) return '';

    return `
      <div class="mb-3">
        ${activeFilters.map(f => `
          <span class="badge bg-light text-secondary me-2 mb-1">
            ${this.escapeHtml(f.label)}
            <a href="#" class="text-decoration-none ms-1" data-remove-filter="${f.key}">
              <i class="bi bi-x"></i>
            </a>
          </span>
        `).join('')}
      </div>
    `;
  }

  attachEventListeners() {
    // Filters form
    const filtersForm = document.getElementById('filters-form');
    if (filtersForm) {
      filtersForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.applyFilters();
      });
    }

    // Clear filters
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        window.router.navigate('/listings');
      });
    }

    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        const [orderBy, direction] = sortSelect.value.split('_');
        this.filters.order_by = orderBy;
        this.filters.order_direction = direction;
        this.applyFilters();
      });
    }

    // Remove active filters
    this.container.querySelectorAll('[data-remove-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.dataset.removeFilter;
        delete this.filters[`${key}_slug`];
        delete this.filters[`${key}_id`];
        delete this.filters[key];
        this.applyFilters();
      });
    });
  }

  attachCardListeners() {
    // Watchlist buttons
    this.container.querySelectorAll('.btn-watchlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const listingId = btn.dataset.listingId;
        this.toggleWatchlist(listingId, btn);
      });
    });

    // Share buttons
    this.container.querySelectorAll('.btn-share').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const listingId = btn.dataset.listingId;
        const listingTitle = btn.dataset.listingTitle;
        this.shareListing(listingId, listingTitle);
      });
    });
  }

  async toggleWatchlist(listingId, button) {
    try {
      const icon = button.querySelector('i');
      const isInList = icon.classList.contains('bi-heart-fill');

      if (isInList) {
        await listingService.removeFromWatchlist(listingId);
        icon.classList.remove('bi-heart-fill');
        icon.classList.add('bi-heart');
        window.showToast('Премахнато от наблюдавани', 'info');
      } else {
        await listingService.addToWatchlist(listingId);
        icon.classList.remove('bi-heart');
        icon.classList.add('bi-heart-fill');
        window.showToast('Добавено в наблюдавани', 'success');
      }
    } catch (error) {
      console.error('Watchlist error:', error);
      window.showToast('Грешка при операцията', 'error');
    }
  }

  shareListing(listingId, title) {
    const url = `${window.location.origin}/listings/view?id=${listingId}`;
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        window.showToast('Линкът е копиран!', 'success');
      }).catch(() => {
        window.showToast('Грешка при копиране', 'error');
      });
    }
  }

  applyFilters() {
    const params = new URLSearchParams();

    if (this.filters.search) params.set('q', this.filters.search);
    if (this.filters.category_slug) params.set('category', this.filters.category_slug);
    if (this.filters.location_id) params.set('location', this.filters.location_id);
    if (this.filters.condition) params.set('condition', this.filters.condition);
    if (this.filters.min_price) params.set('min_price', this.filters.min_price);
    if (this.filters.max_price) params.set('max_price', this.filters.max_price);
    if (this.filters.order_by) params.set('sort', `${this.filters.order_by}_${this.filters.order_direction}`);
    if (this.filters.page > 1) params.set('page', this.filters.page);

    const queryString = params.toString();
    window.router.navigate(`/listings${queryString ? `?${queryString}` : ''}`);
  }

  getConditionLabel(condition) {
    const labels = {
      'new': 'Ново',
      'used': 'Използвано',
      'refurbished': 'Реконструирано'
    };
    return labels[condition] || condition;
  }

  getCountLabel(count) {
    if (count === 1) return 'обява';
    if (count >= 2 && count <= 4) return 'обяви';
    return 'обяви';
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

export default ListingListPage;
