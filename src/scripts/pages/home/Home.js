import { listingService } from '../../services/listings.js';
import { ListingCard } from '../../components/ListingCard.js';
import { storageService } from '../../services/storage.js';

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
      <section class="hero-section bg-primary text-white py-5">
        <div class="container py-4">
          <div class="row align-items-center">
            <div class="col-lg-8">
              <h1 class="display-4 fw-bold mb-3">
                <i class="bi bi-gear-wide-connected"></i>
                Metalcutting Hub
              </h1>
              <p class="lead mb-4">
                Пазарът за металорежещи инструменти в България.
                Намирайте най-добрите оферти за резбофрези, свредла, фрези и други.
              </p>

              <!-- Search Form -->
              <form id="home-search-form" class="row g-3">
                <div class="col-md-8">
                  <div class="input-group input-group-lg">
                    <span class="input-group-text bg-white">
                      <i class="bi bi-search"></i>
                    </span>
                    <input type="text" class="form-control" id="home-search-input"
                      placeholder="Търсете инструменти, резбофрези, фрези..."
                      aria-label="Търсене">
                  </div>
                </div>
                <div class="col-md-4">
                  <button type="submit" class="btn btn-light btn-lg w-100 text-primary fw-bold">
                    Търси
                  </button>
                </div>
              </form>
            </div>

            <div class="col-lg-4 d-none d-lg-block">
              <div class="text-center">
                <i class="bi bi-tools display-1 opacity-50"></i>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="row mt-5 pt-3 border-top border-light">
            <div class="col-md-3 col-6 mb-3 mb-md-0">
              <div class="text-center">
                <h3 class="mb-1">1000+</h3>
                <small class="opacity-75">Активни обяви</small>
              </div>
            </div>
            <div class="col-md-3 col-6 mb-3 mb-md-0">
              <div class="text-center">
                <h3 class="mb-1">500+</h3>
                <small class="opacity-75">Потребители</small>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="text-center">
                <h3 class="mb-1">10+</h3>
                <small class="opacity-75">Категории</small>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="text-center">
                <h3 class="mb-1">24/7</h3>
                <small class="opacity-75">Поддръжка</small>
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
      <section class="cta-section py-5 bg-primary text-white">
        <div class="container text-center py-4">
          <h2 class="mb-3">Имате инструменти за продажба?</h2>
          <p class="lead mb-4">Създайте обява за минути и достигнете до стотици купувачи.</p>
          <a href="/listings/create" class="btn btn-light btn-lg text-primary fw-bold">
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

    const categoryIcons = {
      'metalcutting-tools': 'bi-tools',
      'taps': 'bi-gear',
      'drills': 'bi-arrow-through-circle',
      'milling-cutters': 'bi-circle',
      'measuring-equipment': 'bi-rulers',
      'spare-parts': 'bi-puzzle-piece',
      'documentation': 'bi-file-text',
      'abrasives': 'bi-grid-3x3',
      'inserts': 'bi-square',
      'holding-tools': 'bi-clipboard-check'
    };

    grid.innerHTML = this.categories.slice(0, 8).map(cat => {
      const icon = categoryIcons[cat.slug] || 'bi-tag';
      const count = Math.floor(Math.random() * 100) + 10; // Placeholder count

      return `
        <div class="col-6 col-md-3">
          <a href="/listings?category=${encodeURIComponent(cat.slug)}"
            class="text-decoration-none category-card">
            <div class="card h-100 text-center hover-shadow transition-all">
              <div class="card-body p-3">
                <i class="bi ${icon} display-6 text-primary mb-2"></i>
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
