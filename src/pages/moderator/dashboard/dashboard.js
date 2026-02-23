import './dashboard.css';
import { adminService } from '../../../scripts/services/admin.js';
import { formatNumber, formatDate } from '../../../scripts/utils/formatters.js';

export class ModeratorDashboardPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.stats = null;
    this.pendingReports = 0;
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      [this.stats, this.pendingReports] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getPendingReportsCount()
      ]);
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading moderator dashboard:', error);
      this.showError();
    }
  }

  getLoadingTemplate() {
    return `
      <div class="container py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на модератор панела...</p>
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
              <i class="bi bi-shield-check text-primary me-2"></i>Moderator Dashboard
            </h2>
            <p class="text-muted">Управление на Metalcutting Hub</p>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="row g-4 mb-4">
          <div class="col-md-6 col-lg-3">
            <div class="card shadow-sm moderator-stat-card">
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
            <div class="card shadow-sm moderator-stat-card">
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
            <div class="card shadow-sm moderator-stat-card">
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

          <div class="col-md-6 col-lg-3">
            <a href="/moderator/reports" class="text-decoration-none">
              <div class="card shadow-sm moderator-stat-card ${this.pendingReports > 0 ? 'border-danger' : ''}">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="text-muted mb-1">Доклади</h6>
                      <h3 class="mb-0 ${this.pendingReports > 0 ? 'text-danger' : ''}">${formatNumber(this.pendingReports)}</h3>
                    </div>
                    <div class="${this.pendingReports > 0 ? 'bg-danger' : 'bg-secondary'} bg-opacity-10 p-3 rounded">
                      <i class="bi bi-flag ${this.pendingReports > 0 ? 'text-danger' : 'text-secondary'} fs-4"></i>
                    </div>
                  </div>
                  ${this.pendingReports > 0 ? '<small class="text-danger">Нови доклади!</small>' : ''}
                </div>
              </div>
            </a>
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
                  <a href="/moderator/listings" class="btn btn-outline-primary">
                    <i class="bi bi-list-ul me-2"></i>Управление на обяви
                  </a>
                  <a href="/moderator/categories" class="btn btn-outline-primary">
                    <i class="bi bi-tags me-2"></i>Управление на категории
                  </a>
                  <a href="/moderator/reports" class="btn ${this.pendingReports > 0 ? 'btn-outline-danger' : 'btn-outline-primary'}">
                    <i class="bi bi-flag me-2"></i>Доклади ${this.pendingReports > 0 ? `<span class="badge bg-danger ms-1">${this.pendingReports}</span>` : ''}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="bi bi-info-circle me-2"></i>Информация
                </h5>
              </div>
              <div class="card-body">
                <p class="text-muted mb-3">
                  Като модератор имате достъп до управление на обяви, категории и доклади за нередности.
                </p>
                <dl class="row mb-0">
                  <dt class="col-sm-6">Версия на приложението</dt>
                  <dd class="col-sm-6">1.0.0</dd>

                  <dt class="col-sm-6">Последна актуализация</dt>
                  <dd class="col-sm-6">${formatDate(new Date(), false)}</dd>

                  <dt class="col-sm-6">Статус на системата</dt>
                  <dd class="col-sm-6">
                    <span class="badge bg-success">Онлайн</span>
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
          Грешка при зареждане на модератор панела.
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

export default ModeratorDashboardPage;
