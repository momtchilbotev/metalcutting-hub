import { listingService } from '../../services/listings.js';
import { formatPrice, formatDate, formatCondition, formatRelativeTime } from '../../utils/formatters.js';

export class ListingDetailsPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listing = null;
  }

  async render() {
    try {
      // Get listing ID from params
      const listingId = this.params.id;
      console.log('[ListingDetails] Loading listing:', listingId);
      if (!listingId) {
        this.showNotFound();
        return;
      }

      // Load listing data
      await this.loadListing(listingId);

      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading listing:', error);
      this.showError();
    }
  }

  async loadListing(id) {
    // Try to fetch listing with retry logic for database propagation delay
    let listing = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (!listing && attempts < maxAttempts) {
      listing = await listingService.getListingById(id);
      if (listing) break;
      attempts++;
      if (attempts < maxAttempts) {
        // Wait before retry (for database propagation)
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    this.listing = listing;

    if (!this.listing) {
      this.showNotFound();
      return;
    }

    // Load similar listings
    if (this.listing.category_id) {
      const similar = await listingService.getSimilarListings(
        id,
        this.listing.category_id,
        4
      );
      this.similarListings = similar;
    }

    // Check if in watchlist
    this.isInWatchlist = await listingService.isInWatchlist(id);
  }

  getTemplate() {
    const listing = this.listing;
    if (!listing) return '';

    const primaryImage = this.getPrimaryImage();
    const allImages = listing.listing_images || [];

    return `
      <div class="container py-4">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-3">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/">Начало</a></li>
            <li class="breadcrumb-item"><a href="/listings">Обяви</a></li>
            ${listing.categories ? `
              <li class="breadcrumb-item"><a href="/listings?category=${listing.categories.slug}">${this.escapeHtml(listing.categories.name_bg)}</a></li>
            ` : ''}
            <li class="breadcrumb-item active">${this.escapeHtml(listing.title)}</li>
          </ol>
        </nav>

        <div class="row">
          <!-- Images Section -->
          <div class="col-lg-8 mb-4">
            <div class="card">
              <div class="card-body p-0">
                <!-- Main Image -->
                <div class="position-relative">
                  <img src="${primaryImage?.url || '/images/placeholder.svg'}"
                    id="main-image"
                    class="w-100 rounded-top"
                    style="max-height: 500px; object-fit: contain; background: #f5f5f5;"
                    alt="${this.escapeHtml(listing.title)}">

                  <!-- Badges -->
                  <div class="position-absolute top-0 start-0 p-3">
                    ${listing.is_urgent ? '<span class="badge bg-danger fs-6">Спешно!</span>' : ''}
                    ${listing.is_featured ? '<span class="badge bg-warning text-dark fs-6 ms-1">Препоръчано</span>' : ''}
                  </div>

                  <div class="position-absolute top-0 end-0 p-3">
                    <span class="badge bg-secondary fs-6">${formatCondition(listing.condition)}</span>
                  </div>
                </div>

                <!-- Thumbnails -->
                ${allImages.length > 1 ? `
                  <div class="p-3 bg-light">
                    <div class="d-flex gap-2 overflow-auto">
                      ${allImages.map((img, idx) => `
                        <img src="${img.url || '/images/placeholder.svg'}"
                          class="thumbnail ${idx === 0 ? 'border-primary' : ''}"
                          style="width: 80px; height: 80px; object-fit: cover; cursor: pointer;"
                          onclick="document.getElementById('main-image').src='${img.url}'"
                          alt="Thumbnail ${idx + 1}">
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Description -->
            <div class="card mt-3">
              <div class="card-body">
                <h5 class="card-title">Описание</h5>
                <p class="card-text whitespace-pre-line">${this.escapeHtml(listing.description || 'Няма описание.')}</p>
              </div>
            </div>

            <!-- Details -->
            <div class="card mt-3">
              <div class="card-body">
                <h5 class="card-title">Детайли</h5>
                <dl class="row">
                  <dt class="col-sm-4">Категория:</dt>
                  <dd class="col-sm-8">
                    ${listing.categories ? `<a href="/listings?category=${listing.categories.slug}">${this.escapeHtml(listing.categories.name_bg)}</a>` : '-'}
                  </dd>

                  <dt class="col-sm-4">Състояние:</dt>
                  <dd class="col-sm-8">${formatCondition(listing.condition)}</dd>

                  <dt class="col-sm-4">Локация:</dt>
                  <dd class="col-sm-8">${listing.locations ? this.escapeHtml(listing.locations.name_bg) : '-'}</dd>

                  <dt class="col-sm-4">Публикувано:</dt>
                  <dd class="col-sm-8">${formatRelativeTime(listing.created_at)}</dd>

                  <dt class="col-sm-4">Прегледания:</dt>
                  <dd class="col-sm-8">${listing.views_count || 0}</dd>

                  <dt class="col-sm-4">ID:</dt>
                  <dd class="col-sm-8"><code>${listing.id}</code></dd>
                </dl>
              </div>
            </div>
          </div>

          <!-- Info Sidebar -->
          <div class="col-lg-4">
            <!-- Price Card -->
            <div class="card mb-3">
              <div class="card-body">
                <h3 class="card-title text-primary mb-0">
                  ${listing.price ? formatPrice(listing.price) : 'По договаряне'}
                </h3>
                ${listing.condition !== 'new' ? `
                  <small class="text-muted">+ДДО ако е приложимо</small>
                ` : ''}
              </div>
            </div>

            <!-- Seller Card -->
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title mb-3">Продавач</h5>
                <div class="d-flex align-items-center mb-3">
                  <div class="flex-shrink-0">
                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                      style="width: 50px; height: 50px;">
                      <i class="bi bi-person fs-4"></i>
                    </div>
                  </div>
                  <div class="ms-3">
                    <h6 class="mb-0">${this.escapeHtml(listing.profiles?.full_name || 'Потребител')}</h6>
                    <small class="text-muted">
                      ${listing.profiles?.is_verified ? '<i class="bi bi-check-circle-fill text-primary"></i> Верифициран' : ''}
                      ${listing.profiles?.location_name ? `• ${this.escapeHtml(listing.profiles.location_name)}` : ''}
                    </small>
                  </div>
                </div>

                <div class="d-grid gap-2">
                  <button class="btn btn-primary" id="contact-seller-btn">
                    <i class="bi bi-chat-dots me-2"></i>Свържи се с продавача
                  </button>
                  <a href="tel:${this.escapeHtml(listing.profiles?.phone || '')}"
                    class="btn btn-outline-success">
                    <i class="bi bi-telephone me-2"></i>${this.escapeHtml(listing.profiles?.phone || 'Покажи телефон')}
                  </a>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="card mb-3">
              <div class="card-body">
                <div class="d-grid gap-2">
                  <button class="btn btn-outline-primary" id="watchlist-btn">
                    <i class="bi ${this.isInWatchlist ? 'bi-heart-fill' : 'bi-heart'}"></i>
                    ${this.isInWatchlist ? 'В наблюдавани' : 'Добави в наблюдавани'}
                  </button>
                  <button class="btn btn-outline-secondary" id="share-btn">
                    <i class="bi bi-share"></i> Сподели
                  </button>
                  <button class="btn btn-outline-danger" id="report-btn">
                    <i class="bi bi-flag"></i> Докладвай
                  </button>
                </div>
              </div>
            </div>

            <!-- Safety Tips -->
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">
                  <i class="bi bi-shield-check text-success me-2"></i>
                  Съвети за безопасност
                </h6>
                <ul class="small mb-0">
                  <li>Срещнете се на публично място</li>
                  <li>Проверете стоката преди плащане</li>
                  <li>Не плащайте предварително</li>
                  <li>Използвайте сигурни методи за плащане</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Similar Listings -->
        ${this.similarListings && this.similarListings.length > 0 ? `
          <div class="row mt-5">
            <div class="col-12">
              <h4 class="mb-4">Подобни обяви</h4>
              <div class="row g-4">
                ${this.similarListings.map(listing => {
                  const primaryImg = listing.listing_images?.find(img => img.is_primary) || listing.listing_images?.[0];
                  const imgUrl = primaryImg?.url || '/images/placeholder.svg';

                  return `
                    <div class="col-6 col-md-3">
                      <a href="/listings/view?id=${listing.id}" class="text-decoration-none">
                        <div class="card h-100">
                          <img src="${imgUrl}" class="card-img-top" style="height: 150px; object-fit: cover;" alt="${this.escapeHtml(listing.title)}">
                          <div class="card-body p-2">
                            <h6 class="card-title small text-truncate text-dark">${this.escapeHtml(listing.title)}</h6>
                            <p class="card-text text-primary small mb-0">${listing.price ? formatPrice(listing.price) : 'По договаряне'}</p>
                          </div>
                        </div>
                      </a>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  attachEventListeners() {
    // Watchlist button
    const watchlistBtn = document.getElementById('watchlist-btn');
    if (watchlistBtn) {
      watchlistBtn.addEventListener('click', () => this.toggleWatchlist());
    }

    // Share button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareListing());
    }

    // Contact seller button
    const contactBtn = document.getElementById('contact-seller-btn');
    if (contactBtn) {
      contactBtn.addEventListener('click', () => this.contactSeller());
    }

    // Report button
    const reportBtn = document.getElementById('report-btn');
    if (reportBtn) {
      reportBtn.addEventListener('click', () => this.reportListing());
    }
  }

  async toggleWatchlist() {
    try {
      if (this.isInWatchlist) {
        await listingService.removeFromWatchlist(this.listing.id);
        this.isInWatchlist = false;
        window.showToast('Премахнато от наблюдавани', 'info');
      } else {
        await listingService.addToWatchlist(this.listing.id);
        this.isInWatchlist = true;
        window.showToast('Добавено в наблюдавани', 'success');
      }
      // Update button
      await this.render();
    } catch (error) {
      console.error('Watchlist error:', error);
      window.showToast('Грешка при операцията', 'error');
    }
  }

  shareListing() {
    const url = window.location.href;
    const title = this.listing?.title || 'Обява';

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

  contactSeller() {
    // Check if user is logged in
    import('../../services/auth.js').then(({ authService }) => {
      authService.getSession().then(session => {
        if (!session) {
          window.showToast('Трябва да влезете, за да изпратите съобщение.', 'warning');
          window.router.navigate('/login');
          return;
        }

        // Navigate to messages with listing ID
        window.router.navigate('/messages', { listing: this.listing.id });
      });
    });
  }

  reportListing() {
    window.showToast('Функцията за докладване предстои да бъде добавена.', 'info');
  }

  getPrimaryImage() {
    if (!this.listing.listing_images || this.listing.listing_images.length === 0) {
      return null;
    }
    return this.listing.listing_images.find(img => img.is_primary) || this.listing.listing_images[0];
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showNotFound() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-warning text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Обявата не е намерена или е изтекла.
        </div>
        <div class="text-center mt-3">
          <a href="/listings" class="btn btn-primary">Към всички обяви</a>
        </div>
      </div>
    `;
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Възникна грешка при зареждане на обявата.
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

export default ListingDetailsPage;
