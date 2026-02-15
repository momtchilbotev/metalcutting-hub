import { authService } from '../../services/auth.js';
import { listingService } from '../../services/listings.js';
import { validateEmail, validatePhone, validateLength } from '../../utils/validators.js';
import { formatErrorMessage } from '../../utils/helpers.js';

export class ProfilePage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.profile = null;
    this.locations = [];
  }

  async render() {
    // Check auth
    const session = await authService.getSession();
    if (!session) {
      window.router.navigate('/login');
      return;
    }

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading profile:', error);
      this.showError();
    }
  }

  async loadData() {
    const [profile, locations] = await Promise.all([
      authService.getProfile(),
      listingService.getLocations('city')
    ]);

    this.profile = profile;
    this.locations = locations;
  }

  getTemplate() {
    const profile = this.profile;

    return `
      <div class="container py-4">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <h1 class="mb-4">
              <i class="bi bi-person-circle me-2"></i>Моят профил
            </h1>

            <!-- Profile Form -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">Лична информация</h5>
              </div>
              <div class="card-body">
                <form id="profile-form" novalidate>
                  <!-- Email (read-only) -->
                  <div class="mb-3">
                    <label for="profile-email" class="form-label">Имейл</label>
                    <input type="email" class="form-control" id="profile-email"
                      value="${this.escapeHtml(profile?.email || '')}" disabled>
                    <div class="form-text">Имейлът не може да се променя.</div>
                  </div>

                  <!-- Full Name -->
                  <div class="mb-3">
                    <label for="profile-name" class="form-label">Име и фамилия</label>
                    <input type="text" class="form-control" id="profile-name"
                      name="full_name" value="${this.escapeHtml(profile?.full_name || '')}"
                      minlength="2" maxlength="100">
                    <div class="invalid-feedback" id="full_name-error"></div>
                  </div>

                  <!-- Phone -->
                  <div class="mb-3">
                    <label for="profile-phone" class="form-label">Телефон</label>
                    <input type="tel" class="form-control" id="profile-phone"
                      name="phone" value="${this.escapeHtml(profile?.phone || '')}"
                      placeholder="+359 888 123 456">
                    <div class="invalid-feedback" id="phone-error"></div>
                  </div>

                  <!-- Location -->
                  <div class="mb-3">
                    <label for="profile-location" class="form-label">Град</label>
                    <select class="form-select" id="profile-location" name="location_id">
                      <option value="">Не е избран</option>
                      ${this.locations.map(loc => `
                        <option value="${loc.id}" ${profile?.location_id === loc.id ? 'selected' : ''}>
                          ${this.escapeHtml(loc.name_bg)}
                        </option>
                      `).join('')}
                    </select>
                  </div>

                  <!-- Save Button -->
                  <button type="submit" class="btn btn-primary" id="save-profile-btn">
                    <i class="bi bi-check-lg me-2"></i>Запази промените
                  </button>
                </form>
              </div>
            </div>

            <!-- Change Password -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">Смяна на парола</h5>
              </div>
              <div class="card-body">
                <form id="password-form" novalidate>
                  <div class="mb-3">
                    <label for="current-password" class="form-label">Текуща парола</label>
                    <input type="password" class="form-control" id="current-password"
                      name="currentPassword">
                  </div>
                  <div class="mb-3">
                    <label for="new-password" class="form-label">Нова парола</label>
                    <input type="password" class="form-control" id="new-password"
                      name="newPassword" minlength="6">
                    <div class="form-text">Поне 6 символа.</div>
                  </div>
                  <div class="mb-3">
                    <label for="confirm-password" class="form-label">Потвърди нова парола</label>
                    <input type="password" class="form-control" id="confirm-password"
                      name="confirmPassword">
                  </div>
                  <button type="submit" class="btn btn-primary" id="change-password-btn">
                    <i class="bi bi-key me-2"></i>Промени парола
                  </button>
                </form>
              </div>
            </div>

            <!-- Account Info -->
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Информация за акаунта</h5>
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  <dt class="col-sm-4">Роля:</dt>
                  <dd class="col-sm-8">${this.getRoleLabel(profile?.role)}</dd>

                  <dt class="col-sm-4">Верифициран:</dt>
                  <dd class="col-sm-8">
                    ${profile?.is_verified
                      ? '<i class="bi bi-check-circle-fill text-primary"></i> Да'
                      : '<i class="bi bi-x-circle text-muted"></i> Не'}
                  </dd>

                  <dt class="col-sm-4">Премиум:</dt>
                  <dd class="col-sm-8">
                    ${profile?.is_premium
                      ? '<i class="bi bi-star-fill text-warning"></i> Да'
                      : 'Не'}
                  </dd>

                  <dt class="col-sm-4">Член от:</dt>
                  <dd class="col-sm-8">${this.formatDate(profile?.created_at)}</dd>
                </dl>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="row mt-4">
              <div class="col-md-4 mb-3">
                <a href="/my-listings" class="card text-decoration-none h-100">
                  <div class="card-body text-center">
                    <i class="bi bi-list-ul display-6 text-primary"></i>
                    <h6 class="mt-2 mb-0 text-dark">Моите обяви</h6>
                  </div>
                </a>
              </div>
              <div class="col-md-4 mb-3">
                <a href="/watchlist" class="card text-decoration-none h-100">
                  <div class="card-body text-center">
                    <i class="bi bi-heart display-6 text-danger"></i>
                    <h6 class="mt-2 mb-0 text-dark">Наблюдавани</h6>
                  </div>
                </a>
              </div>
              <div class="col-md-4 mb-3">
                <a href="/messages" class="card text-decoration-none h-100">
                  <div class="card-body text-center">
                    <i class="bi bi-chat display-6 text-info"></i>
                    <h6 class="mt-2 mb-0 text-dark">Съобщения</h6>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveProfile();
      });
    }

    // Password form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.changePassword();
      });
    }
  }

  async saveProfile() {
    this.clearErrors();

    const formData = {
      full_name: document.getElementById('profile-name').value,
      phone: document.getElementById('profile-phone').value,
      location_id: document.getElementById('profile-location').value || null
    };

    // Validate
    const errors = {};

    if (formData.full_name) {
      const nameResult = validateLength(formData.full_name, 2, 100, 'Името');
      if (!nameResult.isValid) errors.full_name = nameResult.error;
    }

    if (formData.phone) {
      const phoneResult = validatePhone(formData.phone);
      if (!phoneResult.isValid) errors.phone = phoneResult.error;
    }

    if (Object.keys(errors).length > 0) {
      this.showErrors(errors);
      return;
    }

    // Save
    this.setProfileLoading(true);

    try {
      await authService.updateProfile(formData);
      window.showToast('Профилът е обновен!', 'success');
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Save profile error:', error);
      window.showToast(formatErrorMessage(error), 'error');
    } finally {
      this.setProfileLoading(false);
    }
  }

  async changePassword() {
    const current = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;

    if (!current) {
      window.showToast('Моля, въведете текущата парола.', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      window.showToast('Новата парола трябва да е поне 6 символа.', 'warning');
      return;
    }

    if (newPassword !== confirm) {
      window.showToast 'Паролите не съвпадат.', 'warning');
      return;
    }

    this.setPasswordLoading(true);

    try {
      await authService.updatePassword(newPassword);
      window.showToast('Паролата е променена успешно!', 'success');
      document.getElementById('password-form').reset();
    } catch (error) {
      console.error('Change password error:', error);
      window.showToast('Грешка при промяна на паролата. Проверете текущата парола.', 'error');
    } finally {
      this.setPasswordLoading(false);
    }
  }

  showErrors(errors) {
    for (const [field, message] of Object.entries(errors)) {
      const input = document.getElementById(`profile-${field}`);
      const errorDiv = document.getElementById(`${field}-error`);
      if (input) input.classList.add('is-invalid');
      if (errorDiv) errorDiv.textContent = message;
    }
  }

  clearErrors() {
    const inputs = this.container.querySelectorAll('.is-invalid');
    inputs.forEach(input => input.classList.remove('is-invalid'));
    const errorDivs = this.container.querySelectorAll('.invalid-feedback');
    errorDivs.forEach(div => div.textContent = '');
  }

  setProfileLoading(isLoading) {
    const btn = document.getElementById('save-profile-btn');
    if (isLoading) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Запазване...';
    } else {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check-lg me-2"></i>Запази промените';
    }
  }

  setPasswordLoading(isLoading) {
    const btn = document.getElementById('change-password-btn');
    if (isLoading) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Промяна...';
    } else {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-key me-2"></i>Промени парола';
    }
  }

  getRoleLabel(role) {
    const roles = {
      'user': 'Потребител',
      'moderator': 'Модератор',
      'admin': 'Администратор'
    };
    return roles[role] || 'Потребител';
  }

  formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('bg-BG');
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
          Възникна грешка при зареждане на профила.
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

export default ProfilePage;
