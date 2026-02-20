import './login.css';
import { authService } from '../../../scripts/services/auth.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { validateLoginForm } from '../../../scripts/utils/validators.js';

export class LoginPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.redirect = params.redirect || '/';
  }

  async render() {
    // Check if already logged in
    const session = await authService.getSession();
    if (session) {
      window.router.navigate(this.redirect);
      return;
    }

    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
  }

  getTemplate() {
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card shadow">
              <div class="card-body p-4 p-md-5">
                <div class="text-center mb-4">
                  <i class="bi bi-person-circle display-1 text-primary"></i>
                  <h2 class="mt-3">Вход</h2>
                  <p class="text-muted">Влезте в своя акаунт</p>
                </div>

                <form id="login-form">
                  <div class="mb-3">
                    <label for="email" class="form-label">Имейл адрес</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                      <input type="email" class="form-control" id="email" name="email"
                        placeholder="ivan@example.com" required autocomplete="email">
                    </div>
                    <div class="invalid-feedback" id="email-error"></div>
                  </div>

                  <div class="mb-3">
                    <label for="password" class="form-label">Парола</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-lock"></i></span>
                      <input type="password" class="form-control" id="password" name="password"
                        placeholder="Въведете парола" required autocomplete="current-password">
                      <button class="btn btn-outline-secondary" type="button" id="toggle-password">
                        <i class="bi bi-eye"></i>
                      </button>
                    </div>
                    <div class="invalid-feedback" id="password-error"></div>
                  </div>

                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" id="remember-me" name="rememberMe">
                      <label class="form-check-label" for="remember-me">Запомни ме</label>
                    </div>
                    <a href="/forgot-password" class="text-decoration-none">Забравена парола?</a>
                  </div>

                  <button type="submit" class="btn btn-primary w-100 mb-3" id="login-btn">
                    <i class="bi bi-box-arrow-in-right me-2"></i>Вход
                  </button>

                  <div class="divider text-center mb-3">
                    <span class="text-muted">или</span>
                  </div>

                  <button type="button" class="btn btn-outline-secondary w-100 mb-3" id="google-login-btn">
                    <i class="bi bi-google me-2"></i>Вход с Google
                  </button>

                  <div class="text-center mt-4">
                    <p class="mb-0">
                      Нямате акаунт?
                      <a href="/register" class="text-decoration-none fw-bold">Регистрация</a>
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
    const form = document.getElementById('login-form');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const googleLoginBtn = document.getElementById('google-login-btn');

    // Toggle password visibility
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        const icon = togglePasswordBtn.querySelector('i');

        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          icon.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
          passwordInput.type = 'password';
          icon.classList.replace('bi-eye-slash', 'bi-eye');
        }
      });
    }

    // Form submission
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }

    // Google login
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', async () => {
        await this.handleGoogleLogin();
      });
    }
  }

  async handleLogin() {
    const form = document.getElementById('login-form');
    const submitBtn = document.getElementById('login-btn');

    // Get form data
    const formData = {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
    };

    // Validate
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      this.showErrors(validation.errors);
      return;
    }

    // Clear previous errors
    this.clearErrors();

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Влизане...';

    try {
      await authService.login(formData.email, formData.password);

      Toast.success('Успешен вход!');

      // Refresh navbar
      if (window.navbar) {
        await window.navbar.refresh();
      }

      // Redirect
      window.router.navigate(this.redirect);
    } catch (error) {
      console.error('Login error:', error);
      Toast.error(error.message || 'Грешка при вход. Моля, опитайте отново.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Вход';
    }
  }

  async handleGoogleLogin() {
    const googleBtn = document.getElementById('google-login-btn');

    try {
      googleBtn.disabled = true;
      googleBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Свързване...';

      await authService.loginWithGoogle();
      // The page will redirect to Google, so no need to reset button
    } catch (error) {
      console.error('Google login error:', error);
      Toast.error('Грешка при влизане с Google.');
      googleBtn.disabled = false;
      googleBtn.innerHTML = '<i class="bi bi-google me-2"></i>Вход с Google';
    }
  }

  showErrors(errors) {
    // Clear previous errors
    this.clearErrors();

    // Show new errors
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

export default LoginPage;
