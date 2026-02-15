import { authService } from '../../services/auth.js';
import { validateEmail, validateRequired, validateLoginForm } from '../../utils/validators.js';
import { formatErrorMessage } from '../../utils/helpers.js';

export class LoginPage {
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

    // Focus on email input
    setTimeout(() => {
      const emailInput = document.getElementById('login-email');
      if (emailInput) emailInput.focus();
    }, 100);
  }

  getTemplate() {
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card shadow">
              <div class="card-body p-4">
                <div class="text-center mb-4">
                  <h1 class="h3 mb-3">
                    <i class="bi bi-gear-wide-connected text-primary"></i>
                    Metalcutting Hub
                  </h1>
                  <p class="text-muted">Влезте във вашия акаунт</p>
                </div>

                <form id="login-form" novalidate>
                  <!-- Email -->
                  <div class="mb-3">
                    <label for="login-email" class="form-label">Имейл</label>
                    <input type="email" class="form-control" id="login-email"
                      name="email" required autocomplete="email"
                      placeholder="vasil@example.com">
                    <div class="invalid-feedback" id="email-error"></div>
                  </div>

                  <!-- Password -->
                  <div class="mb-3">
                    <label for="login-password" class="form-label">Парола</label>
                    <div class="input-group">
                      <input type="password" class="form-control" id="login-password"
                        name="password" required autocomplete="current-password"
                        placeholder="Вашата парола">
                      <button class="btn btn-outline-secondary" type="button"
                        id="toggle-password" aria-label="Покажи парола">
                        <i class="bi bi-eye"></i>
                      </button>
                    </div>
                    <div class="invalid-feedback" id="password-error"></div>
                  </div>

                  <!-- Remember me -->
                  <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="login-remember">
                    <label class="form-check-label" for="login-remember">
                      Запомни ме
                    </label>
                  </div>

                  <!-- Submit button -->
                  <div class="d-grid mb-3">
                    <button type="submit" class="btn btn-primary btn-lg" id="login-submit">
                      <i class="bi bi-box-arrow-in-right me-2"></i>
                      Вход
                    </button>
                  </div>

                  <!-- Forgot password -->
                  <div class="text-center mb-4">
                    <a href="/forgot-password" class="text-decoration-none">
                      Забравена парола?
                    </a>
                  </div>

                  <!-- Divider -->
                  <div class="position-relative my-4">
                    <hr>
                    <div class="position-absolute top-50 start-50 translate-middle bg-white px-3">
                      или
                    </div>
                  </div>

                  <!-- Social login -->
                  <div class="d-grid gap-2">
                    <button type="button" class="btn btn-outline-danger" id="google-login">
                      <i class="bi bi-google me-2"></i>
                      Вход с Google
                    </button>
                  </div>
                </form>

                <!-- Register link -->
                <div class="text-center mt-4">
                  <p class="mb-0">Нямате акаунт?</p>
                  <a href="/register" class="btn btn-outline-primary mt-2">
                    <i class="bi bi-person-plus me-2"></i>
                    Регистрирайте се
                  </a>
                </div>
              </div>
            </div>

            <!-- Back to home -->
            <div class="text-center mt-4">
              <a href="/" class="text-decoration-none text-muted">
                <i class="bi bi-arrow-left me-2"></i>
                Назад към началната страница
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const googleLoginBtn = document.getElementById('google-login');
    const submitBtn = document.getElementById('login-submit');

    // Toggle password visibility
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePasswordBtn.innerHTML = type === 'password'
          ? '<i class="bi bi-eye"></i>'
          : '<i class="bi bi-eye-slash"></i>';
      });
    }

    // Real-time validation
    emailInput.addEventListener('blur', () => {
      this.validateField(emailInput, validateEmail);
    });

    passwordInput.addEventListener('blur', () => {
      this.validateField(passwordInput, (val) => validateRequired(val, 'Паролата'));
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous errors
      this.clearErrors();

      // Validate form
      const formData = {
        email: emailInput.value,
        password: passwordInput.value
      };

      const validation = validateLoginForm(formData);
      if (!validation.isValid) {
        this.showErrors(validation.errors);
        return;
      }

      // Submit
      this.setLoading(true);

      try {
        await authService.login(formData.email, formData.password);
        window.showToast('Успешен вход!', 'success');

        // Redirect to intended page or home
        const redirectTo = this.params.redirect || '/';
        setTimeout(() => {
          window.router.navigate(redirectTo);
        }, 500);
      } catch (error) {
        console.error('Login error:', error);
        window.showToast(formatErrorMessage(error), 'error');
        this.setLoading(false);
      }
    });

    // Google login
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', async () => {
        try {
          await authService.loginWithGoogle();
        } catch (error) {
          console.error('Google login error:', error);
          window.showToast('Грешка при влизане с Google.', 'error');
        }
      });
    }
  }

  validateField(input, validator) {
    const result = validator(input.value);
    const errorDiv = document.getElementById(`${input.id}-error`);

    input.classList.remove('is-valid', 'is-invalid');

    if (!result.isValid) {
      input.classList.add('is-invalid');
      if (errorDiv) {
        errorDiv.textContent = result.error;
      }
      return false;
    } else {
      input.classList.add('is-valid');
      return true;
    }
  }

  showErrors(errors) {
    for (const [field, message] of Object.entries(errors)) {
      const input = document.getElementById(`login-${field}`);
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
    const inputs = this.container.querySelectorAll('.is-invalid');
    inputs.forEach(input => input.classList.remove('is-invalid'));

    const errorDivs = this.container.querySelectorAll('.invalid-feedback');
    errorDivs.forEach(div => div.textContent = '');
  }

  setLoading(isLoading) {
    const submitBtn = document.getElementById('login-submit');
    const googleLoginBtn = document.getElementById('google-login');

    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Влизане...';
      googleLoginBtn.disabled = true;
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Вход';
      googleLoginBtn.disabled = false;
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default LoginPage;
