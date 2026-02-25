import './home.css';
import { listingService } from '../../scripts/services/listings.js';
import { ListingCard } from '../../scripts/components/ListingCard.js';
import { storageService } from '../../scripts/services/storage.js';

export class HomePage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listings = [];
    this.categories = [];
  }

  async render() {
    try {
      // Load data
      await this.loadData();

      this.container.innerHTML = this.getTemplate();

      // Render categories
      this.renderCategories();

      // Render listings
      this.renderListings();

      // Attach event listeners
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading home page:', error);
      this.showError();
    }
  }

  async loadData() {
    // Load featured listings
    const result = await listingService.getListings({
      status: 'active',
      is_featured: true,
      limit: 8
    });
    this.listings = result.listings;

    // Load categories
    this.categories = await listingService.getCategories();
  }

  getTemplate() {
    return `
      <section class="hero-section">
        <!-- Floating decorative shapes -->
        <div class="hero-shape hero-shape-1"></div>
        <div class="hero-shape hero-shape-2"></div>
        <div class="hero-shape hero-shape-3"></div>
        <div class="hero-shape hero-shape-4"></div>

        <div class="container py-5">
          <div class="row align-items-center">
            <div class="col-lg-7 hero-content">
              <h1 class="hero-title">
                <i class="bi bi-gear-wide-connected hero-icon"></i>
                Metalcutting Hub
              </h1>
              <p class="hero-subtitle mb-4">
                Пазарът за всичко необходимо за металообработка в България.
                Намерете най-добрите оферти за резервни части, измервателни и режещи инструменти.
              </p>

              <!-- Modern Search Box -->
              <form id="home-search-form" class="hero-search-box d-flex align-items-center mb-3">
                <span class="hero-search-icon">
                  <i class="bi bi-search"></i>
                </span>
                <input type="text" class="form-control hero-search-input flex-grow-1"
                  id="home-search-input"
                  placeholder="Търсете инструменти, резервни части..."
                  aria-label="Търсене">
                <button type="submit" class="btn hero-search-btn">
                  <i class="bi bi-arrow-right-circle me-2"></i>Търси
                </button>
              </form>

              <!-- Trust Badge -->
              <div class="hero-trust-badge">
                <i class="bi bi-shield-check"></i>
                <span>Безопасни сделки & проверени продавачи</span>
              </div>
            </div>

            <!-- Hero Visual -->
            <div class="col-lg-5 d-none d-lg-block">
              <div class="hero-visual">
                <i class="bi bi-gear-wide hero-visual-icon"></i>
                <i class="bi bi-tools hero-visual-inner"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="hero-stats">
          <div class="container">
            <div class="row">
              <div class="col-6 col-md-3">
                <div class="hero-stat-item">
                  <div class="hero-stat-number">1000+</div>
                  <div class="hero-stat-label">Активни обяви</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="hero-stat-item">
                  <div class="hero-stat-number">500+</div>
                  <div class="hero-stat-label">Потребители</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="hero-stat-item">
                  <div class="hero-stat-number">10+</div>
                  <div class="hero-stat-label">Категории</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="hero-stat-item">
                  <div class="hero-stat-number">24/7</div>
                  <div class="hero-stat-label">Поддръжка</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories-section py-5">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">
              <i class="bi bi-grid text-primary"></i> Категории
            </h2>
            <a href="/listings" class="btn btn-outline-primary">Всички обяви</a>
          </div>
          <div id="categories-grid" class="row g-3">
            <!-- Categories will be rendered here -->
          </div>
        </div>
      </section>

      <!-- Featured Listings Section -->
      <section class="listings-section py-5 bg-light">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">
              <i class="bi bi-star-fill text-warning"></i> Препоръчани обяви
            </h2>
            <a href="/listings" class="btn btn-outline-primary">Всички обяви</a>
          </div>
          <div id="listings-grid" class="row g-4">
            <!-- Listings will be rendered here -->
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section py-5">
        <div class="container text-center py-5">
          <h2 class="cta-title mb-3">Имате инструменти за продажба?</h2>
          <p class="cta-subtitle mb-4">Създайте обява за минути и достигнете до стотици купувачи.</p>
          <a href="/listings/create" class="btn cta-btn">
            <i class="bi bi-plus-circle me-2"></i>Нова обява
          </a>
        </div>
      </section>

      <!-- How it works Section -->
      <section class="how-it-works-section py-5">
        <div class="container">
          <h2 class="text-center mb-5">
            <i class="bi bi-question-circle text-primary"></i> Как работи?
          </h2>
          <div class="row g-4">
            <div class="col-md-4 text-center">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="display-4 text-primary mb-3">
                    <i class="bi bi-1-circle-fill"></i>
                  </div>
                  <h4 class="card-title">Регистрирайте се</h4>
                  <p class="card-text text-muted">
                    Създайте безплатен акаунт за минути.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-4 text-center">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="display-4 text-primary mb-3">
                    <i class="bi bi-2-circle-fill"></i>
                  </div>
                  <h4 class="card-title">Създайте обява</h4>
                  <p class="card-text text-muted">
                    Добавете снимки и описание на вашите инструменти.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-4 text-center">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="display-4 text-primary mb-3">
                    <i class="bi bi-3-circle-fill"></i>
                  </div>
                  <h4 class="card-title">Продайте</h4>
                  <p class="card-text text-muted">
                    комуникирайте с купувачите и завършете сделката.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderCategories() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    // Fallback Bootstrap icons by slug
    const fallbackIcons = {
      'metalcutting-tools': 'bi-tools',
      'taps': 'bi-gear',
      'drills': 'bi-arrow-through-circle',
      'milling-cutters': 'bi-circle',
      'measuring-equipment': 'bi-rulers',
      'spare-parts': 'bi-puzzle-piece',
      'documentation': 'bi-file-text',
      'abrasives': 'bi-grid-3x3',
      'inserts': 'bi-square',
      'holding-tools': 'bi-clipboard-check',
      'others': 'bi-tag'
    };

    grid.innerHTML = this.categories.slice(0, 8).map(cat => {
      const fallbackIcon = fallbackIcons[cat.slug] || 'bi-tag';
      const count = Math.floor(Math.random() * 100) + 10; // Placeholder count

      // Use uploaded icon if available, otherwise use fallback Bootstrap icon
      const iconHtml = cat.icon_url
        ? `<img src="${this.escapeHtml(cat.icon_url)}" alt="${this.escapeHtml(cat.name_bg)}" class="category-icon-img mb-2">`
        : `<i class="bi ${fallbackIcon} display-6 text-primary mb-2"></i>`;

      return `
        <div class="col-6 col-md-3">
          <a href="/listings?category=${encodeURIComponent(cat.slug)}"
            class="text-decoration-none category-card">
            <div class="card h-100 text-center hover-shadow transition-all">
              <div class="card-body p-3">
                <div class="d-flex justify-content-center align-items-center" style="height: 48px;">
                  ${iconHtml}
                </div>
                <h5 class="card-title small mb-1 text-dark">${this.escapeHtml(cat.name_bg)}</h5>
                <small class="text-muted">${count} обяви</small>
              </div>
            </div>
          </a>
        </div>
      `;
    }).join('');
  }

  renderListings() {
    const grid = document.getElementById('listings-grid');
    if (!grid) return;

    if (this.listings.length === 0) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <i class="bi bi-info-circle me-2"></i>
            В момента няма активни обяви.
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.listings.map(listing => {
      const card = new ListingCard(listing);
      return card.render();
    }).join('');
  }

  attachEventListeners() {
    // Search form
    const searchForm = document.getElementById('home-search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('home-search-input').value;
        if (query.trim()) {
          window.router.navigate('/listings', { q: query });
        }
      });
    }
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
          Възникна грешка при зареждане на страницата.
        </div>
        <div class="text-center mt-3">
          <a href="/" class="btn btn-primary">Опитайте отново</a>
        </div>
      </div>
    `;
  }

  destroy() {
    // Clean up if needed
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default HomePage;
