export class Footer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    this.container.innerHTML = this.getTemplate();
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
              <p class="text-muted">
                Пазарът за металорежещи инструменти в България.
                Намирайте най-добрите оферти за резбофрези, свредла, фрези и други.
              </p>
              <div class="d-flex gap-3">
                <a href="#" class="text-muted text-decoration-none" aria-label="Facebook">
                  <i class="bi bi-facebook fs-5"></i>
                </a>
                <a href="#" class="text-muted text-decoration-none" aria-label="LinkedIn">
                  <i class="bi bi-linkedin fs-5"></i>
                </a>
                <a href="#" class="text-muted text-decoration-none" aria-label="YouTube">
                  <i class="bi bi-youtube fs-5"></i>
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="col-md-2 col-6">
              <h6 class="mb-3">Бързи връзки</h6>
              <ul class="list-unstyled">
                <li class="mb-2"><a href="/" class="text-muted text-decoration-none">Начало</a></li>
                <li class="mb-2"><a href="/listings" class="text-muted text-decoration-none">Обяви</a></li>
                <li class="mb-2"><a href="/listings/create" class="text-muted text-decoration-none">Нова обява</a></li>
                <li class="mb-2"><a href="/about" class="text-muted text-decoration-none">За нас</a></li>
              </ul>
            </div>

            <!-- Categories -->
            <div class="col-md-2 col-6">
              <h6 class="mb-3">Категории</h6>
              <ul class="list-unstyled">
                <li class="mb-2"><a href="/listings?category=metalcutting-tools" class="text-muted text-decoration-none">Металорежещи</a></li>
                <li class="mb-2"><a href="/listings?category=taps" class="text-muted text-decoration-none">Резбофрези</a></li>
                <li class="mb-2"><a href="/listings?category=drills" class="text-muted text-decoration-none">Свредла</a></li>
                <li class="mb-2"><a href="/listings?category=milling-cutters" class="text-muted text-decoration-none">Фрези</a></li>
              </ul>
            </div>

            <!-- Support -->
            <div class="col-md-4">
              <h6 class="mb-3">Помощ</h6>
              <ul class="list-unstyled mb-3">
                <li class="mb-2"><a href="/help" class="text-muted text-decoration-none">Често задавани въпроси</a></li>
                <li class="mb-2"><a href="/terms" class="text-muted text-decoration-none">Общи условия</a></li>
                <li class="mb-2"><a href="/privacy" class="text-muted text-decoration-none">Поверителност</a></li>
                <li class="mb-2"><a href="/contact" class="text-muted text-decoration-none">Контакти</a></li>
              </ul>

              <!-- Newsletter -->
              <div class="mt-4">
                <h6 class="mb-2">Новини</h6>
                <form class="subscribe-form" id="footer-subscribe">
                  <div class="input-group input-group-sm">
                    <input type="email" class="form-control" placeholder="Вашият имейл"
                      aria-label="Email за новини" required>
                    <button class="btn btn-primary" type="submit">Абониране</button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <hr class="border-secondary my-4">

          <!-- Copyright -->
          <div class="row align-items-center">
            <div class="col-md-6 text-center text-md-start">
              <p class="mb-0 text-muted">
                &copy; ${currentYear} Metalcutting Hub. Всички права запазени.
              </p>
            </div>
            <div class="col-md-6 text-center text-md-end">
              <small class="text-muted">
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
      subscribeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = subscribeForm.querySelector('input[type="email"]').value;
        window.showToast('Успешна абонация за новини!', 'success');
        subscribeForm.reset();
      });
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
