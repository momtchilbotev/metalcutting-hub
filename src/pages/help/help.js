import './help.css';

export class HelpPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.activeCategory = params.category || 'all';
  }

  async render() {
    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
  }

  getTemplate() {
    return `
      <!-- Hero Section -->
      <section class="help-hero text-white py-5">
        <div class="container py-4 position-relative">
          <div class="row">
            <div class="col-lg-8 mx-auto text-center">
              <h1 class="display-4 fw-bold mb-3">
                <i class="bi bi-question-circle me-2"></i>
                Помощен център
              </h1>
              <p class="lead mb-4">
                Намерете отговори на вашите въпроси за Metalcutting Hub.
                Как да купувате, продавате и използвате платформата безопасно.
              </p>

              <!-- Search Box -->
              <div class="help-search-box">
                <div class="input-group">
                  <input type="text" class="form-control" id="help-search-input"
                    placeholder="Търсете в помощния център...">
                  <button class="btn btn-light" type="button" id="help-search-btn">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
              </div>

              <!-- Popular Topics -->
              <div class="mt-4">
                <span class="text-white-50 me-2">Популярни теми:</span>
                <a href="#buying-faq" class="popular-topic">Как да купя</a>
                <a href="#selling-faq" class="popular-topic">Как да продавам</a>
                <a href="#safety-faq" class="popular-topic">Безопасност</a>
                <a href="#contact" class="popular-topic">Свържете се с нас</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Links Section -->
      <section class="py-4 border-bottom">
        <div class="container">
          <div class="row g-3">
            <div class="col-6 col-md-3">
              <a href="/listings/create" class="quick-link-item">
                <i class="bi bi-plus-circle"></i>
                <div>
                  <strong>Създайте обява</strong>
                  <small class="d-block text-muted">Продайте инструменти</small>
                </div>
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a href="/listings" class="quick-link-item">
                <i class="bi bi-search"></i>
                <div>
                  <strong>Търсете обяви</strong>
                  <small class="d-block text-muted">Намерете оборудване</small>
                </div>
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a href="/register" class="quick-link-item">
                <i class="bi bi-person-plus"></i>
                <div>
                  <strong>Регистрация</strong>
                  <small class="d-block text-muted">Създайте акаунт</small>
                </div>
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a href="#contact" class="quick-link-item">
                <i class="bi bi-chat-dots"></i>
                <div>
                  <strong>Поддръжка</strong>
                  <small class="d-block text-muted">Свържете се с нас</small>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="py-5">
        <div class="container">
          <h2 class="text-center mb-4">
            <i class="bi bi-grid-fill text-primary me-2"></i>
            Категории помощ
          </h2>
          <div class="row g-4">
            <div class="col-md-6 col-lg-3">
              <div class="card help-category-card buying h-100" data-category="buying">
                <div class="card-body text-center p-4">
                  <div class="icon-wrapper">
                    <i class="bi bi-cart-check"></i>
                  </div>
                  <h5 class="card-title">Купуване</h5>
                  <p class="card-text text-muted small">
                    Как да намерите и закупите инструменти и оборудване безопасно.
                  </p>
                  <span class="badge bg-success">15 статии</span>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="card help-category-card selling h-100" data-category="selling">
                <div class="card-body text-center p-4">
                  <div class="icon-wrapper">
                    <i class="bi bi-tag-fill"></i>
                  </div>
                  <h5 class="card-title">Продаване</h5>
                  <p class="card-text text-muted small">
                    Създайте ефективни обяви и продавайте успешно.
                  </p>
                  <span class="badge bg-primary">12 статии</span>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="card help-category-card account h-100" data-category="account">
                <div class="card-body text-center p-4">
                  <div class="icon-wrapper">
                    <i class="bi bi-person-circle"></i>
                  </div>
                  <h5 class="card-title">Акаунт</h5>
                  <p class="card-text text-muted small">
                    Управление на профил, настройки и сигурност.
                  </p>
                  <span class="badge bg-warning text-dark">8 статии</span>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="card help-category-card safety h-100" data-category="safety">
                <div class="card-body text-center p-4">
                  <div class="icon-wrapper">
                    <i class="bi bi-shield-check"></i>
                  </div>
                  <h5 class="card-title">Безопасност</h5>
                  <p class="card-text text-muted small">
                    Съвети за безопасна търговия и защита от измами.
                  </p>
                  <span class="badge bg-danger">10 статии</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section - Buying -->
      <section class="py-5 bg-light" id="buying-faq">
        <div class="container">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <h2 class="section-title">
                <i class="bi bi-cart-check text-success me-2"></i>
                Често задавани въпроси - Купуване
              </h2>

              <div class="accordion faq-accordion" id="buyingFaq">
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#buying-q1">
                      Как да намеря инструмент или оборудване?
                    </button>
                  </h2>
                  <div id="buying-q1" class="accordion-collapse collapse show" data-bs-parent="#buyingFaq">
                    <div class="accordion-body">
                      <ol>
                        <li>Използвайте <strong>полето за търсене</strong> в горната част на страницата</li>
                        <li>Въведете ключова дума (напр. "фреза", "стружка", "PCD")</li>
                        <li>Използвайте <strong>филтрите</strong> за стесняване на резултатите по категория, цена, местоположение</li>
                        <li>Кликнете върху обява за преглед на детайли</li>
                      </ol>
                      <div class="tip-card success mt-3">
                        <strong><i class="bi bi-lightbulb me-2"></i>Съвет:</strong> Запазете интересни обяви в "Наблюдавани" за бърз достъп по-късно.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#buying-q2">
                      Как да се свържа с продавача?
                    </button>
                  </h2>
                  <div id="buying-q2" class="accordion-collapse collapse" data-bs-parent="#buyingFaq">
                    <div class="accordion-body">
                      <p>На всяка страница с обява има бутон <strong>"Свържете се с продавача"</strong>:</p>
                      <ul>
                        <li><strong>Чрез съобщения</strong> - изпратете лично съобщение през платформата</li>
                        <li><strong>По телефон</strong> - ако продавачът е предоставил телефонен номер</li>
                        <li><strong>По имейл</strong> - ако е посочен имейл адрес</li>
                      </ul>
                      <div class="tip-card warning mt-3">
                        <strong><i class="bi bi-exclamation-triangle me-2"></i>Важно:</strong> Никога не споделяйте лични финансови данни в чата.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#buying-q3">
                      Как да проверя надеждността на продавача?
                    </button>
                  </h2>
                  <div id="buying-q3" class="accordion-collapse collapse" data-bs-parent="#buyingFaq">
                    <div class="accordion-body">
                      <p>Преди да закупите, проверете:</p>
                      <ul>
                        <li><strong>Рейтинг на продавача</strong> - вижте оценките от други купувачи</li>
                        <li><strong>Брой обяви</strong> - опитните продавачи обикновено имат повече обяви</li>
                        <li><strong>Дата на регистрация</strong> - по-дългогодишните акаунти са по-надеждни</li>
                        <li><strong>Отзиви</strong> - прочетете коментарите от предишни купувачи</li>
                        <li><strong>Верификация</strong> - проверете дали продавачът е верифициран</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#buying-q4">
                      Как работи системата за наблюдаване на обяви?
                    </button>
                  </h2>
                  <div id="buying-q4" class="accordion-collapse collapse" data-bs-parent="#buyingFaq">
                    <div class="accordion-body">
                      <p>Функцията "Наблюдавани" ви позволява да:</p>
                      <ul>
                        <li>Запазвате интересни обяви за по-късно</li>
                        <li>Получавате известия при промени в цената</li>
                        <li>Бързо сравнявате запазени обяви</li>
                      </ul>
                      <p>За да добавите обява в наблюдавани, кликнете върху сърцето <i class="bi bi-heart text-danger"></i> на страницата на обявата.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section - Selling -->
      <section class="py-5" id="selling-faq">
        <div class="container">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <h2 class="section-title">
                <i class="bi bi-tag-fill text-primary me-2"></i>
                Често задавани въпроси - Продаване
              </h2>

              <div class="accordion faq-accordion" id="sellingFaq">
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#selling-q1">
                      Как да създам ефективна обява?
                    </button>
                  </h2>
                  <div id="selling-q1" class="accordion-collapse collapse show" data-bs-parent="#sellingFaq">
                    <div class="accordion-body">
                      <p><strong>Ключови елементи на успешната обява:</strong></p>
                      <ul>
                        <li><strong>Заглавие</strong> - ясно и описателно (напр. "PCD фреза 10мм, нова")</li>
                        <li><strong>Снимки</strong> - добавете 3-5 качествени снимки от различни ъгли</li>
                        <li><strong>Описание</strong> - включете марка, модел, състояние, размери</li>
                        <li><strong>Цена</strong> - реалистична цена според пазара</li>
                        <li><strong>Категория</strong> - изберете правилната категория за по-добра видимост</li>
                      </ul>
                      <div class="tip-card success mt-3">
                        <strong><i class="bi bi-lightbulb me-2"></i>Съвет:</strong> Обявите със снимки получават до 5 пъти повече запитвания!
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#selling-q2">
                      Какви категории са достъпни?
                    </button>
                  </h2>
                  <div id="selling-q2" class="accordion-collapse collapse" data-bs-parent="#sellingFaq">
                    <div class="accordion-body">
                      <p>Metalcutting Hub предлага следните категории:</p>
                      <div class="row">
                        <div class="col-md-6">
                          <ul>
                            <li><strong>Инструменти</strong> - фрези, свредла, стругарски ножове</li>
                            <li><strong>Измервателна техника</strong> - шублери, микрометри, уреди</li>
                            <li><strong>Резервни части</strong> - за машини и оборудване</li>
                            <li><strong>Оборудване</strong> - машини, станини, конвенционални и CNC</li>
                          </ul>
                        </div>
                        <div class="col-md-6">
                          <ul>
                            <li><strong>Абразиви</strong> - шкурки, камъни, паста</li>
                            <li><strong>Охлаждащи течности</strong> - емулсии, масла</li>
                            <li><strong>Документация</strong> - каталози, упътвания</li>
                            <li><strong>Други</strong> - всичко останало</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#selling-q3">
                      Как да кача снимки на обявата?
                    </button>
                  </h2>
                  <div id="selling-q3" class="accordion-collapse collapse" data-bs-parent="#sellingFaq">
                    <div class="accordion-body">
                      <p>При създаване на обява:</p>
                      <ol>
                        <li>Кликнете в зоната за качване на снимки</li>
                        <li>Изберете снимки от вашето устройство (до 10 снимки)</li>
                        <li>Поддържани формати: JPG, PNG, WebP</li>
                        <li>Максимален размер: 5MB на снимка</li>
                      </ol>
                      <div class="tip-card mt-3">
                        <strong><i class="bi bi-camera me-2"></i>Добра практика:</strong> Снимайте при добро осветление, показвайте дефекти (ако има).
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#selling-q4">
                      Как да редактирам или изтрия обява?
                    </button>
                  </h2>
                  <div id="selling-q4" class="accordion-collapse collapse" data-bs-parent="#sellingFaq">
                    <div class="accordion-body">
                      <p>Управлявайте обявите си от <a href="/my-listings">"Моите обяви"</a>:</p>
                      <ul>
                        <li><strong>Редактиране</strong> - променете цена, описание, снимки</li>
                        <li><strong>Пускане/Спиране</strong> - активирайте или деактивирайте обява</li>
                        <li><strong>Изтриване</strong> - премахнете обявата завинаги</li>
                        <li><strong>Повдигане</strong> - върнете обява в началото на списъка</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#selling-q5">
                      Защо обявата ми е в режим на преглед?
                    </button>
                  </h2>
                  <div id="selling-q5" class="accordion-collapse collapse" data-bs-parent="#sellingFaq">
                    <div class="accordion-body">
                      <p>Всяка нова обява минава през <strong>модерация</strong> преди да бъде публикувана.</p>
                      <p>Процесът обикновено отнема до 24 часа. Обявата може да бъде отхвърлена ако:</p>
                      <ul>
                        <li>Не отговаря на категорията</li>
                        <li>Съдържа нередовни снимки</li>
                        <li>Има неясно описание</li>
                        <li>Нарушава правилата на платформата</li>
                      </ul>
                      <p>Ще получите известие с причина при отхвърляне.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section - Account -->
      <section class="py-5 bg-light" id="account-faq">
        <div class="container">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <h2 class="section-title">
                <i class="bi bi-person-circle text-warning me-2"></i>
                Често задавани въпроси - Акаунт
              </h2>

              <div class="accordion faq-accordion" id="accountFaq">
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#account-q1">
                      Как да се регистрирам?
                    </button>
                  </h2>
                  <div id="account-q1" class="accordion-collapse collapse show" data-bs-parent="#accountFaq">
                    <div class="accordion-body">
                      <p>Регистрацията е безплатна и отнема само минута:</p>
                      <ol>
                        <li>Кликнете <a href="/register">"Регистрация"</a> в горното меню</li>
                        <li>Въведете имейл адрес и парола</li>
                        <li>Попълнете вашето име</li>
                        <li>Потвърдете регистрацията чрез имейл</li>
                      </ol>
                      <div class="tip-card success mt-3">
                        <strong><i class="bi bi-lightbulb me-2"></i>Съвет:</strong> Използвайте реален имейл - ще получите важни известия там.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#account-q2">
                      Как да променя паролата си?
                    </button>
                  </h2>
                  <div id="account-q2" class="accordion-collapse collapse" data-bs-parent="#accountFaq">
                    <div class="accordion-body">
                      <ol>
                        <li>Отидете в <a href="/profile">"Моят профил"</a></li>
                        <li>Кликнете "Настройки на акаунта"</li>
                        <li>Изберете "Промяна на парола"</li>
                        <li>Въведете текущата и новата парола</li>
                      </ol>
                      <p>Ако сте забравили паролата, използвайте "Забравена парола" на страницата за вход.</p>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#account-q3">
                      Как да редактирам профила си?
                    </button>
                  </h2>
                  <div id="account-q3" class="accordion-collapse collapse" data-bs-parent="#accountFaq">
                    <div class="accordion-body">
                      <p>В <a href="/profile">"Моят профил"</a> можете да променяте:</p>
                      <ul>
                        <li>Име и фирма</li>
                        <li>Телефон за връзка</li>
                        <li>Местоположение</li>
                        <li>Профилна снимка</li>
                        <li>Описание на профила</li>
                      </ul>
                      <div class="tip-card mt-3">
                        <strong><i class="bi bi-info-circle me-2"></i>Бележка:</strong> Пълният профил повишава доверието на купувачите.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#account-q4">
                      Как да изтрия акаунта си?
                    </button>
                  </h2>
                  <div id="account-q4" class="accordion-collapse collapse" data-bs-parent="#accountFaq">
                    <div class="accordion-body">
                      <p>За да изтриете акаунта си:</p>
                      <ol>
                        <li>Отидете в "Моят профил" → "Настройки"</li>
                        <li>Изберете "Изтриване на акаунт"</li>
                        <li>Потвърдете с паролата си</li>
                      </ol>
                      <div class="tip-card danger mt-3">
                        <strong><i class="bi bi-exclamation-triangle me-2"></i>Внимание:</strong> Това действие е необратимо! Всички данни ще бъдат изтрити.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section - Safety -->
      <section class="py-5" id="safety-faq">
        <div class="container">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <h2 class="section-title">
                <i class="bi bi-shield-check text-danger me-2"></i>
                Често задавани въпроси - Безопасност
              </h2>

              <div class="accordion faq-accordion" id="safetyFaq">
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#safety-q1">
                      Как да разпозная измама?
                    </button>
                  </h2>
                  <div id="safety-q1" class="accordion-collapse collapse show" data-bs-parent="#safetyFaq">
                    <div class="accordion-body">
                      <p><strong>Червени флагове за измама:</strong></p>
                      <ul>
                        <li>Цена, която е твърде ниска (под пазарната)</li>
                        <li>Продавачът иска плащане предварително</li>
                        <li>Искане за плащане извън платформата</li>
                        <li>Липса на реални снимки</li>
                        <li>Натиск за бърза сделка</li>
                        <li>Граматически грешки в комуникацията</li>
                      </ul>
                      <div class="tip-card danger mt-3">
                        <strong><i class="bi bi-exclamation-triangle me-2"></i>Важно:</strong> Ако нещо изглежда твърде хубаво, за да е истина - вероятно е!
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#safety-q2">
                      Какви са най-добрите практики за безопасна сделка?
                    </button>
                  </h2>
                  <div id="safety-q2" class="accordion-collapse collapse" data-bs-parent="#safetyFaq">
                    <div class="accordion-body">
                      <p><strong>Препоръки за безопасни сделки:</strong></p>
                      <ol>
                        <li><strong>Лична среща</strong> - разгледайте стоката преди плащане</li>
                        <li><strong>Публично място</strong> - уговорете среща на оживено място</li>
                        <li><strong>Проверка</strong> - тествайте оборудването ако е възможно</li>
                        <li><strong>Документиране</strong> - запазете кореспонденцията</li>
                        <li><strong>Плащане</strong> - в брой при получаване или банков превод след преглед</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#safety-q3">
                      Как да докладвам подозрителна обява?
                    </button>
                  </h2>
                  <div id="safety-q3" class="accordion-collapse collapse" data-bs-parent="#safetyFaq">
                    <div class="accordion-body">
                      <p>Ако забележите подозрителна обява или поведение:</p>
                      <ol>
                        <li>Кликнете върху бутона "Докладвай" на страницата на обявата</li>
                        <li>Изберете причина за доклада</li>
                        <li>Добавете описание ако е необходимо</li>
                      </ol>
                      <p>Нашият екип ще прегледа доклада в рамките на 24 часа.</p>
                      <div class="tip-card success mt-3">
                        <strong><i class="bi bi-hand-thumbs-up me-2"></i>Благодарим ви!</strong> Докладите помагат за по-безопасна общност.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#safety-q4">
                      Какви данни не трябва да споделям?
                    </button>
                  </h2>
                  <div id="safety-q4" class="accordion-collapse collapse" data-bs-parent="#safetyFaq">
                    <div class="accordion-body">
                      <p><strong>Никога не споделяйте:</strong></p>
                      <ul>
                        <li>Пароли и кодове за достъп</li>
                        <li>Номера на банкови карти</li>
                        <li>ПИН кодове</li>
                        <li>Лични документи (ЕГН, ID карта)</li>
                        <li>Кодове за еднократна употреба (OTP)</li>
                      </ul>
                      <div class="tip-card warning mt-3">
                        <strong><i class="bi bi-shield-exclamation me-2"></i>Запомнете:</strong> Metalcutting Hub никога няма да ви поиска парола или банкови данни.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#safety-q5">
                      Какво да направя ако съм жертва на измама?
                    </button>
                  </h2>
                  <div id="safety-q5" class="accordion-collapse collapse" data-bs-parent="#safetyFaq">
                    <div class="accordion-body">
                      <p>Ако станете жертва на измама:</p>
                      <ol>
                        <li><strong>Докладвайте</strong> - използвайте функцията за доклад в платформата</li>
                        <li><strong>Свържете се с нас</strong> - на support@metalcutting-hub.bg</li>
                        <li><strong>Полиция</strong> - подайте сигнал при значителни загуби</li>
                        <li><strong>Банка</strong> - ако сте направили банков превод, свържете се с банката</li>
                        <li><strong>Доказателства</strong> - запазете всички съобщения и доказателства</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="py-5 bg-primary text-white" id="contact">
        <div class="container">
          <div class="text-center mb-5">
            <h2 class="mb-3">
              <i class="bi bi-headset me-2"></i>
              Не намерихте отговор?
            </h2>
            <p class="lead">Нашият екип е тук, за да ви помогне!</p>
          </div>

          <div class="row g-4 justify-content-center">
            <div class="col-md-4">
              <div class="contact-card card">
                <div class="card-body">
                  <i class="bi bi-envelope-fill"></i>
                  <h5>Имейл</h5>
                  <p class="text-muted mb-0">support@metalcutting-hub.bg</p>
                  <small class="text-muted">Отговор в рамките на 24 часа</small>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="contact-card card">
                <div class="card-body">
                  <i class="bi bi-telephone-fill"></i>
                  <h5>Телефон</h5>
                  <p class="text-muted mb-0">+359 2 123 4567</p>
                  <small class="text-muted">Пон-Пет: 9:00 - 18:00</small>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="contact-card card">
                <div class="card-body">
                  <i class="bi bi-geo-alt-fill"></i>
                  <h5>Адрес</h5>
                  <p class="text-muted mb-0">София, България</p>
                  <small class="text-muted">По предварителна уговорка</small>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center mt-5">
            <a href="/listings" class="btn btn-light btn-lg me-2">
              <i class="bi bi-search me-2"></i>Разгледайте обявите
            </a>
            <a href="/about" class="btn btn-outline-light btn-lg">
              <i class="bi bi-info-circle me-2"></i>За нас
            </a>
          </div>
        </div>
      </section>
    `;
  }

  attachEventListeners() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });

    // Help search functionality
    const searchInput = document.getElementById('help-search-input');
    const searchBtn = document.getElementById('help-search-btn');

    const performSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) return;

      // Simple search: highlight matching accordion items
      const accordionItems = document.querySelectorAll('.accordion-item');
      let found = false;

      accordionItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        const button = item.querySelector('.accordion-button');

        if (text.includes(query)) {
          item.style.display = '';
          if (!found) {
            // Open first matching item
            const collapseId = button?.getAttribute('data-bs-target');
            if (collapseId) {
              const collapse = document.querySelector(collapseId);
              if (collapse && !collapse.classList.contains('show')) {
                button?.click();
              }
            }
            found = true;
          }
        } else {
          item.style.display = 'none';
        }
      });

      // Show feedback if no results
      if (!found) {
        window.showToast('Не са намерени резултати за: ' + query, 'info');
      } else {
        window.showToast('Намерени резултати за: ' + query, 'success');
      }
    };

    if (searchBtn) {
      searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performSearch();
        }
      });
    }

    // Category card click handlers
    const categoryCards = document.querySelectorAll('.help-category-card');
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        const targetId = `#${category}-faq`;
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
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

export default HelpPage;
