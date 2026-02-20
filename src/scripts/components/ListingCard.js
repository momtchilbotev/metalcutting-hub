import { formatPrice, formatDate, formatCondition } from '../utils/formatters.js';
import { storageService } from '../services/storage.js';

export class ListingCard {
  constructor(listing, options = {}) {
    this.listing = listing;
    this.options = {
      showLocation: options.showLocation !== false,
      showDate: options.showDate !== false,
      showCategory: options.showCategory || false,
      imageSize: options.imageSize || 'medium', // 'small', 'medium', 'large'
      compact: options.compact || false,
      isWatchlisted: options.isWatchlisted || false
    };
  }

  render() {
    const { listing, options } = this;
    const primaryImage = this.getPrimaryImage();
    const imageUrl = primaryImage?.url || this.getPlaceholderUrl();

    if (options.compact) {
      return this.renderCompact(imageUrl);
    }

    return this.renderFull(imageUrl);
  }

  renderFull(imageUrl) {
    const { listing } = this;
    const title = this.escapeHtml(listing.title);
    const location = listing.locations?.name_bg || '';
    const category = listing.categories?.name_bg || '';
    const sellerName = listing.profiles?.full_name || 'Продавач';

    return `
      <div class="col-12 col-md-6 col-lg-4 col-xl-3">
        <div class="card h-100 listing-card shadow-sm">
          <a href="/listings/view?id=${listing.id}" class="text-decoration-none">
            <div class="position-relative">
              <div class="listing-image-wrapper">
                <img src="${imageUrl}"
                  class="card-img-top listing-image"
                  alt="${title}"
                  loading="lazy"
                  onerror="this.src='${this.getPlaceholderUrl()}'">
              </div>
              <div class="listing-badges">
                ${listing.is_urgent ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2">Спешно!</span>' : ''}
                ${listing.is_featured ? '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Препоръчано</span>' : ''}
              </div>
              <span class="badge bg-secondary position-absolute bottom-0 end-0 m-2">
                ${formatCondition(listing.condition)}
              </span>
            </div>
          </a>

          <div class="card-body">
            <a href="/listings/view?id=${listing.id}" class="text-decoration-none">
              <h5 class="card-title text-truncate text-dark">${title}</h5>
            </a>

            ${listing.description ? `
              <p class="card-text text-muted small text-truncate">
                ${this.escapeHtml(listing.description)}
              </p>
            ` : ''}

            <p class="card-text h4 text-primary mb-2">
              ${listing.price ? formatPrice(listing.price) : 'По договаряне'}
            </p>

            <div class="d-flex justify-content-between align-items-center text-muted small">
              <div>
                ${this.options.showLocation ? `
                  <span class="me-3">
                    <i class="bi bi-geo-alt"></i> ${location || 'Няма локация'}
                  </span>
                ` : ''}
              </div>
              ${this.options.showDate ? `
                <span>
                  <i class="bi bi-clock"></i> ${formatDate(listing.created_at)}
                </span>
              ` : ''}
            </div>

            ${this.options.showCategory ? `
              <div class="mt-2">
                <span class="badge bg-light text-secondary">
                  <i class="bi bi-tag"></i> ${category}
                </span>
              </div>
            ` : ''}
          </div>

          <div class="card-footer bg-white border-top">
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i class="bi bi-person"></i> ${this.escapeHtml(sellerName)}
              </small>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary btn-watchlist"
                  data-listing-id="${listing.id}"
                  aria-label="Добави в наблюдавани">
                  <i class="bi ${this.options.isWatchlisted ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>
                </button>
                <button class="btn btn-outline-secondary btn-share"
                  data-listing-id="${listing.id}"
                  data-listing-title="${title}"
                  aria-label="Сподели">
                  <i class="bi bi-share"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCompact(imageUrl) {
    const { listing } = this;
    const title = this.escapeHtml(listing.title);

    return `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card listing-card-compact">
          <a href="/listings/view?id=${listing.id}" class="text-decoration-none d-flex">
            <div class="listing-image-compact-wrapper me-2">
              <img src="${imageUrl}"
                class="listing-image-compact"
                alt="${title}"
                loading="lazy"
                onerror="this.src='${this.getPlaceholderUrl()}'">
            </div>
            <div class="flex-grow-1">
              <h6 class="card-title text-truncate text-dark mb-1">${title}</h6>
              <p class="card-text text-primary small mb-1">
                ${listing.price ? formatPrice(listing.price) : 'По договаряне'}
              </p>
              <small class="text-muted">
                <i class="bi bi-geo-alt"></i> ${listing.locations?.name_bg || ''}

                ${listing.is_urgent ? '<span class="badge bg-danger ms-1">Спешно</span>' : ''}
              </small>
            </div>
          </a>
        </div>
      </div>
    `;
  }

  getPrimaryImage() {
    const { listing } = this;

    if (!listing.listing_images || listing.listing_images.length === 0) {
      return null;
    }

    // Find primary image
    const primary = listing.listing_images.find(img => img.is_primary);
    if (primary) {
      return {
        ...primary,
        url: storageService.getPublicUrl(primary.storage_path)
      };
    }

    // Return first image with URL
    const first = listing.listing_images[0];
    return {
      ...first,
      url: first.url || storageService.getPublicUrl(first.storage_path)
    };
  }

  getPlaceholderUrl() {
    return '/images/placeholder.svg';
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Static method to render multiple cards
  static renderGrid(listings, options = {}) {
    if (!listings || listings.length === 0) {
      return `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <i class="bi bi-info-circle me-2"></i>
            Няма намерени обяви.
          </div>
        </div>
      `;
    }

    return listings.map(listing => {
      const card = new ListingCard(listing, options);
      return card.render();
    }).join('');
  }

  // Static method to render compact list
  static renderList(listings, options = {}) {
    return this.renderGrid(listings, { ...options, compact: true });
  }
}
