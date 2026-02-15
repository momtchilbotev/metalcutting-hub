import { adminService, hasRole } from '../../services/admin.js';
import { formatCount } from '../../utils/formatters.js';

export class AdminDashboard {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.stats = null;
  }

  async render() {
    // Check admin access
    const hasAccess = await hasRole('admin');
    if (!hasAccess) {
      this.showAccessDenied();
      return;
    }

    try {
      await this.loadStats();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
      this.loadRecentActions();
    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.showError();
    }
  }

  async loadStats() {
    this.stats = await adminService.getDashboardStats();
  }

  getTemplate() {
    return `
      <div class="container-fluid py-4">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="mb-0">
                <i class="bi bi-speedometer2 me-2"></i>Admin Dashboard
              </h1>
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                  <li class="breadcrumb-item active">Admin</li>
                </ol>
              </nav>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="row g-4 mb-4">
            <div class="col-md-3">
              <div class="card bg-primary text-white h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="card-title mb-1">Обяви</h6>
                      <h2 class="mb-0">${this.stats?.totalListings || 0}</h2>
                      <small class="text-white-50">
                        ${this.stats?.activeListings || 0} активни
                      </small>
                    </div>
                    <i class="bi bi-list-ul fs-1 opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="card bg-success text-white h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="card-title mb-1">Потребители</h6>
                      <h2 class="mb-0">${this.stats?.totalUsers || 0}</h2>
                    </div>
                    <i class="bi bi-people fs-1 opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="card bg-info text-white h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="card-title mb-1">Съобщения</h6>
                      <h2 class="mb-0">${this.stats?.totalMessages || 0}</h2>
                    </div>
                    <i class="bi bi-chat fs-1 opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="card bg-warning text-dark h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="card-title mb-1">Категории</h6>
                      <h2 class="mb-0">${this.stats?.totalCategories || 0}</h2>
                    </div>
                    <i class="bi bi-grid fs-1 opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Quick Actions -->
            <div class="col-md-6 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="mb-0">Бързи действия</h5>
                </div>
                <div class="card-body">
                  <div class="d-grid gap-2">
                    <a href="/admin/listings" class="btn btn-outline-primary text-start">
                      <i class="bi bi-list-check me-2"></i>Одобри обяви
                      <span class="badge bg-warning text-dark ms-auto">Предстои</span>
                    </a>
                    <a href="/admin/users" class="btn btn-outline-success text-start">
                      <i class="bi bi-person-gear me-2"></i>Управление потребители
                    </a>
                    <a href="/admin/categories" class="btn btn-outline-info text-start">
                      <i class="bi bi-tags me-2"></i>Редактирай категории
                    </a>
                    <a href="/admin/audit" class="btn btn-outline-secondary text-start">
                      <i class="bi bi-journal-text me-2"></i>Одитен лог
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Actions -->
            <div class="col-md-6 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="mb-0">Последни действия</h5>
                </div>
                <div class="card-body">
                  <div id="recent-actions">
                    <div class="text-center text-muted">
                      <div class="spinner-border spinner-border-sm" role="status"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- System Info -->
          <div class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Системна информация</h5>
                </div>
                <div class="card-body">
                  <dl class="row mb-0">
                    <dt class="col-sm-3">Версия на Supabase:</dt>
                    <dd class="col-sm-9">PostgreSQL 15.x</dd>

                    <dt class="col-sm-3">Часова зона:</dt>
                    <dd class="col-sm-9">Europe/Sofia (UTC+2)</dd>

                    <dt class="col-sm-3">Storage:</dt>
                    <dd class="col-sm-9">listing-images (публичен)</dd>

                    <dt class="col-sm-3">RLS:</dt>
                    <dd class="col-sm-9">Активиран за всички таблици</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async loadRecentActions() {
    try {
      const actions = await adminService.getAuditLog(10);
      const container = document.getElementById('recent-actions');

      if (!actions || actions.length === 0) {
        container.innerHTML = '<p class="text-muted mb-0">Няма скорошни действия.</p>';
        return;
      }

      container.innerHTML = `
        <div class="list-group list-group-flush">
          ${actions.map(action => `
            <div class="list-group-item">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <strong>${this.formatAction(action.action)}</strong>
                  <br>
                  <small class="text-muted">
                    от ${action.admin?.full_name || 'Admin'}
                    ${action.target_type ? `• ${this.formatTargetType(action.target_type)}` : ''}
                  </small>
                </div>
                <small class="text-muted">
                  ${new Date(action.created_at).toLocaleString('bg-BG')}
                </small>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      console.error('Error loading actions:', error);
      const container = document.getElementById('recent-actions');
      if (container) {
        container.innerHTML = '<p class="text-danger mb-0">Грешка при зареждане.</p>';
      }
    }
  }

  attachEventListeners() {
    // No additional listeners needed for this page
  }

  formatAction(action) {
    const actions = {
      'approve_listing': 'Одобри обява',
      'reject_listing': 'Отхвърли обява',
      'toggle_featured': 'Промени препоръчана обява',
      'update_role': 'Промени роля',
      'toggle_verification': 'Промени верификация',
      'create_category': 'Създай категория',
      'update_category': 'Редактирай категория',
      'delete_category': 'Изтрий категория'
    };
    return actions[action] || action;
  }

  formatTargetType(type) {
    const types = {
      'listing': 'обява',
      'user': 'потребител',
      'category': 'категория'
    };
    return types[type] || type;
  }

  showAccessDenied() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-shield-x me-2"></i>
          Нямате достъп до административния панел.
        </div>
      </div>
    `;
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Възникна грешка при зареждане на таблото.
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

export default AdminDashboard;
