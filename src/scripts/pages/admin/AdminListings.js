import { adminService, hasRole } from '../../services/admin.js';
import { formatPrice, formatDate, formatStatus, formatCondition } from '../../utils/formatters.js';

export class AdminListings {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.listings = [];
    this.filter = 'all';
  }

  async render() {
    const hasAccess = await hasRole('admin');
    if (!hasAccess) {
      this.showAccessDenied();
      return;
    }

    try {
      await this.loadListings();
      this.container.innerHTML = this.getTemplate();
      this.renderListings();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading listings:', error);
      this.showError();
    }
  }

  async loadListings() {
    const result = await adminService.getListings({
      status: this.filter === 'all' ? undefined : this.filter,
      limit: 100
    });
    this.listings = result.listings;
  }

  getTemplate() {
    return `
      <div class="container-fluid py-4">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="mb-0">
                <i class="bi bi-list-check me-2"></i>Управление на обяви
              </h1>
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                  <li class="breadcrumb-item"><a href="/admin">Admin</a></li>
                  <li class="breadcrumb-item active">Обяви</li>
                </ol>
              </nav>
            </div>
          </div>

          <!-- Filter Tabs -->
          <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
              <button class="nav-link ${this.filter === 'all' ? 'active' : ''}" data-filter="all">
                Всички (${this.listings.length})
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link ${this.filter === 'active' ? 'active' : ''}" data-filter="active">
                Активни
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link ${this.filter === 'sold' ? 'active' : ''}" data-filter="sold">
                Продадени
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link ${this.filter === 'draft' ? 'active' : ''}" data-filter="draft">
                Чернови
              </button>
            </li>
          </ul>

          <!-- Listings Table -->
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Обява</th>
                      <th>Продавач</th>
                      <th>Цена</th>
                      <th>Статус</th>
                      <th>Дата</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody id="listings-table-body"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderListings() {
    const tbody = document.getElementById('listings-table-body');
    if (!tbody) return;

    const filtered = this.filter === 'all'
      ? this.listings
      : this.listings.filter(l => l.status === this.filter);

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Няма намерени обяви.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(l => `
      <tr>
        <td>
          <div class="fw-bold">${this.escapeHtml(l.title)}</div>
          <small class="text-muted">${formatCondition(l.condition)}</small>
        </td>
        <td>${this.escapeHtml(l.profiles?.full_name || '-')}</td>
        <td>${l.price ? formatPrice(l.price) : '-'}</td>
        <td><span class="badge ${this.getStatusClass(l.status)}">${formatStatus(l.status)}</span></td>
        <td><small>${formatDate(l.created_at)}</small></td>
        <td>
          <div class="btn-group btn-group-sm">
            <a href="/listings/view?id=${l.id}" class="btn btn-outline-primary" target="_blank">
              <i class="bi bi-eye"></i>
            </a>
            ${l.status !== 'active' ? `
              <button class="btn btn-outline-success" data-approve="${l.id}">
                <i class="bi bi-check"></i>
              </button>
            ` : ''}
            <button class="btn btn-outline-warning" data-featured="${l.id}">
              <i class="bi bi-star"></i>
            </button>
            <button class="btn btn-outline-danger" data-delete="${l.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  attachEventListeners() {
    // Filter tabs
    this.container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filter = btn.dataset.filter;
        this.loadListings().then(() => {
          this.container.innerHTML = this.getTemplate();
          this.renderListings();
          this.attachEventListeners();
        });
      });
    });

    // Action buttons
    this.container.querySelectorAll('[data-approve]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.approve;
        await adminService.approveListing(id);
        window.showToast('Обявата е одобрена.', 'success');
        this.loadListings().then(() => {
          this.container.innerHTML = this.getTemplate();
          this.renderListings();
          this.attachEventListeners();
        });
      });
    });

    this.container.querySelectorAll('[data-featured]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.featured;
        await adminService.toggleFeatured(id, true);
        window.showToast('Препоръчаната обява е обновена.', 'success');
      });
    });

    this.container.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Сигурни ли сте?')) return;
        const id = btn.dataset.delete;
        await adminService.rejectListing(id);
        window.showToast('Обявата е отхвърлена.', 'success');
        this.loadListings().then(() => {
          this.container.innerHTML = this.getTemplate();
          this.renderListings();
          this.attachEventListeners();
        });
      });
    });
  }

  getStatusClass(status) {
    const classes = { active: 'bg-success', sold: 'bg-primary', draft: 'bg-warning', expired: 'bg-secondary' };
    return classes[status] || 'bg-secondary';
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showAccessDenied() {
    this.container.innerHTML = `<div class="container py-5"><div class="alert alert-danger text-center">Нямате достъп.</div></div>`;
  }

  showError() {
    this.container.innerHTML = `<div class="container py-5"><div class="alert alert-danger text-center">Грешка при зареждане.</div></div>`;
  }

  destroy() {
    if (this.container) this.container.innerHTML = '';
  }
}

export default AdminListings;
