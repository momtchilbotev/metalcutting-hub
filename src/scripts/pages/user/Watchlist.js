import { listingService } from '../../services/listings.js';
import { authService } from '../../services/auth.js';
import { supabase } from '../../utils/supabaseClient.js';
import { formatPrice, formatDate } from '../../utils/formatters.js';

export class WatchlistPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.watchlist = [];
  }

  async render() {
    // Check auth
    const session = await authService.getSession();
    if (!session) {
      window.router.navigate('/login');
      return;
    }

    try {
      await this.loadWatchlist();
      this.container.innerHTML = this.getTemplate();
      this.renderWatchlist();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading watchlist:', error);
      this.showError();
    }
  }

  async loadWatchlist() {
    const user = await authService.getUser();
    if (!user) return;

    // Get watchlist items with listing data
    const { data, error } = await supabase
      .from('watchlist')
      .select(`
        created_at,
        listings (
          id,
          title,
          price,
          condition,
          status,
          views_count,
          created_at,
          locations (name_bg),
          listing_images (
            storage_path,
            is_primary,
            order_index
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten and filter active listings
    this.watchlist = (data || [])
      .filter(item => item.listings && item.listings.status === 'active')
      .map(item => ({
        ...item.listings,
        watchlistDate: item.created_at,
        // Add image URLs
        listing_images: item.listings.listing_images?.map(img => ({
          ...img,
          url: this.getImageUrl(img.storage_path)
        })) || []
      }));
  }

  getTemplate() {
    return `
      <div class="container py-4">
        <div class="row">
          <div class="col-lg-10 mx-auto">
            <h1 class="mb-4">
              <i class="bi bi-heart-fill text-danger me-2"></i>Наблюдавани обяви
            </h1>

            ${this.watchlist.length > 0 ? `
              <div class="card">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Обява</th>
                        <th>Цена</th>
                        <th>Локация</th>
                        <th>Добавена на</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody id="watchlist-table-body">
                      <!-- Watchlist items will be rendered here -->
                    </tbody>
                  </table>
                </div>
              </div>
            ` : `
              <div class="text-center py-5">
                <i class="bi bi-heart display-1 text-muted"></i>
                <p class="text-muted mt-3">Нямате наблюдавани обяви.</p>
                <a href="/listings" class="btn btn-primary">
                  <i class="bi bi-search me-2"></i>Разгледай обявите
                </a>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  renderWatchlist() {
    const tbody = document.getElementById('watchlist-table-body');
    if (!tbody || this.watchlist.length === 0) return;

    tbody.innerHTML = this.watchlist.map(item => {
      const primaryImage = item.listing_images?.find(img => img.is_primary) || item.listing_images?.[0];
      const imageUrl = primaryImage?.url || '/images/placeholder.jpg';

      return `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <img src="${imageUrl}" alt="" class="rounded me-3"
                style="width: 80px; height: 80px; object-fit: cover;">
              <div>
                <a href="/listings/view?id=${item.id}" class="text-decoration-none fw-bold">
                  ${this.escapeHtml(item.title)}
                </a>
                <small class="d-block text-muted">
                  ${item.condition === 'new' ? 'Ново' : item.condition === 'used' ? 'Използвано' : 'Реконструирано'}
                </small>
              </div>
            </div>
          </td>
          <td>
            <span class="text-primary fw-bold">
              ${item.price ? formatPrice(item.price) : 'По договаряне'}
            </span>
          </td>
          <td>
            <small class="text-muted">
              ${item.locations ? this.escapeHtml(item.locations.name_bg) : '-'}
            </small>
          </td>
          <td>
            <small>${formatDate(item.watchlistDate)}</small>
          </td>
          <td>
            <div class="btn-group btn-group-sm">
              <a href="/listings/view?id=${item.id}" class="btn btn-outline-primary">
                <i class="bi bi-eye"></i> Преглед
              </a>
              <button class="btn btn-outline-danger" data-remove-id="${item.id}">
                <i class="bi bi-heartbreak"></i> Премахни
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  attachEventListeners() {
    // Remove buttons
    this.container.querySelectorAll('[data-remove-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const listingId = btn.dataset.removeId;
        await this.removeFromWatchlist(listingId);
      });
    });
  }

  async removeFromWatchlist(listingId) {
    try {
      await listingService.removeFromWatchlist(listingId);
      window.showToast('Премахнато от наблюдавани.', 'info');
      await this.loadWatchlist();
      this.container.innerHTML = this.getTemplate();
      this.renderWatchlist();
      this.attachEventListeners();
    } catch (error) {
      console.error('Remove error:', error);
      window.showToast('Грешка при премахване.', 'error');
    }
  }

  getImageUrl(storagePath) {
    if (!storagePath) return null;
    const { data } = supabase.storage
      .from('listing-images')
      .getPublicUrl(storagePath);
    return data.publicUrl;
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
          Възникна грешка при зареждане на наблюдаваните.
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

export default WatchlistPage;
