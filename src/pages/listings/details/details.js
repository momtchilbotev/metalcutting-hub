import './details.css';
import { listingService } from '../../../scripts/services/listings.js';
import { storageService } from '../../../scripts/services/storage.js';
import { ListingCard } from '../../../scripts/components/ListingCard.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { formatPrice, formatDate, formatCondition } from '../../../scripts/utils/formatters.js';
import { copyToClipboard } from '../../../scripts/utils/helpers.js';

export class ListingDetailsPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listingId = params.id;
    this.listing = null;
    this.similarListings = [];
    this.isInWatchlist = false;
  }

  async render() {
    if (!this.listingId) {
      window.router.navigate('/listings');
      return;
    }

    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.renderSimilarListings();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading listing:', error);
      this.showError();
    }
  }

  async loadData() {
    // Load listing details
    this.listing = await listingService.getListingById(this.listingId);

    // Check if in watchlist
    this.isInWatchlist = await listingService.isInWatchlist(this.listingId);

    // Load similar listings
    if (this.listing.category_id) {
      const result = await listingService.getSimilarListings(
        this.listingId,
        this.listing.category_id,
        4
      );
      this.similarListings = result;
    }
  }

  getLoadingTemplate() {
    return `
      <div class="container py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на обявата...</p>
        </div>
      </div>
    `;
  }

  getTemplate() {
    const listing = this.listing;
    const primaryImage = this.getPrimaryImage();
    const images = listing.listing_images || [];

    return `
      <div class="container py-4">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/">Начало</a></li>
            <li class="breadcrumb-item"><a href="/listings">Обяви</a></li>
            ${listing.categories ? `
              <li class="breadcrumb-item">
                <a href="/listings?category=${listing.categories.slug}">${this.escapeHtml(listing.categories.name_bg)}</a>
              </li>
            ` : ''}
            <li class="breadcrumb-item active">${this.escapeHtml(listing.title)}</li>
          </ol>
        </nav>

        <div class="row">
          <!-- Images Column -->
          <div class="col-lg-7 mb-4">
            <div class="card shadow-sm">
              <div class="card-body p-0">
                <!-- Main Image -->
                <div id="main-image-container" class="position-relative">
                  <img src="${primaryImage.url}"
                    class="img-fluid w-100 rounded-top"
                    alt="${this.escapeHtml(listing.title)}"
                    id="main-image"
                    style="max-height: 500px; object-fit: contain;">

                  ${listing.is_urgent ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2">Спешно!</span>' : ''}
                  ${listing.is_featured ? '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Препоръчано</span>' : ''}
                </div>

                <!-- Thumbnails -->
                ${images.length > 1 ? `
                  <div class="d-flex gap-2 p-2 overflow-auto">
                    ${images.map((img, index) => `
                      <img src="${img.url}"
                        class="rounded thumbnail ${img.is_primary ? 'border-primary' : ''}"
                        style="width: 80px; height: 80px; object-fit: cover; cursor: pointer; border: 2px solid transparent;"
                        data-full-url="${img.url}"
                        alt="Thumbnail ${index + 1}">
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Details Column -->
          <div class="col-lg-5">
            <div class="card shadow-sm mb-3">
              <div class="card-body">
                <!-- Title and Price -->
                <h1 class="h3 mb-2">${this.escapeHtml(listing.title)}</h1>
                <p class="h2 text-primary mb-3">
                  ${listing.price ? formatPrice(listing.price) : 'По договаряне'}
                </p>

                <!-- Badges -->
                <div class="d-flex gap-2 mb-3">
                  <span class="badge bg-secondary">${formatCondition(listing.condition)}</span>
                  ${listing.categories ? `
                    <a href="/listings?category=${listing.categories.slug}" class="badge bg-light text-dark text-decoration-none">
                      ${this.escapeHtml(listing.categories.name_bg)}
                    </a>
                  ` : ''}
                  ${listing.locations ? `
                    <span class="badge bg-light text-dark">
                      <i class="bi bi-geo-alt me-1"></i>${this.escapeHtml(listing.locations.name_bg)}
                    </span>
                  ` : ''}
                </div>

                <!-- Stats -->
                <div class="d-flex gap-4 text-muted small mb-4">
                  <span><i class="bi bi-eye me-1"></i> ${listing.views || 0} прегледа</span>
                  <span><i class="bi bi-calendar me-1"></i> ${formatDate(listing.created_at)}</span>
                </div>

                <!-- Actions -->
                <div class="d-grid gap-2">
                  <button class="btn btn-primary btn-lg" id="contact-seller-btn">
                    <i class="bi bi-chat-dots me-2"></i>Свържете се с продавача
                  </button>
                  <button class="btn btn-outline-success" id="show-phone-btn">
                    <i class="bi bi-telephone me-2"></i>Покажи телефон
                  </button>
                  <button class="btn btn-outline-danger" id="report-btn">
                    <i class="bi bi-flag me-2"></i>Докладвай нередност
                  </button>
                  <div class="btn-group">
                    <button class="btn btn-outline-primary" id="watchlist-btn">
                      <i class="bi bi-heart${this.isInWatchlist ? '-fill text-danger' : ''} me-1"></i>
                      ${this.isInWatchlist ? 'В наблюдавани' : 'Добави в наблюдавани'}
                    </button>
                    <button class="btn btn-outline-secondary" id="share-btn">
                      <i class="bi bi-share me-1"></i>Сподели
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Seller Card -->
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title">
                  <i class="bi bi-person-circle me-2"></i>Продавач
                </h5>
                <div class="d-flex align-items-center">
                  <img src="${listing.profiles?.avatar_url || '/images/default-avatar.png'}"
                    class="rounded-circle me-3"
                    style="width: 60px; height: 60px; object-fit: cover;"
                    alt="Seller">
                  <div>
                    <h6 class="mb-0">${this.escapeHtml(listing.profiles?.full_name || 'Продавач')}</h6>
                    <small class="text-muted">На сайта от ${formatDate(listing.profiles?.created_at || listing.created_at)}</small>
                    ${listing.profiles?.locations?.name_bg ? `
                      <div class="small text-muted">
                        <i class="bi bi-geo-alt me-1"></i>${this.escapeHtml(listing.profiles.locations.name_bg)}
                      </div>
                    ` : ''}
                  </div>
                </div>
                <a href="/messages?to=${listing.user_id}" class="btn btn-outline-primary btn-sm mt-3 w-100">
                  <i class="bi bi-envelope me-1"></i>Изпрати съобщение
                </a>
              </div>
            </div>

            <!-- Security Tips Card -->
            <div class="card shadow-sm mt-3 border-warning">
              <div class="card-body">
                <h5 class="card-title text-warning">
                  <i class="bi bi-shield-check me-2"></i>Съвети за безопасност
                </h5>
                <ul class="list-unstyled mb-0 small">
                  <li class="mb-2">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Срещнете се на публично място
                  </li>
                  <li class="mb-2">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Проверете стоката преди плащане
                  </li>
                  <li class="mb-2">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Не плащайте предварително
                  </li>
                  <li class="mb-0">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Използвайте сигурни методи за плащане
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="card shadow-sm mt-4">
          <div class="card-body">
            <h3 class="h5 mb-3">
              <i class="bi bi-file-text me-2"></i>Описание
            </h3>
            <div class="listing-description">
              ${this.formatDescription(listing.description)}
            </div>
          </div>
        </div>

        <!-- Similar Listings -->
        ${this.similarListings.length > 0 ? `
          <div class="mt-5">
            <h3 class="h4 mb-4">
              <i class="bi bi-collection me-2"></i>Подобни обяви
            </h3>
            <div id="similar-listings" class="row g-4">
              <!-- Similar listings will be rendered here -->
            </div>
          </div>
        ` : ''}

        <div class="text-center mt-4">
          <a href="/my-listings" class="text-decoration-none">← Назад към моите обяви</a>
        </div>
      </div>
    `;
  }

  getPrimaryImage() {
    const images = this.listing.listing_images || [];

    if (images.length === 0) {
      return { url: '/images/placeholder.svg' };
    }

    const primary = images.find(img => img.is_primary) || images[0];
    return primary;
  }

  formatDescription(text) {
    if (!text) return '<p class="text-muted">Няма описание</p>';
    return text.split('\n').map(p => `<p>${this.escapeHtml(p)}</p>`).join('');
  }

  renderSimilarListings() {
    const container = document.getElementById('similar-listings');
    if (!container || this.similarListings.length === 0) return;

    container.innerHTML = this.similarListings.map(listing => {
      const card = new ListingCard(listing);
      return card.render();
    }).join('');
  }

  attachEventListeners() {
    // Thumbnail clicks
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const mainImage = document.getElementById('main-image');
        if (mainImage && thumb.dataset.fullUrl) {
          mainImage.src = thumb.dataset.fullUrl;
        }

        // Update active state
        thumbnails.forEach(t => t.classList.remove('border-primary'));
        thumb.classList.add('border-primary');
      });
    });

    // Contact seller
    const contactBtn = document.getElementById('contact-seller-btn');
    if (contactBtn) {
      contactBtn.addEventListener('click', () => this.contactSeller());
    }

    // Watchlist
    const watchlistBtn = document.getElementById('watchlist-btn');
    if (watchlistBtn) {
      watchlistBtn.addEventListener('click', () => this.toggleWatchlist());
    }

    // Share
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareListing());
    }

    // Show phone
    const showPhoneBtn = document.getElementById('show-phone-btn');
    if (showPhoneBtn) {
      showPhoneBtn.addEventListener('click', () => this.showPhone());
    }

    // Report
    const reportBtn = document.getElementById('report-btn');
    if (reportBtn) {
      reportBtn.addEventListener('click', () => this.reportListing());
    }
  }

  async contactSeller() {
    // Check if user is logged in
    const { authService } = await import('../../../scripts/services/auth.js');
    const user = await authService.getUser();

    if (!user) {
      Toast.warning('Моля, влезте в профила си за да се свържете с продавача.');
      window.router.navigate('/login', { redirect: window.location.pathname + window.location.search });
      return;
    }

    window.router.navigate(`/messages?to=${this.listing.user_id}&listing=${this.listingId}`);
  }

  async toggleWatchlist() {
    const watchlistBtn = document.getElementById('watchlist-btn');
    if (!watchlistBtn) return;

    try {
      if (this.isInWatchlist) {
        await listingService.removeFromWatchlist(this.listingId);
        this.isInWatchlist = false;
        watchlistBtn.innerHTML = '<i class="bi bi-heart me-1"></i>Добави в наблюдавани';
        Toast.info('Премахнато от наблюдавани');
      } else {
        await listingService.addToWatchlist(this.listingId);
        this.isInWatchlist = true;
        watchlistBtn.innerHTML = '<i class="bi bi-heart-fill text-danger me-1"></i>В наблюдавани';
        Toast.success('Добавено в наблюдавани');
      }
    } catch (error) {
      Toast.error('Моля, влезте за да добавите в наблюдавани');
    }
  }

  async shareListing() {
    const url = window.location.href;
    const title = this.listing.title;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      const success = await copyToClipboard(url);
      if (success) {
        Toast.success('Линкът е копиран!');
      } else {
        Toast.error('Грешка при копиране на линка.');
      }
    }
  }

  async showPhone() {
    const phone = this.listing.profiles?.phone;

    if (!phone) {
      Toast.info('Продавачът не е предоставил телефонен номер.');
      return;
    }

    const showPhoneBtn = document.getElementById('show-phone-btn');
    if (showPhoneBtn) {
      showPhoneBtn.innerHTML = `<i class="bi bi-telephone me-2"></i><a href="tel:${phone}" class="text-success text-decoration-none">${phone}</a>`;
      showPhoneBtn.classList.remove('btn-outline-success');
      showPhoneBtn.classList.add('btn-success');
    }
  }

  async reportListing() {
    // Check if user is logged in
    const { authService } = await import('../../../scripts/services/auth.js');
    const user = await authService.getUser();

    if (!user) {
      Toast.warning('Моля, влезте в профила си за да докладвате нередност.');
      window.router.navigate('/login', { redirect: window.location.pathname + window.location.search });
      return;
    }

    // Check if already reported
    const hasReported = await listingService.hasReportedListing(this.listingId);
    if (hasReported) {
      Toast.info('Вече сте докладвали тази обява.');
      return;
    }

    const reason = prompt('Моля, опишете нередността:');
    if (!reason) return;

    try {
      await listingService.reportListing(this.listingId, reason);
      Toast.success('Благодарим ви! Докладът е изпратен.');
    } catch (error) {
      Toast.error(error.message || 'Грешка при изпращане на доклада.');
    }
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Обявата не е намерена.
        </div>
        <div class="text-center">
          <a href="/listings" class="btn btn-primary">Към обявите</a>
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

export default ListingDetailsPage;
