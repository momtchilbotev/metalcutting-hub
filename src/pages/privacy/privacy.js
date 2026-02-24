import './privacy.css';

export class PrivacyPage {
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
      <section class="privacy-hero text-white py-5">
        <div class="container py-4 position-relative">
          <div class="row align-items-center">
            <div class="col-lg-8 mx-auto text-center">
              <h1 class="display-4 fw-bold mb-3">
                <i class="bi bi-shield-lock me-2"></i>
                Политика за защита на личните данни
              </h1>
              <p class="lead mb-3">
                Информация за това как Metalcutting Hub събира, използва и защитава Вашите лични данни
              </p>
              <div class="last-updated">
                <i class="bi bi-calendar3"></i>
                <span>В сила от: 24 февруари 2026 г.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <section class="py-5">
        <div class="container">
          <div class="row">
            <!-- Table of Contents Sidebar -->
            <div class="col-lg-3 mb-4 mb-lg-0">
              <div class="toc-card card shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="mb-0">
                    <i class="bi bi-list-ul me-2"></i>Съдържание
                  </h5>
                </div>
                <div class="card-body p-0">
                  <div class="list-group list-group-flush">
                    <a href="#section-1" class="list-group-item list-group-item-action">1. Въведение</a>
                    <a href="#section-2" class="list-group-item list-group-item-action">2. Контролер на данни</a>
                    <a href="#section-3" class="list-group-item list-group-item-action">3. Събиране на данни</a>
                    <a href="#section-4" class="list-group-item list-group-item-action">4. Цели на обработката</a>
                    <a href="#section-5" class="list-group-item list-group-item-action">5. Правно основание</a>
                    <a href="#section-6" class="list-group-item list-group-item-action">6. Споделяне на данни</a>
                    <a href="#section-7" class="list-group-item list-group-item-action">7. Трансфер на данни</a>
                    <a href="#section-8" class="list-group-item list-group-item-action">8. Срокове за съхранение</a>
                    <a href="#section-9" class="list-group-item list-group-item-action">9. Правата на субектите</a>
                    <a href="#section-10" class="list-group-item list-group-item-action">10. Бисквитки</a>
                    <a href="#section-11" class="list-group-item list-group-item-action">11. Сигурност на данните</a>
                    <a href="#section-12" class="list-group-item list-group-item-action">12. Непълнолетни лица</a>
                    <a href="#section-13" class="list-group-item list-group-item-action">13. Промени в политиката</a>
                    <a href="#section-14" class="list-group-item list-group-item-action">14. Контакти</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Privacy Content -->
            <div class="col-lg-9">
              <div class="privacy-content">
                <!-- Quick Info Cards -->
                <div class="row g-3 mb-5 no-print">
                  <div class="col-md-4">
                    <div class="card quick-link-card h-100 text-center p-3">
                      <i class="bi bi-shield-check mb-2"></i>
                      <h6>GDPR Съвместимост</h6>
                      <small class="text-muted">Спазваме регламента за защита на данните в ЕС</small>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card quick-link-card h-100 text-center p-3">
                      <i class="bi bi-lock mb-2"></i>
                      <h6>Шифроване</h6>
                      <small class="text-muted">Вашите данни са защитени с TLS шифроване</small>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card quick-link-card h-100 text-center p-3">
                      <i class="bi bi-person-check mb-2"></i>
                      <h6>Ваши права</h6>
                      <small class="text-muted">Пълен контрол върху Вашите данни</small>
                    </div>
                  </div>
                </div>

                <!-- Section 1: Introduction -->
                <div id="section-1" class="mb-5">
                  <h2><i class="bi bi-info-circle me-2"></i>1. Въведение</h2>
                  <p>
                    Настоящата Политика за защита на личните данни („Политиката“) описва как Metalcutting Hub
                    („ние“, „нас“ или „Платформата“) събира, използва, съхранява и защитава личните данни
                    на потребителите на нашата платформа.
                  </p>
                  <p>
                    Ние се ангажираме да защитаваме Вашата поверителност и да обработваме Вашите лични данни
                    в съответствие с <strong>Регламент (ЕС) 2016/679</strong> (Общия регламент за защита на данните - GDPR),
                    <strong>Закона за защита на личните данни</strong> на Република България и другото приложимо
                    законодателство за защита на данните.
                  </p>
                  <div class="highlight-box info">
                    <strong>Важно:</strong> Моля, прочетете внимателно тази Политика преди да използвате Платформата.
                    Използването на Платформата следва да се счита за съгласие с практиките, описани в тази Политика.
                  </div>
                </div>

                <!-- Section 2: Data Controller -->
                <div id="section-2" class="mb-5">
                  <h2><i class="bi bi-building me-2"></i>2. Контролер на данни</h2>
                  <p>Контролер на личните данни е:</p>
                  <div class="card contact-card mb-3">
                    <div class="card-body">
                      <h5 class="card-title text-primary">Metalcutting Hub</h5>
                      <p class="card-text mb-1">
                        <strong>Адрес:</strong> гр. София, България
                      </p>
                      <p class="card-text mb-1">
                        <strong>Имейл за защита на данните:</strong>
                        <a href="mailto:dpo@metalcutting-hub.bg">dpo@metalcutting-hub.bg</a>
                      </p>
                      <p class="card-text mb-0">
                        <strong>Телефон:</strong> +359 2 123 4567
                      </p>
                    </div>
                  </div>
                  <p>
                    За всички въпроси, свързани с обработката на Вашите лични данни и упражняването на Вашите права,
                    можете да се свържете с нас на посочения имейл адрес.
                  </p>
                </div>

                <!-- Section 3: Data Collection -->
                <div id="section-3" class="mb-5">
                  <h2><i class="bi bi-database me-2"></i>3. Събиране на данни</h2>
                  <p>
                    Събираме лични данни, които Вие предоставяте директно, както и данни, които се генерират
                    автоматично при използване на Платформата.
                  </p>

                  <h3>3.1. Данни, предоставени от Вас</h3>
                  <div class="table-responsive">
                    <table class="table table-bordered data-table">
                      <thead>
                        <tr>
                          <th>Категория</th>
                          <th>Типове данни</th>
                          <th>Източник</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Регистрационни данни</strong></td>
                          <td>Име, фамилия, имейл адрес, телефонен номер, име на фирма, ЕИК/БУЛСТАТ, адрес</td>
                          <td>Форма за регистрация</td>
                        </tr>
                        <tr>
                          <td><strong>Данни за профила</strong></td>
                          <td>Профилна снимка, описание на фирмата, уебсайт</td>
                          <td>Настройки на профила</td>
                        </tr>
                        <tr>
                          <td><strong>Данни за обявите</strong></td>
                          <td>Заглавие, описание, изображения, цена, местоположение на стоката</td>
                          <td>Форма за обява</td>
                        </tr>
                        <tr>
                          <td><strong>Комуникационни данни</strong></td>
                          <td>Съобщения, отзиви, въпроси към обяви</td>
                          <td>Система за съобщения</td>
                        </tr>
                        <tr>
                          <td><strong>Платежни данни</strong></td>
                          <td>Данни за фактуриране (не платежни карти)</td>
                          <td>Настройки за плащане</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3>3.2. Автоматично събрани данни</h3>
                  <div class="table-responsive">
                    <table class="table table-bordered data-table">
                      <thead>
                        <tr>
                          <th>Категория</th>
                          <th>Типове данни</th>
                          <th>Цел</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Технически данни</strong></td>
                          <td>IP адрес, тип устройство, операционна система, браузър, езикови настройки</td>
                          <td>Техническа оптимизация и сигурност</td>
                        </tr>
                        <tr>
                          <td><strong>Данни за използване</strong></td>
                          <td>Посетени страници, време на престой, кликове, действия в Платформата</td>
                          <td>Анализ и подобряване на услугите</td>
                        </tr>
                        <tr>
                          <td><strong>Данни за местоположение</strong></td>
                          <td>Общо местоположение (на ниво град/област) на базата на IP</td>
                          <td>Персонализация на съдържанието</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="highlight-box">
                    <strong>Принцип на минимизиране:</strong> Събираме само данни, които са необходими
                    за функционирането на Платформата и предоставянето на нашите услуги. Не събираме
                    излишни или прекомерни данни.
                  </div>
                </div>

                <!-- Section 4: Purposes -->
                <div id="section-4" class="mb-5">
                  <h2><i class="bi bi-bullseye me-2"></i>4. Цели на обработката</h2>
                  <p>Обработваме Вашите лични данни за следните цели:</p>

                  <h3>4.1. Предоставяне на услуги</h3>
                  <ul>
                    <li>Създаване и управление на потребителски профил</li>
                    <li>Публикуване и управление на обяви</li>
                    <li>Комуникация между купувачи и продавачи</li>
                    <li>Обработка на запитвания и заявки</li>
                    <li>Предоставяне на техническа поддръжка</li>
                  </ul>

                  <h3>4.2. Подобряване на услугите</h3>
                  <ul>
                    <li>Анализ на използването на Платформата</li>
                    <li>Персонализация на съдържанието и препоръки</li>
                    <li>Разработване на нови функционалности</li>
                    <li>Провеждане на проучвания и статистически анализи</li>
                  </ul>

                  <h3>4.3. Сигурност и защита</h3>
                  <ul>
                    <li>Предотвратяване на измами и злоупотреби</li>
                    <li>Защита на Платформата от кибератаки</li>
                    <li>Верификация на потребителите</li>
                    <li>Модерация на съдържанието</li>
                  </ul>

                  <h3>4.4. Правни задължения</h3>
                  <ul>
                    <li>Спазване на приложимото законодателство</li>
                    <li>Отговаряне на искания от държавни органи</li>
                    <li>Решаване на правни спорове</li>
                  </ul>

                  <h3>4.5. Маркетинг (при съгласие)</h3>
                  <ul>
                    <li>Изпращане на бюлетини и промоционални съобщения</li>
                    <li>Персонализирана реклама</li>
                  </ul>
                </div>

                <!-- Section 5: Legal Basis -->
                <div id="section-5" class="mb-5">
                  <h2><i class="bi bi-file-earmark-check me-2"></i>5. Правно основание</h2>
                  <p>
                    Обработваме Вашите лични данни на следните правни основания съгласно чл. 6 от GDPR:
                  </p>

                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <div class="card rights-card h-100 p-3 border-0 shadow-sm">
                        <h5 class="text-primary"><i class="bi bi-hand-index me-2"></i>Съгласие</h5>
                        <p class="mb-0 small">
                          Когато сте дали изрично съгласие за конкретни цели, като маркетингови комуникации
                          или използване на бисквитки за анализи.
                        </p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card rights-card h-100 p-3 border-0 shadow-sm">
                        <h5 class="text-primary"><i class="bi bi-file-earmark-text me-2"></i>Договор</h5>
                        <p class="mb-0 small">
                          Когато обработката е необходима за изпълнението на договор с Вас, включително
                          за предоставянето на услугите на Платформата.
                        </p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card rights-card h-100 p-3 border-0 shadow-sm">
                        <h5 class="text-primary"><i class="bi bi-balance-scale me-2"></i>Правно задължение</h5>
                        <p class="mb-0 small">
                          Когато обработката е необходима за спазване на правни задължения,
                          като съхраняване на данни за счетоводни цели.
                        </p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card rights-card h-100 p-3 border-0 shadow-sm">
                        <h5 class="text-primary"><i class="bi bi-shield-check me-2"></i>Легитимен интерес</h5>
                        <p class="mb-0 small">
                          Когато имаме легитимен интерес, който не се припокрива с Вашите права,
                          като предотвратяване на измами и подобряване на услугите.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Section 6: Data Sharing -->
                <div id="section-6" class="mb-5">
                  <h2><i class="bi bi-share me-2"></i>6. Споделяне на данни</h2>
                  <p>Може да споделяме Вашите лични данни с:</p>

                  <h3>6.1. Други потребители</h3>
                  <p>
                    Някои данни от Вашия профил (име, фирма, контактна информация) са видими за другите
                    потребители на Платформата в контекста на обявите и комуникацията.
                  </p>

                  <h3>6.2. Доставчици на услуги</h3>
                  <ul>
                    <li><strong>Хостинг доставчици</strong> – за хостване на Платформата</li>
                    <li><strong>Анализични услуги</strong> – за анализ на използването (напр. Google Analytics)</li>
                    <li><strong>Имейл услуги</strong> – за изпращане на известия и бюлетини</li>
                    <li><strong>Платежни услуги</strong> – за обработка на плащания (ако приложимо)</li>
                    <li><strong>Клиентска поддръжка</strong> – за предоставяне на помощ</li>
                  </ul>

                  <h3>6.3. Правни изисквания</h3>
                  <p>
                    Може да разкрием данни на държавни органи, когато това се изисква от закона или
                    е необходимо за защита на нашите права.
                  </p>

                  <div class="highlight-box warning">
                    <strong>Забележка:</strong> Не продаваме Вашите лични данни на трети лица.
                    Всички доставчици на услуги, с които работим, са обвързани с договори за защита на данните.
                  </div>
                </div>

                <!-- Section 7: Data Transfer -->
                <div id="section-7" class="mb-5">
                  <h2><i class="bi bi-globe me-2"></i>7. Трансфер на данни</h2>
                  <p>
                    Вашите данни се съхраняват предимно на сървъри в Европейския съюз. В някои случаи
                    може да прехвърляме данни към трети страни извън ЕИП (Европейското икономическо пространство).
                  </p>

                  <h3>7.1. Гаранции за трансфер</h3>
                  <p>При трансфер на данни извън ЕИП осигуряваме:</p>
                  <ul>
                    <li>Стандартни договорни клаузи, одобрени от Европейската комисия</li>
                    <li>Адекватно ниво на защита в съответствие с GDPR</li>
                    <li>Технически и организационни мерки за сигурност</li>
                  </ul>

                  <h3>7.2. Съхранение</h3>
                  <p>
                    Използваме услугите на <strong>Supabase</strong> за съхранение на данни, което осигурява
                    сървъри в ЕС и спазва изискванията на GDPR.
                  </p>
                </div>

                <!-- Section 8: Retention -->
                <div id="section-8" class="mb-5">
                  <h2><i class="bi bi-clock-history me-2"></i>8. Срокове за съхранение</h2>
                  <p>Съхраняваме Вашите лични данни толкова дълго, колкото е необходимо за целите, за които са събрани:</p>

                  <div class="table-responsive">
                    <table class="table table-bordered data-table">
                      <thead>
                        <tr>
                          <th>Категория данни</th>
                          <th>Срок на съхранение</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Данни за акаунта</td>
                          <td>Докато акаунтът е активен + 2 години след изтриване или неактивност</td>
                        </tr>
                        <tr>
                          <td>Обяви и съдържание</td>
                          <td>Докато обявата е активна + 3 години за архивни цели</td>
                        </tr>
                        <tr>
                          <td>Съобщения</td>
                          <td>3 години от последната активност</td>
                        </tr>
                        <tr>
                          <td>Логове за сигурност</td>
                          <td>1 година</td>
                        </tr>
                        <tr>
                          <td>Данни за фактуриране</td>
                          <td>5 години (съгласно счетоводното законодателство)</td>
                        </tr>
                        <tr>
                          <td>Маркетингови данни</td>
                          <td>До оттегяне на съгласието</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p>
                    След изтичане на срока за съхранение, данните се изтриват или анонимизират безопасно.
                  </p>
                </div>

                <!-- Section 9: Rights -->
                <div id="section-9" class="mb-5">
                  <h2><i class="bi bi-person-lines-fill me-2"></i>9. Правата на субектите</h2>
                  <p>
                    Съгласно GDPR имате следните права по отношение на Вашите лични данни:
                  </p>

                  <div class="row g-3 mb-4">
                    <div class="col-md-6">
                      <div class="card rights-card p-3 border-0 shadow-sm">
                        <h6 class="text-primary mb-2">
                          <i class="bi bi-eye me-2"></i>Право на достъп
                        </h6>
                        <p class="small mb-0">
                          Можете да поискате копие от личните данни, които обработваме за Вас.
                        </p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card rights-card p-3 border-0 shadow-sm">
                        <h6 class="text-primary mb-2">
                          <i class="bi bi-pencil me-2"></i>Право на корекция
                        </h6>
                        <p class="small mb-0">
                          Можете да поискате корекция на неточни или непълни данни.
                        </p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card rights-card p-3 border-0 shadow-sm">
                        <h6 class="text-primary mb-2">
                          <i class="bi bi-trash me-2"></i>Право на изтриване
                        </h6>
                        <p class="small mb-0">
                          „Право да бъдеш забравен“ – можете да поискате изтриване на данните си.
                        </p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card rights-card p-3 border-0 shadow-sm">
                        <h6 class="text-primary mb-2">
                          <i class="bi bi-pause-circle me-2"></i>Право на ограничаване
                        </h6>
                        <p class="small mb-0">
                          Можете да поискате ограничаване на обработката в определени случаи.
                        </p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card rights-card p-3 border-0 shadow-sm">
                        <h6 class="text-primary mb-2">
                          <i class="bi bi-download me-2"></i>Право на преносимост
                        </h6>
                        <p class="small mb-0">
                          Можете да получите данните си в структуриран формат за прехвърляне.
                        </p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card rights-card p-3 border-0 shadow-sm">
                        <h6 class="text-primary mb-2">
                          <i class="bi bi-x-circle me-2"></i>Право на възражение
                        </h6>
                        <p class="small mb-0">
                          Можете да възразите срещу обработката на базата на легитимен интерес.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3>9.1. Как да упражните правата си</h3>
                  <p>
                    За да упражните което и да е от Вашите права, изпратете писмено искане до:
                  </p>
                  <ul>
                    <li>Имейл: <a href="mailto:dpo@metalcutting-hub.bg">dpo@metalcutting-hub.bg</a></li>
                    <li>Чрез настройките на Вашия профил в Платформата</li>
                  </ul>
                  <p>
                    Ще отговорим на Вашето искане в рамките на <strong>30 дни</strong>. Може да поискаме
                    допълнителна информация за потвърждение на Вашата идентичност.
                  </p>

                  <h3>9.2. Право на жалба</h3>
                  <p>
                    Ако смятате, че обработката на Вашите данни нарушава GDPR, имате право да подадете
                    жалба до Комисията за защита на личните данни (КЗЛД):
                  </p>
                  <div class="highlight-box info">
                    <strong>Комисия за защита на личните данни</strong><br>
                    Адрес: гр. София, бул. „Витоша" № 2<br>
                    Уебсайт: <a href="https://www.cpdp.bg" target="_blank" rel="noopener">www.cpdp.bg</a>
                  </div>
                </div>

                <!-- Section 10: Cookies -->
                <div id="section-10" class="mb-5">
                  <h2><i class="bi bi-cookie me-2"></i>10. Бисквитки</h2>
                  <p>
                    Използваме бисквитки и подобни технологии за подобряване на Вашето потребителско изживяване.
                    Бисквитките са малки текстови файлове, които се съхраняват на Вашето устройство.
                  </p>

                  <h3>10.1. Видове бисквитки</h3>
                  <div class="table-responsive">
                    <table class="table table-bordered cookie-table">
                      <thead>
                        <tr>
                          <th>Тип</th>
                          <th>Цел</th>
                          <th>Срок</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Сесийни</strong></td>
                          <td>Необходими за функционирането на Платформата (вход, навигация)</td>
                          <td>До затваряне на браузъра</td>
                        </tr>
                        <tr>
                          <td><strong>Предпочитания</strong></td>
                          <td>Запаметяване на Вашите настройки (език, известия)</td>
                          <td>1 година</td>
                        </tr>
                        <tr>
                          <td><strong>Аналитични</strong></td>
                          <td>Събиране на статистически данни за използването</td>
                          <td>2 години</td>
                        </tr>
                        <tr>
                          <td><strong>Маркетингови</strong></td>
                          <td>Персонализирана реклама (само при съгласие)</td>
                          <td>90 дни</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3>10.2. Управление на бисквитките</h3>
                  <p>
                    Можете да управлявате бисквитките чрез настройките на Вашия браузър. Забраната на
                    определени бисквитки може да повлияе на функционалността на Платформата.
                  </p>
                  <p>
                    При първо посещение на Платформата ще бъдете помолени да дадете съгласие за
                    използването на бисквитки, с изключение на задължителните.
                  </p>
                </div>

                <!-- Section 11: Security -->
                <div id="section-11" class="mb-5">
                  <h2><i class="bi bi-lock-fill me-2"></i>11. Сигурност на данните</h2>
                  <p>
                    Прилагаме подходящи технически и организационни мерки за защита на Вашите данни:
                  </p>

                  <h3>11.1. Технически мерки</h3>
                  <ul>
                    <li><strong>TLS/SSL шифроване</strong> – всички комуникации са криптирани</li>
                    <li><strong>Хеширане на пароли</strong> – паролите се съхраняват в хеширан вид</li>
                    <li><strong>Защита от инжектиране</strong> – валидация на всички входни данни</li>
                    <li><strong>Редовни архиви</strong> – сигурно архивиране на данните</li>
                    <li><strong>Мониторинг</strong> – постоянно наблюдение за заплахи</li>
                  </ul>

                  <h3>11.2. Организационни мерки</h3>
                  <ul>
                    <li>Ограничен достъп до лични данни на принципа „нуждаеш ли се“</li>
                    <li>Обучение на персонала за защита на данните</li>
                    <li>Договори за поверителност с доставчиците</li>
                    <li>Редовни прегледи на практиките за сигурност</li>
                  </ul>

                  <div class="highlight-box">
                    <strong>Вашата отговорност:</strong> Препоръчваме да използвате силни пароли,
                    да не споделяте данните за вход и да ни уведомявате незабавно при съмнение за
                    неоторизиран достъп.
                  </div>
                </div>

                <!-- Section 12: Minors -->
                <div id="section-12" class="mb-5">
                  <h2><i class="bi bi-person-exclamation me-2"></i>12. Непълнолетни лица</h2>
                  <p>
                    Платформата не е предназначена за лица под 18 години. Не събираме нарочно лични данни
                    от непълнолетни без съгласието на родител или настойник.
                  </p>

                  <div class="highlight-box danger">
                    <strong>Важно:</strong> Ако станем наясно, че сме събрали лични данни от лице под 18 години
                    без родителско съгласие, ще предприемем стъпки за изтриване на тези данни.
                  </p>
                  </div>

                  <p>
                    Ако сте родител или настойник и смятате, че Вашето дете е предоставило лични данни на
                    Платформата, моля, свържете се с нас на <a href="mailto:dpo@metalcutting-hub.bg">dpo@metalcutting-hub.bg</a>.
                  </p>
                </div>

                <!-- Section 13: Changes -->
                <div id="section-13" class="mb-5">
                  <h2><i class="bi bi-arrow-repeat me-2"></i>13. Промени в политиката</h2>
                  <p>
                    Може да обновяваме тази Политика периодично. Всички промени ще бъдат публикувани на
                    тази страница с актуализирана дата на влизане в сила.
                  </p>

                  <h3>13.1. Уведомление за промени</h3>
                  <p>При съществени промени ще:</p>
                  <ul>
                    <li>Публикуваме новата версия на тази страница</li>
                    <li>Изпратим имейл известие до регистрираните потребители</li>
                    <li>Покажем банер в Платформата</li>
                  </ul>

                  <h3>13.2. История на версиите</h3>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Версия</th>
                          <th>Дата</th>
                          <th>Промени</th>
th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1.0</td>
                          <td>24 февруари 2026</td>
                          <td>Първоначална версия</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Section 14: Contact -->
                <div id="section-14" class="mb-4">
                  <h2><i class="bi bi-envelope me-2"></i>14. Контакти</h2>
                  <p>
                    За въпроси относно тази Политика или обработката на Вашите лични данни,
                    можете да се свържете с нас:
                  </p>

                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="card contact-card h-100 border-0">
                        <div class="card-body">
                          <h5 class="card-title">
                            <i class="bi bi-shield-lock me-2 text-primary"></i>Служител по защита на данните
                          </h5>
                          <p class="card-text">
                            <strong>Имейл:</strong><br>
                            <a href="mailto:dpo@metalcutting-hub.bg">dpo@metalcutting-hub.bg</a><br><br>
                            <strong>Телефон:</strong><br>
                            +359 2 123 4567
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card contact-card h-100 border-0">
                        <div class="card-body">
                          <h5 class="card-title">
                            <i class="bi bi-headset me-2 text-primary"></i>Техническа поддръжка
                          </h5>
                          <p class="card-text">
                            <strong>Имейл:</strong><br>
                            <a href="mailto:support@metalcutting-hub.bg">support@metalcutting-hub.bg</a><br><br>
                            <strong>Работно време:</strong><br>
                            Пон-Пет: 09:00 - 18:00
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer Note -->
                <div class="text-center mt-5 pt-4 border-top">
                  <p class="text-muted mb-2">
                    <i class="bi bi-shield-check me-1"></i>
                    Тази Политика за защита на личните данни е в сила от 24 февруари 2026 г.
                  </p>
                  <p class="text-muted small mb-0">
                    <a href="/terms">Общи условия</a> |
                    <a href="/about">За нас</a> |
                    <a href="/help">Помощ</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  attachEventListeners() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          // Account for sticky header
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update active state in TOC
          document.querySelectorAll('.toc-card .list-group-item').forEach(item => {
            item.classList.remove('active');
          });
          anchor.classList.add('active');
        }
      });
    });

    // Highlight active section on scroll
    const sections = document.querySelectorAll('[id^="section-"]');
    const tocLinks = document.querySelectorAll('.toc-card .list-group-item');

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default PrivacyPage;
