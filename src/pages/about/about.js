import './about.css';

export class AboutPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
  }

  async render() {
    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
  }

  getTemplate() {
    return `
      <!-- Hero Section -->
      <section class="about-hero text-white py-5">
        <!-- Rotating gear wheels -->
        <div class="about-hero-gear about-hero-gear-1"><i class="bi bi-gear-wide-connected"></i></div>
        <div class="about-hero-gear about-hero-gear-2"><i class="bi bi-gear-wide"></i></div>
        <div class="about-hero-gear about-hero-gear-3"><i class="bi bi-gear-wide-connected"></i></div>
        <div class="about-hero-gear about-hero-gear-4"><i class="bi bi-gear-wide"></i></div>

        <div class="container py-4 position-relative">
          <div class="row align-items-center">
            <div class="col-lg-8 mx-auto text-center">
              <h1 class="display-4 fw-bold mb-3">
                <i class="bi bi-gear-wide-connected me-2"></i>
                За Metalcutting Hub
              </h1>
              <p class="lead mb-0">
                Вашият доверен партньор в света на металообработката.
                Обединяваме продавачи и купувачи на инструменти, резервни части и оборудване
                от цяла България.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Mission Section -->
      <section class="py-5">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-6 mb-4 mb-lg-0">
              <h2 class="mb-4">
                <i class="bi bi-bullseye text-primary me-2"></i>
                Нашата мисия
              </h2>
              <p class="lead text-muted">
                Metalcutting Hub е създаден с една ясна цел – да направи търговията
                с инструменти и оборудване за металообработка по-лесна, прозрачна и достъпна
                за всички участници в индустрията.
              </p>
              <p class="text-muted">
                Ние вярваме, че всеки професионалист в сферата на металообработката заслужава
                достъп до качествени инструменти и резервни части на честни цени. Нашата платформа
                свързва доставчици, търговци и крайни потребители в една екосистема, която
                улеснява намирането, сравняването и закупуването на необходимото оборудване.
              </p>
            </div>
            <div class="col-lg-6">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="row g-4">
                    <div class="col-6">
                      <div class="text-center">
                        <i class="bi bi-people-fill display-4 text-primary"></i>
                        <h4 class="mt-2 mb-1">2500+</h4>
                        <small class="text-muted">Регистрирани потребители</small>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="text-center">
                        <i class="bi bi-list-ul display-4 text-primary"></i>
                        <h4 class="mt-2 mb-1">1500+</h4>
                        <small class="text-muted">Активни обяви</small>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="text-center">
                        <i class="bi bi-building display-4 text-primary"></i>
                        <h4 class="mt-2 mb-1">120+</h4>
                        <small class="text-muted">Партньори</small>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="text-center">
                        <i class="bi bi-check-circle-fill display-4 text-primary"></i>
                        <h4 class="mt-2 mb-1">5000+</h4>
                        <small class="text-muted">Успешни сделки</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="py-5 bg-light">
        <div class="container">
          <h2 class="text-center mb-5">
            <i class="bi bi-heart-fill text-primary me-2"></i>
            Нашите ценности
          </h2>
          <div class="row g-4">
            <div class="col-md-6 col-lg-3">
              <div class="card value-card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="text-primary mb-3">
                    <i class="bi bi-shield-check display-5"></i>
                  </div>
                  <h5 class="card-title">Доверие</h5>
                  <p class="card-text text-muted small">
                    Създаваме среда на прозрачност и сигурност за всички транзакции.
                    Всеки продавач преминава през процес на верификация.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="card value-card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="text-primary mb-3">
                    <i class="bi bi-lightning-fill display-5"></i>
                  </div>
                  <h5 class="card-title">Ефективност</h5>
                  <p class="card-text text-muted small">
                    Нашата платформа е проектирана да спести време на всички участници.
                    Намерете нужното оборудване за минути, не за дни.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="card value-card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="text-primary mb-3">
                    <i class="bi bi-award-fill display-5"></i>
                  </div>
                  <h5 class="card-title">Качество</h5>
                  <p class="card-text text-muted small">
                    Поддържаме високи стандарти за качеството на обявите и предлаганите
                    продукти чрез активна модерация.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="card value-card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="text-primary mb-3">
                    <i class="bi bi-people-fill display-5"></i>
                  </div>
                  <h5 class="card-title">Общност</h5>
                  <p class="card-text text-muted small">
                    Изграждаме общност от професионалисти в металообработването,
                    които споделят знания и опит.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- History/Timeline Section -->
      <section class="py-5">
        <div class="container">
          <div class="row">
            <div class="col-lg-6 mb-4 mb-lg-0">
              <h2 class="mb-4">
                <i class="bi bi-clock-history text-primary me-2"></i>
                Нашата история
              </h2>
              <p class="text-muted mb-4">
                Metalcutting Hub е роден от идеята да се създаде специализирана платформа
                за българския пазар на металообработка. Започнахме като малък екип с голяма визия
                и днес продължаваме да растем заедно с нашата общност.
              </p>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-year">2023</div>
                  <h6>Началото</h6>
                  <p class="text-muted small mb-0">
                    Стартирахме с първата версия на платформата и първите 50 регистрирани потребители.
                  </p>
                </div>
                <div class="timeline-item">
                  <div class="timeline-year">2024</div>
                  <h6>Развитие</h6>
                  <p class="text-muted small mb-0">
                    Добавихме нови категории, подобрихме търсенето и достигнахме 1000 активни обяви.
                  </p>
                </div>
                <div class="timeline-item">
                  <div class="timeline-year">2025</div>
                  <h6>Разширение</h6>
                  <p class="text-muted small mb-0">
                    Партньорства с водещи доставчици и стартиране на мобилно приложение.
                  </p>
                </div>
                <div class="timeline-item">
                  <div class="timeline-year">2026</div>
                  <h6>Днес</h6>
                  <p class="text-muted small mb-0">
                    Продължаваме да иноватираме и да разширяваме възможностите на платформата.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <h2 class="mb-4">
                <i class="bi bi-person-lines-fill text-primary me-2"></i>
                Нашият екип
              </h2>
              <div class="row g-4">
                <div class="col-sm-6">
                  <div class="card team-card border-0 shadow-sm text-center">
                    <div class="card-body p-4">
                      <div class="team-avatar">
                        <i class="bi bi-person-fill"></i>
                      </div>
                      <h5 class="card-title mb-1">Иван Петров</h5>
                      <p class="text-primary small mb-2">Основател & CEO</p>
                      <p class="card-text text-muted small">
                        15+ години опит в металообработването и електронната търговия.
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="card team-card border-0 shadow-sm text-center">
                    <div class="card-body p-4">
                      <div class="team-avatar">
                        <i class="bi bi-person-fill"></i>
                      </div>
                      <h5 class="card-title mb-1">Мария Георгиева</h5>
                      <p class="text-primary small mb-2">CTO</p>
                      <p class="card-text text-muted small">
                        Експерт в уеб технологиите и изграждането на скалируеми платформи.
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="card team-card border-0 shadow-sm text-center">
                    <div class="card-body p-4">
                      <div class="team-avatar">
                        <i class="bi bi-person-fill"></i>
                      </div>
                      <h5 class="card-title mb-1">Димитър Иванов</h5>
                      <p class="text-primary small mb-2">Оперативен директор</p>
                      <p class="card-text text-muted small">
                        Специализиран в оптимизация на процеси и клиентско обслужване.
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="card team-card border-0 shadow-sm text-center">
                    <div class="card-body p-4">
                      <div class="team-avatar">
                        <i class="bi bi-person-fill"></i>
                      </div>
                      <h5 class="card-title mb-1">Елена Димитрова</h5>
                      <p class="text-primary small mb-2">Маркетинг директор</p>
                      <p class="card-text text-muted small">
                        Отговорна за развитието на бранда и привличането на нови потребители.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact CTA Section -->
      <section class="py-5 bg-primary text-white">
        <div class="container text-center py-4">
          <h2 class="mb-3">Имате въпроси? Свържете се с нас!</h2>
          <p class="lead mb-4">
            Нашият екип е тук, за да ви помогне. Не се колебайте да ни пишете.
          </p>
          <div class="row justify-content-center g-3">
            <div class="col-auto">
              <div class="d-flex align-items-center">
                <i class="bi bi-envelope-fill me-2 fs-4"></i>
                <span>info@metalcutting-hub.bg</span>
              </div>
            </div>
            <div class="col-auto">
              <div class="d-flex align-items-center">
                <i class="bi bi-telephone-fill me-2 fs-4"></i>
                <span>+359 2 123 4567</span>
              </div>
            </div>
            <div class="col-auto">
              <div class="d-flex align-items-center">
                <i class="bi bi-geo-alt-fill me-2 fs-4"></i>
                <span>София, България</span>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <a href="/listings/create" class="btn btn-light btn-lg text-primary fw-bold me-2">
              <i class="bi bi-plus-circle me-2"></i>Създайте обява
            </a>
            <a href="/listings" class="btn btn-outline-light btn-lg">
              <i class="bi bi-search me-2"></i>Разгледайте обявите
            </a>
          </div>
        </div>
      </section>
    `;
  }

  attachEventListeners() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default AboutPage;
