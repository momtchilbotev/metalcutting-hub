import { authService } from '../../services/auth.js';
import { validateEmail, validatePassword, validatePhone, validateRequired, validateLength, validateRegistrationForm } from '../../utils/validators.js';
import { formatErrorMessage } from '../../utils/helpers.js';

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

    // Focus on email input
    setTimeout(() => {
      const emailInput = document.getElementById('register-email');
      if (emailInput) emailInput.focus();
    }, 100);
  }

  getTemplate() {
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow">
              <div class="card-body p-4">
                <div class="text-center mb-4">
                  <h1 class="h3 mb-3">
                    <i class="bi bi-gear-wide-connected text-primary"></i>
                    Metalcutting Hub
                  </h1>
                  <p class="text-muted">Създайте нов акаунт</p>
                </div>

                <form id="register-form" novalidate>
                  <!-- Email -->
                  <div class="mb-3">
                    <label for="register-email" class="form-label">Имейл адрес *</label>
                    <input type="email" class="form-control" id="register-email"
                      name="email" required autocomplete="email"
                      placeholder="vasil@example.com">
                    <div class="invalid-feedback" id="email-error"></div>
                  </div>

                  <!-- Password -->
                  <div class="mb-3">
                    <label for="register-password" class="form-label">Парола *</label>
                    <div class="input-group">
                      <input type="password" class="form-control" id="register-password"
                        name="password" required autocomplete="new-password"
                        placeholder="Поне 6 символа" minlength="6">
                      <button class="btn btn-outline-secondary" type="button"
                        id="toggle-password" aria-label="Покажи парола">
                        <i class="bi bi-eye"></i>
                      </button>
                    </div>
                    <div class="form-text">Паролата трябва да е поне 6 символа.</div>
                    <div class="invalid-feedback" id="password-error"></div>
                  </div>

                  <!-- Confirm Password -->
                  <div class="mb-3">
                    <label for="register-confirm-password" class="form-label">Потвърди парола *</label>
                    <input type="password" class="form-control" id="register-confirm-password"
                      name="confirmPassword" required autocomplete="new-password"
                      placeholder="Въведете паролата отново">
                    <div class="invalid-feedback" id="confirmPassword-error"></div>
                  </div>

                  <!-- Full Name -->
                  <div class="mb-3">
                    <label for="register-name" class="form-label">Име и фамилия *</label>
                    <input type="text" class="form-control" id="register-name"
                      name="full_name" required autocomplete="name"
                      placeholder="Васил Петров">
                    <div class="invalid-feedback" id="full_name-error"></div>
                  </div>

                  <!-- Phone -->
                  <div class="mb-3">
                    <label for="register-phone" class="form-label">Телефон *</label>
                    <input type="tel" class="form-control" id="register-phone"
                      name="phone" required autocomplete="tel"
                      placeholder="+359 888 123 456 или 0888 123 456">
                    <div class="invalid-feedback" id="phone-error"></div>
                  </div>

                  <!-- Location (Optional) -->
                  <div class="mb-3">
                    <label for="register-location" class="form-label">Град</label>
                    <select class="form-select" id="register-location" name="location_id">
                      <option value="">Изберете град (по желание)</option>
                      <option value="1">София</option>
                      <option value="2">Пловдив</option>
                      <option value="3">Варна</option>
                      <option value="4">Бургас</option>
                      <option value="5">Русе</option>
                      <option value="6">Стара Загора</option>
                      <option value="7">Плевен</option>
                      <option value="8">Добрич</option>
                    </select>
                  </div>

                  <!-- Terms -->
                  <div class="mb-4 form-check">
                    <input type="checkbox" class="form-check-input" id="register-terms"
                      name="acceptTerms" required>
                    <label class="form-check-label" for="register-terms">
                      Прочетох и приемам <a href="/terms" target="_blank">общите условия</a> и
                      <a href="/privacy" target="_blank">политиката за поверителност</a> *
                    </label>
                    <div class="invalid-feedback" id="acceptTerms-error"></div>
                  </div>

                  <!-- Submit button -->
                  <div class="d-grid mb-3">
                    <button type="submit" class="btn btn-primary btn-lg" id="register-submit">
                      <i class="bi bi-person-plus me-2"></i>
                      Регистрация
                    </button>
                  </div>

                  <!-- Divider -->
                  <div class="position-relative my-4">
                    <hr>
                    <div class="position-absolute top-50 start-50 translate-middle bg-white px-3">
                      или
                    </div>
                  </div>

                  <!-- Social registration -->
                  <div class="d-grid gap-2">
                    <button type="button" class="btn btn-outline-danger" id="google-register">
                      <i class="bi bi-google me-2"></i>
                      Регистрация с Google
                    </button>
                  </div>
                </form>

                <!-- Login link -->
                <div class="text-center mt-4">
                  <p class="mb-0">Вече имате акаунт?</p>
                  <a href="/login" class="btn btn-outline-primary mt-2">
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    Вход
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
    const form = document.getElementById('register-form');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const nameInput = document.getElementById('register-name');
    const phoneInput = document.getElementById('register-phone');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const googleRegisterBtn = document.getElementById('google-register');
    const submitBtn = document.getElementById('register-submit');

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
      this.validateField(passwordInput, validatePassword);
      // Re-validate confirm password if it has a value
      if (confirmPasswordInput.value) {
        this.validateConfirmPassword();
      }
    });

    confirmPasswordInput.addEventListener('blur', () => {
      this.validateConfirmPassword();
    });

    nameInput.addEventListener('blur', () => {
      this.validateField(nameInput, (val) => validateLength(val, 2, 100, 'Името'));
    });

    phoneInput.addEventListener('blur', () => {
      this.validateField(phoneInput, validatePhone);
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous errors
      this.clearErrors();

      // Gather form data
      const formData = {
        email: emailInput.value,
        password: passwordInput.value,
        confirmPassword: confirmPasswordInput.value,
        full_name: nameInput.value,
        phone: phoneInput.value,
        location_id: document.getElementById('register-location').value,
        acceptTerms: document.getElementById('register-terms').checked
      };

      // Validate form
      const validation = validateRegistrationForm(formData);
      if (!validation.isValid) {
        this.showErrors(validation.errors);
        return;
      }

      // Submit
      this.setLoading(true);

      try {
        await authService.register(
          formData.email,
          formData.password,
          formData.full_name
        );

        // Update profile with additional info
        await authService.updateProfile({
          phone: formData.phone,
          location_id: formData.location_id || null
        });

        window.showToast('Регистрацията успешна! Моля, проверете имейла си.', 'success');

        // Redirect to login or home
        setTimeout(() => {
          window.router.navigate('/login');
        }, 2000);
      } catch (error) {
        console.error('Registration error:', error);
        window.showToast(formatErrorMessage(error), 'error');
        this.setLoading(false);
      }
    });

    // Google registration
    if (googleRegisterBtn) {
      googleRegisterBtn.addEventListener('click', async () => {
        try {
          await authService.loginWithGoogle();
        } catch (error) {
          console.error('Google registration error:', error);
          window.showToast('Грешка при регистрация с Google.', 'error');
        }
      });
    }
  }

  validateField(input, validator) {
    const result = validator(input.value);
    const errorDiv = document.getElementById(`${input.id.replace('register-', '')}-error`);

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

  validateConfirmPassword() {
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const errorDiv = document.getElementById('confirmPassword-error');

    confirmPasswordInput.classList.remove('is-valid', 'is-invalid');

    if (confirmPasswordInput.value !== passwordInput.value) {
      confirmPasswordInput.classList.add('is-invalid');
      if (errorDiv) {
        errorDiv.textContent = 'Паролите не съвпадат.';
      }
      return false;
    } else if (confirmPasswordInput.value === '') {
      confirmPasswordInput.classList.add('is-invalid');
      if (errorDiv) {
        errorDiv.textContent = 'Моля, потвърдете паролата.';
      }
      return false;
    } else {
      confirmPasswordInput.classList.add('is-valid');
      return true;
    }
  }

  showErrors(errors) {
    for (const [field, message] of Object.entries(errors)) {
      const input = document.getElementById(`register-${field}`);
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
    const submitBtn = document.getElementById('register-submit');
    const googleRegisterBtn = document.getElementById('google-register');

    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Регистриране...';
      googleRegisterBtn.disabled = true;
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-person-plus me-2"></i>Регистрация';
      googleRegisterBtn.disabled = false;
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default RegisterPage;
