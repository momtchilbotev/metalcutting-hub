import './contact.css';
import { authService } from '../../scripts/services/auth.js';

export class ContactPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.isSubmitting = false;
    this.map = null;
  }

  async render() {
    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
    await this.initMap();
  }

  async initMap() {
    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const leafletCss = document.createElement('link');
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      leafletCss.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      leafletCss.crossOrigin = '';
      document.head.appendChild(leafletCss);
    }

    // Load Leaflet JS
    if (!window.L) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Initialize map - coordinates for бул. "Витоша" 100, София
    const latitude = 42.6925;
    const longitude = 23.3210;

    const mapContainer = document.getElementById('contact-map');
    if (mapContainer && window.L && !this.map) {
      this.map = window.L.map('contact-map').setView([latitude, longitude], 16);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      // Add marker with popup
      const marker = window.L.marker([latitude, longitude]).addTo(this.map);
      marker.bindPopup(`
        <div class="map-popup">
          <strong><i class="bi bi-geo-alt-fill text-primary me-1"></i>Metalcutting Hub</strong><br>
          <span>бул. "Витоша" 100<br>София, България</span>
        </div>
      `).openPopup();
    }
  }

  getTemplate() {
    return `
      <!-- Hero Section -->
      <section class="contact-hero text-white py-5">
        <div class="container py-4 position-relative">
          <div class="row align-items-center">
            <div class="col-lg-8 mx-auto text-center">
              <h1 class="display-4 fw-bold mb-3">
                <i class="bi bi-envelope-paper-fill me-2"></i>
                Свържете се с нас
              </h1>
              <p class="lead mb-0">
                Имате въпроси, предложения или нужда от помощ?
                Нашият екип е тук, за да ви помогне.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Info Cards -->
      <section class="py-5">
        <div class="container">
          <div class="row g-4 mb-5">
            <div class="col-md-6 col-lg-3">
              <div class="contact-info-card text-center">
                <div class="contact-info-icon mx-auto">
                  <i class="bi bi-envelope-fill"></i>
                </div>
                <h5>Имейл</h5>
                <p>
                  <a href="mailto:info@metalcutting-hub.bg">info@metalcutting-hub.bg</a>
                </p>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="contact-info-card text-center">
                <div class="contact-info-icon mx-auto">
                  <i class="bi bi-telephone-fill"></i>
                </div>
                <h5>Телефон</h5>
                <p>
                  <a href="tel:+35921234567">+359 2 123 4567</a>
                </p>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="contact-info-card text-center">
                <div class="contact-info-icon mx-auto">
                  <i class="bi bi-geo-alt-fill"></i>
                </div>
                <h5>Адрес</h5>
                <p>София, България<br>бул. "Витоша" 100</p>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="contact-info-card text-center">
                <div class="contact-info-icon mx-auto">
                  <i class="bi bi-clock-fill"></i>
                </div>
                <h5>Работно време</h5>
                <p>Пон - Пет: 9:00 - 18:00<br>Съб - Нед: Почивка</p>
              </div>
            </div>
          </div>

          <!-- Contact Form & Info -->
          <div class="row g-5">
            <!-- Contact Form -->
            <div class="col-lg-7">
              <div class="contact-form-card p-4 p-lg-5">
                <h3 class="mb-4">
                  <i class="bi bi-chat-dots-fill text-primary me-2"></i>
                  Изпратете съобщение
                </h3>

                <!-- Success Message -->
                <div id="contact-success" class="alert alert-success-custom d-none" role="alert">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-check-circle-fill text-success me-3 fs-4"></i>
                    <div>
                      <h5 class="alert-heading mb-1">Съобщението е изпратено!</h5>
                      <p class="mb-0">Благодарим ви за обратната връзка. Ще се свържем с вас в рамките на 24 часа.</p>
                    </div>
                  </div>
                </div>

                <!-- Error Message -->
                <div id="contact-error" class="alert alert-error-custom d-none" role="alert">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-exclamation-triangle-fill text-danger me-3 fs-4"></i>
                    <div>
                      <h5 class="alert-heading mb-1">Грешка при изпращане</h5>
                      <p class="mb-0" id="contact-error-message">Моля, опитайте отново или ни се обадете.</p>
                    </div>
                  </div>
                </div>

                <form id="contact-form" novalidate>
                  <div class="row g-3">
                    <!-- Name -->
                    <div class="col-md-6">
                      <label for="contact-name" class="form-label">
                        Име <span class="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="contact-name"
                        name="name"
                        placeholder="Вашето име"
                        required
                        autocomplete="name"
                      >
                      <div class="invalid-feedback">
                        Моля, въведете вашето име.
                      </div>
                    </div>

                    <!-- Email -->
                    <div class="col-md-6">
                      <label for="contact-email" class="form-label">
                        Имейл <span class="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        class="form-control"
                        id="contact-email"
                        name="email"
                        placeholder="example@domain.com"
                        required
                        autocomplete="email"
                      >
                      <div class="invalid-feedback">
                        Моля, въведете валиден имейл адрес.
                      </div>
                    </div>

                    <!-- Phone (Optional) -->
                    <div class="col-md-6">
                      <label for="contact-phone" class="form-label">
                        Телефон <span class="text-muted">(по желание)</span>
                      </label>
                      <input
                        type="tel"
                        class="form-control"
                        id="contact-phone"
                        name="phone"
                        placeholder="+359 888 123 456"
                        autocomplete="tel"
                      >
                    </div>

                    <!-- Subject -->
                    <div class="col-md-6">
                      <label for="contact-subject" class="form-label">
                        Тема <span class="text-danger">*</span>
                      </label>
                      <select
                        class="form-select"
                        id="contact-subject"
                        name="subject"
                        required
                      >
                        <option value="" disabled selected>Изберете тема</option>
                        <option value="general">Общ въпрос</option>
                        <option value="listing">Въпрос за обява</option>
                        <option value="account">Проблем с акаунт</option>
                        <option value="partnership">Партньорство</option>
                        <option value="feedback">Обратна връзка</option>
                        <option value="report">Доклад за нарушение</option>
                        <option value="other">Друго</option>
                      </select>
                      <div class="invalid-feedback">
                        Моля, изберете тема.
                      </div>
                    </div>

                    <!-- Message -->
                    <div class="col-12">
                      <label for="contact-message" class="form-label">
                        Съобщение <span class="text-danger">*</span>
                      </label>
                      <textarea
                        class="form-control"
                        id="contact-message"
                        name="message"
                        rows="5"
                        placeholder="Опишете вашия въпрос или проблем..."
                        required
                        minlength="20"
                      ></textarea>
                      <div class="d-flex justify-content-between mt-1">
                        <div class="invalid-feedback">
                          Моля, въведете съобщение (минимум 20 символа).
                        </div>
                        <small class="text-muted ms-auto">
                          <span id="message-counter">0</span>/1000
                        </small>
                      </div>
                    </div>

                    <!-- Privacy Agreement -->
                    <div class="col-12">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="contact-privacy"
                          required
                        >
                        <label class="form-check-label small" for="contact-privacy">
                          Съгласен съм с <a href="/privacy" class="text-primary">политиката за защита на личните данни</a>
                          и <a href="/terms" class="text-primary">общите условия</a>.
                        </label>
                        <div class="invalid-feedback">
                          Трябва да се съгласите с условията.
                        </div>
                      </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="col-12">
                      <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
                        <button
                          type="submit"
                          class="btn btn-primary btn-submit"
                          id="contact-submit-btn"
                        >
                          <span class="btn-text">
                            <i class="bi bi-send-fill me-2"></i>
                            Изпрати съобщение
                          </span>
                          <span class="btn-spinner d-none">
                            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                            Изпращане...
                          </span>
                        </button>
                        <div class="trust-badges d-flex flex-wrap gap-2">
                          <span class="trust-badge">
                            <i class="bi bi-shield-check"></i>
                            Защитена връзка
                          </span>
                          <span class="trust-badge">
                            <i class="bi bi-clock-history"></i>
                            Отговор до 24ч
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="col-lg-5">
              <!-- Working Hours Card -->
              <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                  <h5 class="card-title mb-4">
                    <i class="bi bi-calendar-week text-primary me-2"></i>
                    Работно време
                  </h5>
                  <div class="working-hours">
                    <div class="working-hours-item">
                      <span class="day">Понеделник - Петък</span>
                      <span class="hours">09:00 - 18:00</span>
                    </div>
                    <div class="working-hours-item">
                      <span class="day">Събота</span>
                      <span class="hours">10:00 - 14:00</span>
                    </div>
                    <div class="working-hours-item">
                      <span class="day">Неделя</span>
                      <span class="hours text-danger">Почивка</span>
                    </div>
                  </div>
                  <p class="text-muted small mt-3 mb-0">
                    <i class="bi bi-info-circle me-1"></i>
                    В рамките на работното време ще получите отговор в рамките на 2-4 часа.
                  </p>
                </div>
              </div>

              <!-- Quick Links Card -->
              <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                  <h5 class="card-title mb-4">
                    <i class="bi bi-link-45deg text-primary me-2"></i>
                    Бързи връзки
                  </h5>
                  <div class="d-grid gap-2">
                    <a href="/help" class="btn btn-outline-primary text-start">
                      <i class="bi bi-question-circle me-2"></i>
                      Често задавани въпроси
                    </a>
                    <a href="/listings" class="btn btn-outline-primary text-start">
                      <i class="bi bi-search me-2"></i>
                      Търсете обяви
                    </a>
                    <a href="/about" class="btn btn-outline-primary text-start">
                      <i class="bi bi-info-circle me-2"></i>
                      За нас
                    </a>
                  </div>
                </div>
              </div>

              <!-- Map -->
              <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                  <h5 class="card-title mb-3">
                    <i class="bi bi-geo-alt text-primary me-2"></i>
                    Нашата локация
                  </h5>
                  <div id="contact-map" class="contact-map"></div>
                  <div class="mt-3">
                    <a href="https://www.google.com/maps/search/?api=1&query=42.6925,23.3210" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary btn-sm">
                      <i class="bi bi-box-arrow-up-right me-1"></i>
                      Отвори в Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="py-5 bg-light">
        <div class="container">
          <h3 class="text-center mb-5">
            <i class="bi bi-patch-question-fill text-primary me-2"></i>
            Често задавани въпроси
          </h3>
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <div class="faq-item">
                <div class="faq-question">
                  <span>Колко време отнема да получа отговор?</span>
                  <i class="bi bi-chevron-down"></i>
                </div>
                <div class="faq-answer">
                  <p>Стремим се да отговаряме на всички запитвания в рамките на 24 часа през работните дни. При спешни въпроси, можете да ни се обадите директно по време на работното ни време.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question">
                  <span>Как мога да докладвам проблемна обява?</span>
                  <i class="bi bi-chevron-down"></i>
                </div>
                <div class="faq-answer">
                  <p>Можете да използвате формата за контакт по-горе и да изберете "Доклад за нарушение" като тема. Също така, на всяка страница с обява има бутон "Докладвай", който изпраща директно съобщение до нашия екип за модерация.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question">
                  <span>Предлагате ли партньорства за бизнеса?</span>
                  <i class="bi bi-chevron-down"></i>
                </div>
                <div class="faq-answer">
                  <p>Да, активно търсим партньорства с доставчици на инструменти и оборудване за металообработка. Свържете се с нас чрез формата, като изберете "Партньорство" като тема, и ще обсъдим възможностите за сътрудничество.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question">
                  <span>Какви данни събирате чрез формата за контакт?</span>
                  <i class="bi bi-chevron-down"></i>
                </div>
                <div class="faq-answer">
                  <p>Събираме само информацията, която ни предоставяте - име, имейл, телефон (по желание) и съобщението ви. Тази информация се използва само за да се свържем с вас относно вашето запитване. Можете да разгледате нашата <a href="/privacy">политика за защита на личните данни</a>.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question">
                  <span>Мога ли да променя или изтрия моите данни?</span>
                  <i class="bi bi-chevron-down"></i>
                </div>
                <div class="faq-answer">
                  <p>Да, съгласно GDPR имате право да поискате достъп, корекция или изтриване на вашите лични данни. Свържете се с нас чрез формата или на info@metalcutting-hub.bg и ще обработим вашето искане в рамките на 30 дни.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  attachEventListeners() {
    // Form submission
    const form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Real-time validation
    const inputs = form?.querySelectorAll('input, select, textarea');
    inputs?.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          this.validateField(input);
        }
      });
    });

    // Message character counter
    const messageField = document.getElementById('contact-message');
    const counter = document.getElementById('message-counter');
    if (messageField && counter) {
      messageField.addEventListener('input', () => {
        const length = messageField.value.length;
        counter.textContent = length;
        if (length > 1000) {
          counter.classList.add('text-danger');
        } else {
          counter.classList.remove('text-danger');
        }
      });
    }

    // FAQ accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question?.addEventListener('click', () => {
        // Close other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
          }
        });
        // Toggle current item
        item.classList.toggle('active');
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;

    switch (field.name) {
      case 'name':
        isValid = value.length >= 2;
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
        break;
      case 'subject':
        isValid = value !== '';
        break;
      case 'message':
        isValid = value.length >= 20 && value.length <= 1000;
        break;
      default:
        if (field.required) {
          isValid = value !== '';
        }
    }

    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
    }

    return isValid;
  }

  validateForm() {
    const form = document.getElementById('contact-form');
    const fields = form?.querySelectorAll('[required]');
    let isValid = true;

    fields?.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;

    // Hide previous messages
    document.getElementById('contact-success')?.classList.add('d-none');
    document.getElementById('contact-error')?.classList.add('d-none');

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.setLoadingState(true);

    const form = e.target;
    const formData = new FormData(form);

    // Get current user if logged in
    let userId = null;
    try {
      const session = await authService.getSession();
      userId = session?.user?.id;
    } catch (e) {
      // User not logged in, continue without user ID
    }

    // Prepare contact data
    const contactData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || null,
      subject: formData.get('subject'),
      message: formData.get('message'),
      user_id: userId,
      created_at: new Date().toISOString(),
      status: 'new'
    };

    try {
      // Simulate API call - in production, this would send to Supabase or email service
      await this.submitContactForm(contactData);

      // Show success message
      document.getElementById('contact-success')?.classList.remove('d-none');
      form.reset();

      // Remove validation classes
      form.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
      });

      // Reset counter
      const counter = document.getElementById('message-counter');
      if (counter) counter.textContent = '0';

      // Scroll to success message
      document.getElementById('contact-success')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
      console.error('Contact form error:', error);
      document.getElementById('contact-error')?.classList.remove('d-none');
      const errorMsg = document.getElementById('contact-error-message');
      if (errorMsg) {
        errorMsg.textContent = error.message || 'Възникна грешка. Моля, опитайте отново.';
      }
    } finally {
      this.isSubmitting = false;
      this.setLoadingState(false);
    }
  }

  async submitContactForm(data) {
    // In a real application, this would:
    // 1. Store the contact submission in Supabase
    // 2. Send an email notification
    // 3. Potentially trigger other workflows

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For now, just log the submission
    console.log('Contact form submission:', data);

    // In production, uncomment and use Supabase:
    // const { data: submission, error } = await supabase
    //   .from('contact_submissions')
    //   .insert([data]);
    //
    // if (error) throw error;
    // return submission;

    return { success: true };
  }

  setLoadingState(loading) {
    const btn = document.getElementById('contact-submit-btn');
    const btnText = btn?.querySelector('.btn-text');
    const btnSpinner = btn?.querySelector('.btn-spinner');

    if (btn) {
      btn.disabled = loading;
      if (loading) {
        btnText?.classList.add('d-none');
        btnSpinner?.classList.remove('d-none');
      } else {
        btnText?.classList.remove('d-none');
        btnSpinner?.classList.add('d-none');
      }
    }
  }

  destroy() {
    // Clean up map instance
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default ContactPage;
