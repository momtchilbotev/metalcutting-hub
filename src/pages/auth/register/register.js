import './register.css';
import { authService } from '../../../scripts/services/auth.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { validateRegistrationForm } from '../../../scripts/utils/validators.js';

export class RegisterPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
  }

  async render() {
    // Check if already logged in
    const session = await authService.getSession();
    if (session) {
      window.router.navigate('/');
      return;
    }

    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
  }

  getTemplate() {
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow">
              <div class="card-body p-4 p-md-5">
                <div class="text-center mb-4">
                  <i class="bi bi-person-plus display-1 text-primary"></i>
                  <h2 class="mt-3">Регистрация</h2>
                  <p class="text-muted">Създайте нов акаунт</p>
                </div>

                <form id="register-form">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="full_name" class="form-label">Име и фамилия *</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-person"></i></span>
                        <input type="text" class="form-control" id="full_name" name="full_name"
                          placeholder="Иван Иванов" required autocomplete="name">
                      </div>
                      <div class="invalid-feedback" id="full_name-error"></div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="phone" class="form-label">Телефон *</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                        <input type="tel" class="form-control" id="phone" name="phone"
                          placeholder="+359 888 123 456" required autocomplete="tel">
                      </div>
                      <div class="invalid-feedback" id="phone-error"></div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label">Имейл адрес *</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                      <input type="email" class="form-control" id="email" name="email"
                        placeholder="ivan@example.com" required autocomplete="email">
                    </div>
                    <div class="invalid-feedback" id="email-error"></div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="password" class="form-label">Парола *</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-lock"></i></span>
                        <input type="password" class="form-control" id="password" name="password"
                          placeholder="Минимум 6 символа" required autocomplete="new-password">
                      </div>
                      <div class="invalid-feedback" id="password-error"></div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="confirmPassword" class="form-label">Потвърди парола *</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                        <input type="password" class="form-control" id="confirmPassword" name="confirmPassword"
                          placeholder="Повторете паролата" required autocomplete="new-password">
                      </div>
                      <div class="invalid-feedback" id="confirmPassword-error"></div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" id="acceptTerms" name="acceptTerms" required>
                      <label class="form-check-label" for="acceptTerms">
                        Приемам <a href="/terms" target="_blank">общите условия</a> и
                        <a href="/privacy" target="_blank">политиката за поверителност</a>
                      </label>
                    </div>
                    <div class="invalid-feedback" id="acceptTerms-error"></div>
                  </div>

                  <button type="submit" class="btn btn-primary w-100 mb-3" id="register-btn">
                    <i class="bi bi-person-plus me-2"></i>Регистрация
                  </button>

                  <div class="divider text-center mb-3">
                    <span class="text-muted">или</span>
                  </div>

                  <button type="button" class="btn btn-outline-secondary w-100 mb-3" id="google-register-btn">
                    <i class="bi bi-google me-2"></i>Регистрация с Google
                  </button>

                  <div class="text-center mt-4">
                    <p class="mb-0">
                      Вече имате акаунт?
                      <a href="/login" class="text-decoration-none fw-bold">Вход</a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const form = document.getElementById('register-form');
    const googleBtn = document.getElementById('google-register-btn');

    // Form submission
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleRegister();
      });
    }

    // Google registration
    if (googleBtn) {
      googleBtn.addEventListener('click', async () => {
        await authService.loginWithGoogle();
      });
    }

    // Real-time password confirmation validation
    const confirmPassword = document.getElementById('confirmPassword');
    const password = document.getElementById('password');

    if (confirmPassword && password) {
      confirmPassword.addEventListener('input', () => {
        if (confirmPassword.value !== password.value) {
          confirmPassword.setCustomValidity('Паролите не съвпадат');
        } else {
          confirmPassword.setCustomValidity('');
        }
      });
    }
  }

  async handleRegister() {
    const form = document.getElementById('register-form');
    const submitBtn = document.getElementById('register-btn');

    // Get form data
    const formData = {
      full_name: document.getElementById('full_name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value,
      acceptTerms: document.getElementById('acceptTerms').checked
    };

    // Validate
    const validation = validateRegistrationForm(formData);
    if (!validation.isValid) {
      this.showErrors(validation.errors);
      return;
    }

    // Clear previous errors
    this.clearErrors();

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Регистриране...';

    try {
      await authService.register(formData.email, formData.password, formData.full_name);

      Toast.success('Регистрацията е успешна! Моля, проверете имейла си за потвърждение.');

      // Redirect to login
      window.router.navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      Toast.error(error.message || 'Грешка при регистрация. Моля, опитайте отново.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-person-plus me-2"></i>Регистрация';
    }
  }

  showErrors(errors) {
    this.clearErrors();

    for (const [field, message] of Object.entries(errors)) {
      const input = document.getElementById(field);
      const errorDiv = document.getElementById(`${field}-error`);

      if (input) {
        input.classList.add('is-invalid');
      }

      if (errorDiv) {
        errorDiv.textContent = message;
      }
    }
  }

  clearErrors() {
    const inputs = document.querySelectorAll('.is-invalid');
    inputs.forEach(input => input.classList.remove('is-invalid'));

    const errorDivs = document.querySelectorAll('.invalid-feedback');
    errorDivs.forEach(div => div.textContent = '');
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default RegisterPage;
