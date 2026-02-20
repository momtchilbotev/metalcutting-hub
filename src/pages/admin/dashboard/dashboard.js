import './dashboard.css';
import { adminService } from '../../../scripts/services/admin.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { formatNumber, formatDate } from '../../../scripts/utils/formatters.js';

export class AdminDashboardPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.stats = null;
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      this.stats = await adminService.getDashboardStats();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      this.showError();
    }
  }

  getLoadingTemplate() {
    return `
      <div class="container py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на админ панела...</p>
        </div>
      </div>
    `;
  }

  getTemplate() {
    return `
      <div class="container-fluid py-4">
        <div class="row mb-4">
          <div class="col">
            <h2 class="h3 mb-0">
              <i class="bi bi-speedometer2 text-primary me-2"></i>Admin Dashboard
            </h2>
            <p class="text-muted">Управление на Metalcutting Hub</p>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="row g-4 mb-4">
          <div class="col-md-6 col-lg-3">
            <div class="card shadow-sm admin-stat-card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-1">Активни обяви</h6>
                    <h3 class="mb-0 text-primary">${formatNumber(this.stats?.activeListings || 0)}</h3>
                  </div>
                  <div class="bg-primary bg-opacity-10 p-3 rounded">
                    <i class="bi bi-list-ul text-primary fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="card shadow-sm admin-stat-card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-1">Продадени</h6>
                    <h3 class="mb-0 text-success">${formatNumber(this.stats?.soldListings || 0)}</h3>
                  </div>
                  <div class="bg-success bg-opacity-10 p-3 rounded">
                    <i class="bi bi-check-circle text-success fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="card shadow-sm admin-stat-card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-1">Потребители</h6>
                    <h3 class="mb-0 text-info">${formatNumber(this.stats?.totalUsers || 0)}</h3>
                  </div>
                  <div class="bg-info bg-opacity-10 p-3 rounded">
                    <i class="bi bi-people text-info fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="card shadow-sm admin-stat-card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-1">Категории</h6>
                    <h3 class="mb-0 text-warning">${formatNumber(this.stats?.totalCategories || 0)}</h3>
                  </div>
                  <div class="bg-warning bg-opacity-10 p-3 rounded">
                    <i class="bi bi-tags text-warning fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row g-4 mb-4">
          <div class="col-lg-6">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="bi bi-lightning me-2"></i>Бързи действия
                </h5>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <a href="/admin/listings" class="btn btn-outline-primary">
                    <i class="bi bi-list-ul me-2"></i>Управление на обяви
                  </a>
                  <a href="/admin/users" class="btn btn-outline-primary">
                    <i class="bi bi-people me-2"></i>Управление на потребители
                  </a>
                  <a href="/admin/categories" class="btn btn-outline-primary">
                    <i class="bi bi-tags me-2"></i>Управление на категории
                  </a>
                  <a href="/admin/audit" class="btn btn-outline-secondary">
                    <i class="bi bi-clipboard-check me-2"></i>Audit Log
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="bi bi-info-circle me-2"></i>Системна информация
                </h5>
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  <dt class="col-sm-6">Версия на приложението</dt>
                  <dd class="col-sm-6">1.0.0</dd>

                  <dt class="col-sm-6">Последна актуализация</dt>
                  <dd class="col-sm-6">${formatDate(new Date(), false)}</dd>

                  <dt class="col-sm-6">Статус на системата</dt>
                  <dd class="col-sm-6">
                    <span class="badge bg-success">Онлайн</span>
                  </dd>

                  <dt class="col-sm-6">База данни</dt>
                  <dd class="col-sm-6">
                    <span class="badge bg-primary">Supabase</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity Placeholder -->
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">
              <i class="bi bi-clock-history me-2"></i>Скорошна активност
            </h5>
          </div>
          <div class="card-body">
            <p class="text-muted text-center py-4">
              <i class="bi bi-inbox display-4 d-block mb-2"></i>
              Скорошната активност ще се показва тук
            </p>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Add any necessary event listeners
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на админ панела.
        </div>
        <div class="text-center">
          <button class="btn btn-primary" onclick="window.location.reload()">Опитайте отново</button>
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

export default AdminDashboardPage;
