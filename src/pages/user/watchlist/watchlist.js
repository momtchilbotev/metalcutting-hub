import './watchlist.css';
import { listingService } from '../../../scripts/services/listings.js';
import { authService } from '../../../scripts/services/auth.js';
import { storageService } from '../../../scripts/services/storage.js';
import { ListingCard } from '../../../scripts/components/ListingCard.js';
import { Toast } from '../../../scripts/components/Toast.js';

export class WatchlistPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listings = [];
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading watchlist:', error);
      this.showError();
    }
  }

  async loadData() {
    // Get watchlist from database
    const { supabase } = await import('../../../scripts/utils/supabaseClient.js');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.router.navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('watchlist')
      .select(`
        listing_id,
        created_at,
        listings (
          *,
          profiles:profiles!listings_user_id_fkey(id, full_name, avatar_url),
          categories:categories!listings_category_id_fkey(id, name_bg, slug),
          locations:locations!listings_location_id_fkey(id, name_bg),
          listing_images(id, storage_path, is_primary, order_index)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Process listings to add image URLs
    this.listings = (data || []).map(item => {
      const listing = item.listings;
      if (listing && listing.listing_images) {
        listing.listing_images = listing.listing_images.map(img => ({
          ...img,
          url: storageService.getPublicUrl(img.storage_path)
        }));
      }
      return listing;
    }).filter(l => l && l.status === 'active');
  }

  getLoadingTemplate() {
    return `
      <div class="container py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на наблюдаваните...</p>
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
                <a href="/my-listings" class="list-group-item list-group-item-action">
                  <i class="bi bi-list-ul me-2"></i>Моите обяви
                </a>
                <a href="/watchlist" class="list-group-item list-group-item-action active">
                  <i class="bi bi-heart me-2"></i>Наблюдавани
                </a>
                <a href="/messages" class="list-group-item list-group-item-action">
                  <i class="bi bi-chat me-2"></i>Съобщения
                </a>
                <button type="button" class="list-group-item list-group-item-action text-danger" id="sidebar-logout-btn">
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
                  <i class="bi bi-heart text-danger me-2"></i>Наблюдавани обяви
                </h2>
                <p class="text-muted mb-0">${this.listings.length} обяви</p>
              </div>
            </div>

            <!-- Listings Grid -->
            <div id="watchlist-grid" class="row g-4">
              ${this.listings.length === 0 ? this.getEmptyTemplate() : this.getListingsTemplate()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getListingsTemplate() {
    return this.listings.map(listing => {
      const card = new ListingCard(listing, { isWatchlisted: true });
      return card.render();
    }).join('');
  }

  getEmptyTemplate() {
    return `
      <div class="col-12">
        <div class="text-center py-5">
          <i class="bi bi-heart display-1 text-muted"></i>
          <h4 class="mt-3">Няма наблюдавани обяви</h4>
          <p class="text-muted">Добавете обяви към списъка си с наблюдавани, за да ги видите тук</p>
          <a href="/listings" class="btn btn-primary mt-2">
            <i class="bi bi-search me-1"></i> Разгледайте обявите
          </a>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const logoutBtn = this.container.querySelector('#sidebar-logout-btn');

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await authService.logout();
        } catch (error) {
          console.error('Sidebar logout error:', error);
          Toast.error('Грешка при излизане.');
        }
      });
    }

    // Watchlist buttons
    document.querySelectorAll('.btn-watchlist').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const listingId = btn.dataset.listingId;
        try {
          await listingService.removeFromWatchlist(listingId);
          Toast.info('Премахнато от наблюдавани');

          // Remove the listing card
          const card = btn.closest('.col-12');
          if (card) {
            card.remove();
          }

          // Update count
          this.listings = this.listings.filter(l => l.id !== listingId);

          // Check if empty
          if (this.listings.length === 0) {
            const grid = document.getElementById('watchlist-grid');
            if (grid) {
              grid.innerHTML = this.getEmptyTemplate();
            }
          }
        } catch (error) {
          Toast.error('Грешка при премахване.');
        }
      });
    });
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на наблюдаваните.
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

export default WatchlistPage;
