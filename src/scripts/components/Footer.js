import { subscriptionService } from '../services/subscription.js';

export class Footer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
  }

  getTemplate() {
    const currentYear = new Date().getFullYear();

    return `
      <footer class="bg-primary text-light mt-auto">
        <div class="container py-5">
          <div class="row g-4">
            <!-- About -->
            <div class="col-md-4">
              <h5 class="mb-3">
                <i class="bi bi-gear-wide-connected me-2"></i>
                Metalcutting Hub
              </h5>
              <p class="text-light">
                Пазарът за металообработваща техника и инструменти в България.
                Намерете най-добрите оферти за метчици, свредла, фрези и други.
              </p>
              <div class="d-flex gap-3">
                <a href="https://www.facebook.com/" class="text-light text-decoration-none" aria-label="Facebook">
                  <i class="bi bi-facebook fs-5"></i>
                </a>
                <a href="https://www.linkedin.com/" class="text-light text-decoration-none" aria-label="LinkedIn">
                  <i class="bi bi-linkedin fs-5"></i>
                </a>
                <a href="https://www.youtube.com/" class="text-light text-decoration-none" aria-label="YouTube">
                  <i class="bi bi-youtube fs-5"></i>
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="col-md-2 col-6">
              <h6 class="mb-3">Бързи връзки</h6>
              <ul class="list-unstyled">
                <li class="mb-2"><a href="/" class="text-light text-decoration-none">Начало</a></li>
                <li class="mb-2"><a href="/listings" class="text-light text-decoration-none">Обяви</a></li>
                <li class="mb-2"><a href="/listings/create" class="text-light text-decoration-none">Нова обява</a></li>
                <li class="mb-2"><a href="/about" class="text-light text-decoration-none">За нас</a></li>
              </ul>
            </div>

            <!-- Categories -->
            <div class="col-md-2 col-6">
              <h6 class="mb-3">Категории</h6>
              <ul class="list-unstyled">
                <li class="mb-2"><a href="/listings?category=others" class="text-light text-decoration-none">Други</a></li>
                <li class="mb-2"><a href="/listings?category=taps" class="text-light text-decoration-none">Метчици</a></li>
                <li class="mb-2"><a href="/listings?category=drills" class="text-light text-decoration-none">Свредла</a></li>
                <li class="mb-2"><a href="/listings?category=milling-cutters" class="text-light text-decoration-none">Фрези</a></li>
              </ul>
            </div>

            <!-- Support -->
            <div class="col-md-4">
              <h6 class="mb-3">Помощ</h6>
              <ul class="list-unstyled mb-3">
                <li class="mb-2"><a href="/help" class="text-light text-decoration-none">Често задавани въпроси</a></li>
                <li class="mb-2"><a href="/terms" class="text-light text-decoration-none">Общи условия</a></li>
                <li class="mb-2"><a href="/privacy" class="text-light text-decoration-none">Поверителност</a></li>
                <li class="mb-2"><a href="/contact" class="text-light text-decoration-none">Контакти</a></li>
              </ul>

              <!-- Newsletter -->
              <div class="mt-4">
                <h6 class="mb-2">Новини</h6>
                <form class="subscribe-form" id="footer-subscribe">
                  <div class="input-group input-group-sm">
                    <input type="email" class="form-control" placeholder="Вашият имейл"
                      aria-label="Email за новини" required>
                    <button class="btn btn-outline-light" type="submit">Абониране</button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <hr class="border-secondary my-4">

          <!-- Copyright -->
          <div class="row align-items-center">
            <div class="col-md-6 text-center text-md-start">
              <p class="mb-0 text-light">
                &copy; ${currentYear} Metalcutting Hub. Всички права запазени.
              </p>
            </div>
            <div class="col-md-6 text-center text-md-end">
              <small class="text-light">
                Направено с <i class="bi bi-heart-fill text-danger"></i> в България
              </small>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  attachEventListeners() {
    // Subscribe form
    const subscribeForm = document.getElementById('footer-subscribe');
    if (subscribeForm) {
      subscribeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = subscribeForm.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        const submitBtn = subscribeForm.querySelector('button[type="submit"]');

        if (!email) {
          window.showToast('Моля, въведете имейл адрес.', 'warning');
          return;
        }

        // Disable button while processing
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Изпращане...';

        try {
          await subscriptionService.subscribe(email);
          window.showToast('Проверете имейла си за потвърждение!', 'success');
          subscribeForm.reset();
        } catch (error) {
          if (error.message === 'DUPLICATE_EMAIL') {
            window.showToast('Този имейл вече е абониран!', 'warning');
          } else {
            console.error('Subscription error:', error);
            window.showToast('Грешка при абониране. Опитайте пак.', 'error');
          }
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
