import { authService } from './services/auth.js';
import { adminGuard } from './services/admin.js';
import { moderatorGuard } from './services/moderator.js';

const routes = {
  '/': {
    page: () => import('../pages/home/home.js'),
    title: 'Metalcutting Hub - Начало',
    template: '/pages/home/home.html'
  },
  '/login': {
    page: () => import('../pages/auth/login/login.js'),
    title: 'Вход - Metalcutting Hub',
    template: '/pages/auth/login/login.html'
  },
  '/register': {
    page: () => import('../pages/auth/register/register.js'),
    title: 'Регистрация - Metalcutting Hub',
    template: '/pages/auth/register/register.html'
  },
  '/listings': {
    page: () => import('../pages/listings/list/list.js'),
    title: 'Обяви - Metalcutting Hub',
    template: '/pages/listings/list/list.html'
  },
  '/listings/create': {
    page: () => import('../pages/listings/create/create.js'),
    title: 'Нова обява - Metalcutting Hub',
    template: '/pages/listings/create/create.html',
    guard: authService.getSession.bind(authService)
  },
  '/listings/edit': {
    page: () => import('../pages/listings/edit/edit.js'),
    title: 'Редактирай обява - Metalcutting Hub',
    template: '/pages/listings/edit/edit.html',
    guard: authService.getSession.bind(authService)
  },
  '/listings/view': {
    page: () => import('../pages/listings/details/details.js'),
    title: 'Детайли - Metalcutting Hub',
    template: '/pages/listings/details/details.html'
  },
  '/profile': {
    page: () => import('../pages/user/profile/profile.js'),
    title: 'Моят профил - Metalcutting Hub',
    template: '/pages/user/profile/profile.html',
    guard: authService.getSession.bind(authService)
  },
  '/my-listings': {
    page: () => import('../pages/user/my-listings/my-listings.js'),
    title: 'Моите обяви - Metalcutting Hub',
    template: '/pages/user/my-listings/my-listings.html',
    guard: authService.getSession.bind(authService)
  },
  '/watchlist': {
    page: () => import('../pages/user/watchlist/watchlist.js'),
    title: 'Наблюдавани - Metalcutting Hub',
    template: '/pages/user/watchlist/watchlist.html',
    guard: authService.getSession.bind(authService)
  },
  '/messages': {
    page: () => import('../pages/messages/messages.js'),
    title: 'Съобщения - Metalcutting Hub',
    template: '/pages/messages/messages.html',
    guard: authService.getSession.bind(authService)
  },
  '/admin': {
    page: () => import('../pages/admin/dashboard/dashboard.js'),
    title: 'Admin Panel - Metalcutting Hub',
    template: '/pages/admin/dashboard/dashboard.html',
    guard: () => adminGuard('admin')
  },
  '/admin/listings': {
    page: () => import('../pages/admin/listings/listings.js'),
    title: 'Manage Listings - Admin',
    template: '/pages/admin/listings/listings.html',
    guard: () => adminGuard('admin')
  },
  '/admin/users': {
    page: () => import('../pages/admin/users/users.js'),
    title: 'Manage Users - Admin',
    template: '/pages/admin/users/users.html',
    guard: () => adminGuard('admin')
  },
  '/admin/categories': {
    page: () => import('../pages/admin/categories/categories.js'),
    title: 'Manage Categories - Admin',
    template: '/pages/admin/categories/categories.html',
    guard: () => adminGuard('admin')
  },
  '/admin/audit': {
    page: () => import('../pages/admin/audit/audit.js'),
    title: 'Audit Log - Admin',
    template: '/pages/admin/audit/audit.html',
    guard: () => adminGuard('admin')
  },
  '/admin/reports': {
    page: () => import('../pages/admin/reports/reports.js'),
    title: 'Reports - Admin',
    template: '/pages/admin/reports/reports.html',
    guard: () => adminGuard('admin')
  },
  '/moderator': {
    page: () => import('../pages/moderator/dashboard/dashboard.js'),
    title: 'Moderator Panel - Metalcutting Hub',
    template: '/pages/moderator/dashboard/dashboard.html',
    guard: () => moderatorGuard()
  },
  '/moderator/listings': {
    page: () => import('../pages/moderator/listings/listings.js'),
    title: 'Manage Listings - Moderator',
    template: '/pages/moderator/listings/listings.html',
    guard: () => moderatorGuard()
  },
  '/moderator/categories': {
    page: () => import('../pages/moderator/categories/categories.js'),
    title: 'Manage Categories - Moderator',
    template: '/pages/moderator/categories/categories.html',
    guard: () => moderatorGuard()
  },
  '/moderator/reports': {
    page: () => import('../pages/moderator/reports/reports.js'),
    title: 'Reports - Moderator',
    template: '/pages/moderator/reports/reports.html',
    guard: () => moderatorGuard()
  },
  '/about': {
    page: () => import('../pages/about/about.js'),
    title: 'За нас - Metalcutting Hub',
    template: '/pages/about/about.html'
  }
};

class Router {
  constructor() {
    this.routes = routes;
    this.currentRoute = null;
    this.currentPage = null;
    this.params = {};

    // Handle browser back/forward
    window.addEventListener('popstate', () => this.handlePopState());

    // Intercept link clicks for client-side routing
    document.addEventListener('click', (e) => this.handleLinkClick(e));

    // Expose router to window for external access
    window.router = this;
  }

  /**
   * Navigate to a path
   * @param {string} path - The path to navigate to
   * @param {Object} params - Query parameters
   * @param {boolean} pushState - Whether to push to browser history
   */
  async navigate(path, params = {}, pushState = true) {
    // Parse params from path if not explicitly provided
    if (Object.keys(params).length === 0 && path.includes('?')) {
      const [_, queryString] = path.split('?');
      if (queryString) {
        const searchParams = new URLSearchParams(queryString);
        for (const [key, value] of searchParams) {
          params[key] = value;
        }
      }
    }
    this.params = params;

    // Build URL with query parameters
    let url = path;
    if (Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      // Remove existing query string from path if present
      const pathWithoutQuery = path.split('?')[0];
      url = `${pathWithoutQuery}?${queryString}`;
    }

    // Check auth guard if exists
    const route = this.findRoute(path);
    if (route?.guard) {
      const canAccess = await route.guard();
      if (!canAccess) {
        return;
      }
    }

    // Update browser history
    if (pushState) {
      window.history.pushState({ path }, '', url);
    }

    // Load the page
    await this.loadRoute(path, route);
  }

  /**
   * Find a route matching the path
   * @param {string} path - The path to match
   * @returns {Object|null} - The matched route or null
   */
  findRoute(path) {
    // Remove query string and hash
    const cleanPath = path.split('?')[0].split('#')[0];

    // Exact match first
    if (this.routes[cleanPath]) {
      return this.routes[cleanPath];
    }

    // Pattern matching for dynamic routes
    for (const [routePath, route] of Object.entries(this.routes)) {
      const pattern = routePath.replace(/:\w+/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(cleanPath)) {
        // Extract params from path
        const paramNames = (routePath.match(/:\w+/g) || []).map(p => p.substring(1));
        const values = cleanPath.match(regex) || [];
        values.shift(); // Remove full match
        paramNames.forEach((name, i) => {
          this.params[name] = values[i];
        });
        return route;
      }
    }

    return null;
  }

  /**
   * Load a route
   * @param {string} path - The path to load
   * @param {Object} route - The route configuration
   */
  async loadRoute(path, route = null) {
    if (!route) {
      route = this.findRoute(path);
    }

    if (!route) {
      this.showNotFound();
      return;
    }

    try {
      // Update page title
      document.title = route.title;

      // Get container
      const container = document.getElementById('app-container');
      if (!container) {
        console.error('App container not found');
        return;
      }

      // Clear container
      container.innerHTML = '<div class="container py-5"><div class="text-center"><div class="spinner-border" role="status"></div></div></div>';

      // Load page module
      const module = await route.page();
      const PageClass = module.default || Object.values(module)[0];

      // Destroy current page if exists
      if (this.currentPage?.destroy) {
        this.currentPage.destroy();
      }

      // Create and render new page
      this.currentPage = new PageClass('app-container', this.params);
      await this.currentPage.render();

      // Scroll to top
      window.scrollTo(0, 0);

      // Emit route change event
      window.dispatchEvent(new CustomEvent('route-change', {
        detail: { path, params: this.params }
      }));

    } catch (error) {
      console.error('Error loading route:', error);
      this.showError(error);
    }
  }

  /**
   * Handle browser popstate (back/forward buttons)
   */
  async handlePopState() {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    await this.navigate(path, params, false);
  }

  /**
   * Intercept link clicks for client-side routing
   * @param {Event} e - The click event
   */
  handleLinkClick(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip external links, links with target, or special links
    if (
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('javascript:') ||
      href === '#' ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey
    ) {
      return;
    }

    // Prevent default for client-side routing
    e.preventDefault();

    // Parse path and params
    const [path, queryString] = href.split('?');
    const params = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      for (const [key, value] of searchParams) {
        params[key] = value;
      }
    }

    this.navigate(path, params);
  }

  /**
   * Show 404 page
   */
  showNotFound() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
      <div class="container py-5">
        <div class="text-center">
          <h1 class="display-1">404</h1>
          <p class="lead">Страницата не е намерена</p>
          <a href="/" class="btn btn-primary">Към началната страница</a>
        </div>
      </div>
    `;
  }

  /**
   * Show error page
   * @param {Error} error - The error to display
   */
  showError(error) {
    const container = document.getElementById('app-container');
    if (!container) return;

    console.error(error);

    container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger">
          <h4 class="alert-heading">Грешка!</h4>
          <p>Възникна грешка при зареждане на страницата.</p>
          <hr>
          <p class="mb-0">${error.message || 'Моля, опитайте отново по-късно.'}</p>
        </div>
        <a href="/" class="btn btn-primary">Към началната страница</a>
      </div>
    `;
  }

  /**
   * Get current params
   * @returns {Object} - Current route params
   */
  getParams() {
    return this.params;
  }

  /**
   * Initialize router on first load
   */
  init() {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    this.navigate(path, params, false);
  }
}

export const router = new Router();
