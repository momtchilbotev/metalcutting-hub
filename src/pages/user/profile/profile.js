import './profile.css';
import { authService } from '../../../scripts/services/auth.js';
import { storageService } from '../../../scripts/services/storage.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { formatDate, formatPhone } from '../../../scripts/utils/formatters.js';
import { validateEmail, validateLength, validatePhone } from '../../../scripts/utils/validators.js';

export class ProfilePage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.user = null;
    this.profile = null;
    this.isEditing = false;
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

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
    this.user = await authService.getUser();

    if (!this.user) {
      window.router.navigate('/login');
      return;
    }

    this.profile = await authService.getProfile();
  }

  getLoadingTemplate() {
    return `
      <div class="container py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на профила...</p>
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
                <img src="${this.profile?.avatar_url || '/images/default-avatar.png'}"
                  class="rounded-circle mb-3"
                  style="width: 120px; height: 120px; object-fit: cover;"
                  alt="Profile"
                  id="sidebar-avatar">
                <h5 class="card-title">${this.escapeHtml(this.profile?.full_name || 'Потребител')}</h5>
                <p class="text-muted">${this.escapeHtml(this.user?.email || '')}</p>
                <span class="badge bg-${this.getRoleBadgeClass()}">${this.getRoleText()}</span>
              </div>
              <div class="list-group list-group-flush">
                <a href="/profile" class="list-group-item list-group-item-action active">
                  <i class="bi bi-person me-2"></i>Профил
                </a>
                <a href="/my-listings" class="list-group-item list-group-item-action">
                  <i class="bi bi-list-ul me-2"></i>Моите обяви
                </a>
                <a href="/watchlist" class="list-group-item list-group-item-action">
                  <i class="bi bi-heart me-2"></i>Наблюдавани
                </a>
                <a href="/messages" class="list-group-item list-group-item-action">
                  <i class="bi bi-chat me-2"></i>Съобщения
                </a>
                <button class="list-group-item list-group-item-action text-danger" id="logout-btn">
                  <i class="bi bi-box-arrow-right me-2"></i>Изход
                </button>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="col-lg-9">
            <div class="card shadow-sm">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h4 class="mb-0">
                  <i class="bi bi-person-circle me-2"></i>Моят профил
                </h4>
                <button class="btn btn-outline-primary btn-sm" id="edit-btn">
                  <i class="bi bi-pencil me-1"></i>Редактирай
                </button>
              </div>
              <div class="card-body">
                <form id="profile-form">
                  <!-- Avatar Upload -->
                  <div class="mb-4 text-center">
                    <div class="position-relative d-inline-block">
                      <img src="${this.profile?.avatar_url || '/images/default-avatar.png'}"
                        class="rounded-circle"
                        style="width: 100px; height: 100px; object-fit: cover;"
                        alt="Profile"
                        id="avatar-preview">
                      <label for="avatar-input" class="btn btn-sm btn-light position-absolute bottom-0 end-0 rounded-circle"
                        style="cursor: pointer;" title="Промени снимка">
                        <i class="bi bi-camera"></i>
                      </label>
                      <input type="file" class="d-none" id="avatar-input" accept="image/*">
                    </div>
                  </div>

                  <div class="row">
                    <!-- Full Name -->
                    <div class="col-md-6 mb-3">
                      <label for="full_name" class="form-label">Име и фамилия</label>
                      <input type="text" class="form-control" id="full_name" name="full_name"
                        value="${this.escapeHtml(this.profile?.full_name || '')}"
                        ${!this.isEditing ? 'disabled' : ''}>
                      <div class="invalid-feedback" id="full_name-error"></div>
                    </div>

                    <!-- Email -->
                    <div class="col-md-6 mb-3">
                      <label for="email" class="form-label">Имейл</label>
                      <input type="email" class="form-control" id="email" name="email"
                        value="${this.escapeHtml(this.user?.email || '')}" disabled>
                      <div class="form-text">Имейлът не може да се променя</div>
                    </div>
                  </div>

                  <div class="row">
                    <!-- Phone -->
                    <div class="col-md-6 mb-3">
                      <label for="phone" class="form-label">Телефон</label>
                      <input type="tel" class="form-control" id="phone" name="phone"
                        value="${this.escapeHtml(this.profile?.phone || '')}"
                        placeholder="+359 888 123 456"
                        ${!this.isEditing ? 'disabled' : ''}>
                      <div class="invalid-feedback" id="phone-error"></div>
                    </div>
                  </div>

                  <!-- Action Buttons (only visible when editing) -->
                  <div class="d-flex gap-2 ${!this.isEditing ? 'd-none' : ''}" id="edit-actions">
                    <button type="submit" class="btn btn-primary" id="save-btn">
                      <i class="bi bi-check me-1"></i>Запази
                    </button>
                    <button type="button" class="btn btn-outline-secondary" id="cancel-btn">
                      <i class="bi bi-x me-1"></i>Отказ
                    </button>
                  </div>
                </form>

                <!-- Account Info -->
                <hr class="my-4">
                <h5 class="mb-3">Информация за акаунта</h5>
                <dl class="row">
                  <dt class="col-sm-4">Роля</dt>
                  <dd class="col-sm-8">${this.getRoleText()}</dd>

                  <dt class="col-sm-4">Регистриран на</dt>
                  <dd class="col-sm-8">${formatDate(this.profile?.created_at || this.user?.created_at)}</dd>

                  <dt class="col-sm-4">Последна актуализация</dt>
                  <dd class="col-sm-8">${formatDate(this.profile?.updated_at || this.user?.updated_at)}</dd>

                  ${this.profile?.is_verified ? `
                    <dt class="col-sm-4">Статус</dt>
                    <dd class="col-sm-8">
                      <span class="badge bg-success">
                        <i class="bi bi-check-circle me-1"></i>Потвърден
                      </span>
                    </dd>
                  ` : ''}
                </dl>
              </div>
            </div>

            <!-- Password Change -->
            <div class="card shadow-sm mt-4">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="bi bi-lock me-2"></i>Смяна на парола
                </h5>
              </div>
              <div class="card-body">
                <form id="password-form">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="new_password" class="form-label">Нова парола</label>
                      <input type="password" class="form-control" id="new_password" name="new_password"
                        placeholder="Минимум 6 символа">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="confirm_password" class="form-label">Потвърди парола</label>
                      <input type="password" class="form-control" id="confirm_password" name="confirm_password"
                        placeholder="Повторете паролата">
                    </div>
                  </div>
                  <button type="submit" class="btn btn-outline-primary">
                    <i class="bi bi-key me-1"></i>Промени парола
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getRoleBadgeClass() {
    const role = this.profile?.role || 'user';
    const classes = {
      user: 'primary',
      moderator: 'warning',
      admin: 'danger'
    };
    return classes[role] || 'primary';
  }

  getRoleText() {
    const role = this.profile?.role || 'user';
    const texts = {
      user: 'Потребител',
      moderator: 'Модератор',
      admin: 'Администратор'
    };
    return texts[role] || 'Потребител';
  }

  attachEventListeners() {
    const editBtn = document.getElementById('edit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const logoutBtn = document.getElementById('logout-btn');
    const avatarInput = document.getElementById('avatar-input');

    // Edit button
    if (editBtn) {
      editBtn.addEventListener('click', () => this.toggleEdit(true));
    }

    // Cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.toggleEdit(false));
    }

    // Profile form
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }

    // Password form
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.changePassword();
      });
    }

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await authService.logout();
      });
    }

    // Avatar upload
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
    }
  }

  toggleEdit(editing) {
    this.isEditing = editing;

    // Only toggle text inputs and textareas, not file inputs or email
    const inputs = document.querySelectorAll('#profile-form input[type="text"], #profile-form input[type="tel"], #profile-form textarea');
    inputs.forEach(input => {
      input.disabled = !editing;
    });

    const editActions = document.getElementById('edit-actions');
    if (editActions) {
      editActions.classList.toggle('d-none', !editing);
    }

    const editBtn = document.getElementById('edit-btn');
    if (editBtn) {
      editBtn.classList.toggle('d-none', editing);
    }
  }

  async saveProfile() {
    const formData = {
      full_name: document.getElementById('full_name').value.trim(),
      phone: document.getElementById('phone').value.trim()
    };

    // Validate
    const nameResult = validateLength(formData.full_name, 2, 100, 'Името');
    if (!nameResult.isValid) {
      Toast.error(nameResult.error);
      return;
    }

    if (formData.phone) {
      const phoneResult = validatePhone(formData.phone);
      if (!phoneResult.isValid) {
        Toast.error(phoneResult.error);
        return;
      }
    }

    try {
      await authService.updateProfile(formData);
      Toast.success('Профилът е обновен!');
      this.profile = { ...this.profile, ...formData };
      this.toggleEdit(false);
    } catch (error) {
      console.error('Update profile error:', error);
      Toast.error('Грешка при обновяване на профила.');
    }
  }

  async changePassword() {
    const newPassword = document.getElementById('new_password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    if (!newPassword || newPassword.length < 6) {
      Toast.error('Паролата трябва да е поне 6 символа.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.error('Паролите не съвпадат.');
      return;
    }

    try {
      await authService.updatePassword(newPassword);
      Toast.success('Паролата е променена успешно!');
      document.getElementById('new_password').value = '';
      document.getElementById('confirm_password').value = '';
    } catch (error) {
      console.error('Change password error:', error);
      Toast.error('Грешка при промяна на паролата.');
    }
  }

  async handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      Toast.error('Моля, изберете изображение.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Toast.error('Размерът на файла не трябва да надвишава 2MB.');
      return;
    }

    // Get both avatar elements
    const preview = document.getElementById('avatar-preview');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const originalSrc = preview?.src;

    try {
      // Upload to storage
      const avatarUrl = await storageService.uploadAvatar(file, this.user.id);

      // Update profile with new avatar URL
      await authService.updateProfile({ avatar_url: avatarUrl });

      // Update both avatar images
      if (preview) {
        preview.src = avatarUrl;
      }
      if (sidebarAvatar) {
        sidebarAvatar.src = avatarUrl;
      }

      // Update profile data
      this.profile = { ...this.profile, avatar_url: avatarUrl };

      Toast.success('Аватарът е обновен успешно!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      // Revert preview on error
      if (preview && originalSrc) {
        preview.src = originalSrc;
      }
      Toast.error(error.message || 'Грешка при качване на аватара.');
    }

    // Reset file input
    event.target.value = '';
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на профила.
        </div>
        <div class="text-center">
          <a href="/" class="btn btn-primary">Към началната страница</a>
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

export default ProfilePage;
