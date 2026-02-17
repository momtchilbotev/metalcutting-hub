import { authService } from '../services/auth.js';
import { isAdmin } from '../services/admin.js';
import { formatPrice } from '../utils/formatters.js';

export class Navbar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentUser = null;
    this.isAdminUser = false;
    this.authSubscription = null;
  }

  async render() {
    // Get current session
    const session = await authService.getSession();
    this.currentUser = session?.user || null;

    // Check if admin
    if (this.currentUser) {
      this.isAdminUser = await isAdmin();
    }

    this.container.innerHTML = this.getTemplate();

    // Attach event listeners
    this.attachEventListeners();

    // Initialize auth state listener on first render
    if (!this.authSubscription) {
      this.initAuthListener();
    }
  }

  initAuthListener() {
    // Subscribe to auth state changes
    const { data } = authService.onAuthStateChange(async (event, session) => {
      this.currentUser = session?.user || null;
      this.isAdminUser = this.currentUser ? await isAdmin() : false;
      await this.render();
    });

    this.authSubscription = data.subscription;
  }

  getTemplate() {
    const authLinks = this.currentUser
      ? this.getAuthenticatedLinks()
      : this.getGuestLinks();

    return `
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
        <div class="container">
          <a class="navbar-brand" href="/">
            <i class="bi bi-gear-wide-connected me-2"></i>
            Metalcutting Hub
          </a>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" href="/">Начало</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/listings">Обяви</a>
              </li>
            </ul>

            <ul class="navbar-nav">
              ${authLinks}
            </ul>

            ${this.getSearchForm()}
          </div>
        </div>
      </nav>
    `;
  }

  getGuestLinks() {
    return `
      <li class="nav-item">
        <a class="nav-link" href="/login">Вход</a>
      </li>
      <li class="nav-item">
        <a class="nav-link fw-bold" href="/register">Регистрация</a>
      </li>
    `;
  }

  getAuthenticatedLinks() {
    let links = `
      <li class="nav-item">
        <a class="nav-link" href="/listings/create">
          <i class="bi bi-plus-circle"></i> Нова обява
        </a>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
          data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle"></i>
          ${this.getUserDisplayName()}
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li><a class="dropdown-item" href="/profile"><i class="bi bi-person me-2"></i>Моят профил</a></li>
          <li><a class="dropdown-item" href="/my-listings"><i class="bi bi-list-ul me-2"></i>Моите обяви</a></li>
          <li><a class="dropdown-item" href="/watchlist"><i class="bi bi-heart me-2"></i>Наблюдавани</a></li>
          <li><a class="dropdown-item" href="/messages"><i class="bi bi-chat me-2"></i>Съобщения</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" id="logout-btn"><i class="bi bi-box-arrow-right me-2"></i>Изход</a></li>
        </ul>
      </li>
    `;

    if (this.isAdminUser) {
      links = `
        <li class="nav-item">
          <a class="nav-link" href="/admin">
            <i class="bi bi-shield-lock"></i> Admin
          </a>
        </li>
      ` + links;
    }

    return links;
  }

  getUserDisplayName() {
    if (!this.currentUser) return '';

    const metadata = this.currentUser.user_metadata || {};
    return metadata.full_name || metadata.name || this.currentUser.email?.split('@')[0] || 'Потребител';
  }

  getSearchForm() {
    return `
      <form class="d-flex ms-lg-3" id="navbar-search">
        <div class="input-group input-group-sm">
          <input class="form-control" type="search" placeholder="Търси..." aria-label="Търси"
            id="navbar-search-input">
          <button class="btn btn-outline-light" type="submit">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </form>
    `;
  }

  attachEventListeners() {
    // Search form
    const searchForm = document.getElementById('navbar-search');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('navbar-search-input').value;
        if (query.trim()) {
          window.router.navigate('/listings', { q: query });
        }
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await authService.logout();
          window.router.navigate('/');
        } catch (error) {
          console.error('Logout error:', error);
          window.showToast('Грешка при излизане.', 'error');
        }
      });
    }

    // Close mobile menu on link click
    const navLinks = this.container.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const collapse = this.container.querySelector('.navbar-collapse');
        if (collapse && collapse.classList.contains('show')) {
          const bsCollapse = new bootstrap.Collapse(collapse);
          bsCollapse.hide();
        }
      });
    });
  }

  async refresh() {
    await this.render();
  }

  destroy() {
    // Clean up auth subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      this.authSubscription = null;
    }

    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
