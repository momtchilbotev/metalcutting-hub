import './terms.css';

export class TermsPage {
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
      <section class="terms-hero text-white py-5">
        <div class="container py-4 position-relative">
          <div class="row align-items-center">
            <div class="col-lg-8 mx-auto text-center">
              <h1 class="display-4 fw-bold mb-3">
                <i class="bi bi-file-earmark-text me-2"></i>
                Общи условия
              </h1>
              <p class="lead mb-3">
                Общи условия за използване на платформата Metalcutting Hub
              </p>
              <div class="last-updated">
                <i class="bi bi-calendar3"></i>
                <span>Последна актуализация: 24 февруари 2026 г.</span>
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
                    <a href="#section-1" class="list-group-item list-group-item-action">1. Приемане на условията</a>
                    <a href="#section-2" class="list-group-item list-group-item-action">2. Дефиниции</a>
                    <a href="#section-3" class="list-group-item list-group-item-action">3. Регистрация и акаунт</a>
                    <a href="#section-4" class="list-group-item list-group-item-action">4. Услуги на платформата</a>
                    <a href="#section-5" class="list-group-item list-group-item-action">5. Задължения на потребителите</a>
                    <a href="#section-6" class="list-group-item list-group-item-action">6. Правила за обявите</a>
                    <a href="#section-7" class="list-group-item list-group-item-action">7. Транзакции и плащания</a>
                    <a href="#section-8" class="list-group-item list-group-item-action">8. Интелектуална собственост</a>
                    <a href="#section-9" class="list-group-item list-group-item-action">9. Защита на личните данни</a>
                    <a href="#section-10" class="list-group-item list-group-item-action">10. Ограничение на отговорността</a>
                    <a href="#section-11" class="list-group-item list-group-item-action">11. Отговорности и гаранции</a>
                    <a href="#section-12" class="list-group-item list-group-item-action">12. Прекратяване</a>
                    <a href="#section-13" class="list-group-item list-group-item-action">13. Разрешаване на спорове</a>
                    <a href="#section-14" class="list-group-item list-group-item-action">14. Промени в условията</a>
                    <a href="#section-15" class="list-group-item list-group-item-action">15. Контакти</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Terms Content -->
            <div class="col-lg-9">
              <div class="terms-content">
                <!-- Quick Info Cards -->
                <div class="row g-3 mb-5 no-print">
                  <div class="col-md-4">
                    <div class="card quick-link-card h-100 text-center p-3">
                      <i class="bi bi-shield-check mb-2"></i>
                      <h6>Сигурност</h6>
                      <small class="text-muted">Вашите данни са защитени</small>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card quick-link-card h-100 text-center p-3">
                      <i class="bi bi-people mb-2"></i>
                      <h6>B2B Платформа</h6>
                      <small class="text-muted">За бизнес потребители</small>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card quick-link-card h-100 text-center p-3">
                      <i class="bi bi-globe mb-2"></i>
                      <h6>България</h6>
                      <small class="text-muted">По българско законодателство</small>
                    </div>
                  </div>
                </div>

                <!-- Section 1: Acceptance -->
                <div id="section-1" class="mb-5">
                  <h2><i class="bi bi-check-circle me-2"></i>1. Приемане на условията</h2>
                  <p>
                    Чрез достъпа или използването на платформата Metalcutting Hub („Платформата“) Вие се съгласявате
                    да бъдете обвързани от настоящите Общи условия („Условията“). Ако не сте съгласни с която и да е
                    част от тези Условия, моля, не използвайте Платформата.
                  </p>
                  <div class="highlight-box">
                    <strong>Важно:</strong> Използването на Платформата след промени в Условията означава,
                    че приемате променените Условия. Препоръчваме редовно да преглеждате тази страница.
                  </div>
                  <p>
                    Metalcutting Hub е бизнес-към-бизнес (B2B) платформа за търговия с инструменти, резервни части
                    и оборудване за металообработване. Платформата действа като посредник между продавачи и купувачи
                    и не е страна в сделките между тях.
                  </p>
                </div>

                <!-- Section 2: Definitions -->
                <div id="section-2" class="mb-5">
                  <h2><i class="bi bi-book me-2"></i>2. Дефиниции</h2>
                  <dl class="definition-list">
                    <dt>„Платформа“</dt>
                    <dd>Уебсайтовете, мобилните приложения и други онлайн услуги, предоставяни от Metalcutting Hub.</dd>

                    <dt>„Потребител“</dt>
                    <dd>Всяко физическо или юридическо лице, което е регистрирано и използва Платформата.</dd>

                    <dt>„Продавач“</dt>
                    <dd>Потребител, който публикува обяви за продажба на стоки или услуги.</dd>

                    <dt>„Купувач“</dt>
                    <dd>Потребител, който се интересува от закупуване на стоки или услуги чрез Платформата.</dd>

                    <dt>„Обява“</dt>
                    <dd>Информация за стока или услуга, публикувана от Продавач на Платформата.</dd>

                    <dt>„Съдържание“</dt>
                    <dd>Всички текстове, изображения, видео, данни и друга информация, качени на Платформата.</dd>

                    <dt>„Администратор“</dt>
                    <dd>Лицето, управляващо Платформата – Metalcutting Hub.</dd>
                  </dl>
                </div>

                <!-- Section 3: Registration -->
                <div id="section-3" class="mb-5">
                  <h2><i class="bi bi-person-plus me-2"></i>3. Регистрация и акаунт</h2>

                  <h3>3.1. Изисквания за регистрация</h3>
                  <p>За да използвате Платформата, трябва:</p>
                  <ul>
                    <li>Да сте навършили 18 години</li>
                    <li>Да имате правоспособност да сключвате правни договори съгласно приложимото законодателство</li>
                    <li>Да предоставите точна, актуална и пълна информация при регистрацията</li>
                    <li>Да поддържате информацията в профила си актуална</li>
                  </ul>

                  <h3>3.2. Сигурност на акаунта</h3>
                  <p>
                    Вие носите пълна отговорност за поддържането на поверителността на Вашите данни за вход
                    (потребителско име и парола) и за всички дейности, извършвани чрез Вашия акаунт.
                    При съмнение за неоторизиран достъп трябва незабавно да уведомите Администратора.
                  </p>

                  <div class="highlight-box warning">
                    <strong>Внимание:</strong> Споделянето на акаунт с други лица е забранено.
                    Вие носите отговорност за всички действия, извършени чрез Вашия акаунт.
                  </div>

                  <h3>3.3. Верификация</h3>
                  <p>
                    Администраторът има право да изисква допълнителна верификация на идентичността
                    на Потребителите, включително представяне на документи за регистрация на фирма,
                    удостоверение за данъчна регистрация и други.
                  </p>
                </div>

                <!-- Section 4: Platform Services -->
                <div id="section-4" class="mb-5">
                  <h2><i class="bi bi-gear me-2"></i>4. Услуги на платформата</h2>

                  <h3>4.1. Предоставяни услуги</h3>
                  <p>Metalcutting Hub предоставя следните услуги:</p>
                  <ul>
                    <li>Публикуване и търсене на обяви за стоки и услуги</li>
                    <li>Система за комуникация между Продавачи и Купувачи</li>
                    <li>Управление на профили и списъци с наблюдавани обяви</li>
                    <li>Административни инструменти за управление на обяви и потребители</li>
                    <li>Модерация на съдържанието</li>
                  </ul>

                  <h3>4.2. Роля на платформата</h3>
                  <div class="highlight-box">
                    <p class="mb-0">
                      Metalcutting Hub действа <strong>единствено като посредник</strong> между Продавачи и Купувачи.
                      Платформата не е страна в сделките и не притежава, не продава и не доставя стоките,
                      обявени от Продавачите. Всяка сделка се сключва директно между Продавача и Купувача.
                    </p>
                  </div>

                  <h3>4.3. Ограничения на услугите</h3>
                  <p>Администраторът си запазва правото да:</p>
                  <ul>
                    <li>Ограничи, прекъсне или спре достъпа до Платформата по всяко време</li>
                    <li>Променя функционалностите на Платформата без предварително уведомление</li>
                    <li>Премахва съдържание, което нарушава тези Условия</li>
                  </ul>
                </div>

                <!-- Section 5: User Obligations -->
                <div id="section-5" class="mb-5">
                  <h2><i class="bi bi-list-check me-2"></i>5. Задължения на потребителите</h2>

                  <h3>5.1. Общи задължения</h3>
                  <p>Като Потребител на Платформата се задължавате да:</p>
                  <ul>
                    <li>Спазвате приложимото законодателство на Република България и Европейския съюз</li>
                    <li>Предоставяте точна и истинска информация в обявите си</li>
                    <li>Не използвате Платформата за незаконни цели</li>
                    <li>Да не нарушавате правата на трети лица</li>
                    <li>Да съдействувате с Администратора при разследване на нарушения</li>
                  </ul>

                  <h3>5.2. Забранени дейности</h3>
                  <p>Забранено е да:</p>
                  <ul>
                    <li>Публикувате невярна, подвеждаща или измамна информация</li>
                    <li>Продавате стоки, които са незаконни, откраднати или с нарушени права на интелектуална собственост</li>
                    <li>Използвате автоматизирани средства (ботове, скриптове) за достъп до Платформата</li>
                    <li>Събирате лични данни на други потребители без тяхното съгласие</li>
                    <li>Публикувате спам, вируси или зловреден софтуер</li>
                    <li>Възпрепятствате работата на Платформата</li>
                    <li>Създавате фалшиви акаунти или използвате чужди акаунти</li>
                  </ul>

                  <div class="highlight-box danger">
                    <strong>Нарушения:</strong> При констатиране на нарушения Администраторът може да
                    ограничи достъпа до Платформата, да премахне обяви или да прекрати акаунта
                    без възстановяване на такси или обезщетение.
                  </div>
                </div>

                <!-- Section 6: Listing Rules -->
                <div id="section-6" class="mb-5">
                  <h2><i class="bi bi-megaphone me-2"></i>6. Правила за обявите</h2>

                  <h3>6.1. Съдържание на обявите</h3>
                  <p>Всяка обява трябва да съдържа:</p>
                  <ul>
                    <li>Точно описание на стоката или услугата</li>
                    <li>Реални изображения на предлаганата стока</li>
                    <li>Коректна цена и условия за доставка</li>
                    <li>Информация за състоянието на стоката (нова, употребявана, реновирана)</li>
                    <li>Технически характеристики, когато е приложимо</li>
                  </ul>

                  <h3>6.2. Забранени стоки</h3>
                  <p>Забранено е публикуването на обяви за:</p>
                  <ul>
                    <li>Оръжия, боеприпаси и взривни вещества</li>
                    <li>Наркотични вещества и прекурсори</li>
                    <li>Контрафактни стоки</li>
                    <li>Стоки с нарушени права на интелектуална собственост</li>
                    <li>Опасни материали без съответните разрешителни</li>
                    <li>Стоки, чиято продажба е забранена от законодателството</li>
                  </ul>

                  <h3>6.3. Модерация</h3>
                  <p>
                    Всички обяви подлежат на модерация от Администратора. Обяви, които не отговарят
                    на правилата, могат да бъдат редактирани, скрити или премахнати без предварително уведомление.
                  </p>
                </div>

                <!-- Section 7: Transactions -->
                <div id="section-7" class="mb-5">
                  <h2><i class="bi bi-credit-card me-2"></i>7. Транзакции и плащания</h2>

                  <h3>7.1. Сключване на сделки</h3>
                  <p>
                    Сделките се сключват директно между Продавача и Купувача. Платформата предоставя
    средства за комуникация и договаряне, но не участва в процеса на договаряне, плащане или доставка.
                  </p>

                  <h3>7.2. Отговорност за транзакции</h3>
                  <div class="highlight-box">
                    <p>
                      Metalcutting Hub <strong>не носи отговорност</strong> за:
                    </p>
                    <ul class="mb-0">
                      <li>Качеството, безопасността и съответствието на стоките</li>
                      <li>Изпълнението на сделките между Продавачи и Купувачи</li>
                      <li>Плащанията, извършени извън Платформата</li>
                      <li>Доставката на стоките</li>
                      <li>Спорове между Продавачи и Купувачи</li>
                    </ul>
                  </div>

                  <h3>7.3. Съвети за безопасност</h3>
                  <p>Препоръчваме на Потребителите:</p>
                  <ul>
                    <li>Да проверяват репутацията на контрагента преди сделка</li>
                    <li>Да използват защитени методи за плащане</li>
                    <li>Да документират комуникацията и споразуменията</li>
                    <li>Да бъдат внимателни при предложения със значително по-ниски цени</li>
                  </ul>
                </div>

                <!-- Section 8: Intellectual Property -->
                <div id="section-8" class="mb-5">
                  <h2><i class="bi bi-lightbulb me-2"></i>8. Интелектуална собственост</h2>

                  <h3>8.1. Права на Платформата</h3>
                  <p>
                    Всички права върху Платформата, включително дизайн, логота, текстове, софтуер
                    и бази данни, са собственост на Metalcutting Hub или са лицензирани от трети лица.
                    Забранено е копирането, разпространението или модифицирането на съдържанието
                    на Платформата без предварително писмено съгласие.
                  </p>

                  <h3>8.2. Лиценз за потребителско съдържание</h3>
                  <p>
                    Като Потребител Вие запазвате правата върху съдържанието, което публикувате.
                    Чрез качване на съдържание Вие предоставяте на Metalcutting Hub непрякаем,
                    безплатен лиценз за използване, възпроизвеждане, показване и разпространение
                    на това съдържание в рамките на Платформата.
                  </p>

                  <h3>8.3. Нарушения на права</h3>
                  <p>
                    Ако считате, че Вашите права на интелектуална собственост са нарушени чрез
                    съдържание на Платформата, моля, свържете се с нас на посочения имейл адрес
                    с описание на нарушението.
                  </p>
                </div>

                <!-- Section 9: Privacy -->
                <div id="section-9" class="mb-5">
                  <h2><i class="bi bi-shield-lock me-2"></i>9. Защита на личните данни</h2>
                  <p>
                    Обработката на лични данни се извършва съгласно <strong>Политиката за защита на личните данни</strong>
                    на Metalcutting Hub, която е неразделна част от тези Условия.
                  </p>

                  <h3>9.1. Събиране на данни</h3>
                  <p>Събираме следните категории данни:</p>
                  <ul>
                    <li>Данни за регистрация (име, имейл, телефон, фирмена информация)</li>
                    <li>Данни за използване на Платформата</li>
                    <li>Данни от комуникация между потребители</li>
                    <li>Технически данни (IP адрес, устройство, браузър)</li>
                  </ul>

                  <h3>9.2. Права на субектите на данни</h3>
                  <p>Имате право на:</p>
                  <ul>
                    <li>Достъп до Вашите лични данни</li>
                    <li>Корекция на неточни данни</li>
                    <li>Изтриване на данните („право да бъдеш забравен“)</li>
                    <li>Ограничаване на обработката</li>
                    <li>Преносимост на данните</li>
                    <li>Возражение срещу обработката</li>
                  </ul>

                  <p>
                    За повече информация, моля, прегледайте нашата
                    <a href="/privacy">Политика за защита на личните данни</a>.
                  </p>
                </div>

                <!-- Section 10: Liability -->
                <div id="section-10" class="mb-5">
                  <h2><i class="bi bi-exclamation-triangle me-2"></i>10. Ограничение на отговорността</h2>

                  <h3>10.1. Ограничения</h3>
                  <p>
                    Metalcutting Hub не носи отговорност за:
                  </p>
                  <ul>
                    <li>Щети, произтичащи от използването или невъзможността за използване на Платформата</li>
                    <li>Действия или бездействия на Продавачи или Купувачи</li>
                    <li>Съдържанието, публикувано от Потребителите</li>
                    <li>Прекъсвания в работата на Платформата поради обстоятелства извън наш контрол</li>
                    <li>Загуба на данни или печалба</li>
                  </ul>

                  <h3>10.2. Максимална отговорност</h3>
                  <p>
                    В случай на установена отговорност, общата сума на обезщетението от Metalcutting Hub
                    не може да надвишава сумата от такси, платени от Потребителя за последните 12 месеца,
                    или 500 лева, което е по-голямо.
                  </p>

                  <div class="highlight-box success">
                    <strong>Забележка:</strong> Тези ограничения не се прилагат за щети, причинени от
                    умишлени действия или груба небрежност от страна на Metalcutting Hub.
                  </div>
                </div>

                <!-- Section 11: Warranties -->
                <div id="section-11" class="mb-5">
                  <h2><i class="bi bi-patch-check me-2"></i>11. Отговорности и гаранции</h2>

                  <h3>11.1. Гаранции на Платформата</h3>
                  <p>
                    Metalcutting Hub полага разумни усилия за:
                  </p>
                  <ul>
                    <li>Поддържане на Платформата в работещо състояние</li>
                    <li>Защита на данните на Потребителите</li>
                    <li>Модерация на съдържанието</li>
                    <li>Осигуряване на техническа поддръжка</li>
                  </ul>

                  <h3>11.2. Отказ от гаранции</h3>
                  <p>
                    Платформата се предоставя „каквото е“ и „каквото е налично“, без каквито и да е
                    изрични или подразбиращи се гаранции за годност за определена цел, ненарушаване
                    или точност.
                  </p>

                  <h3>11.3. Индемнитет</h3>
                  <p>
                    Вие се съгласявате да обезщетите и защитите Metalcutting Hub от всякакви претенции,
                    щети, разходи и разходи за правна защита, произтичащи от Вашето използване на
                    Платформата или нарушаване на тези Условия.
                  </p>
                </div>

                <!-- Section 12: Termination -->
                <div id="section-12" class="mb-5">
                  <h2><i class="bi bi-x-circle me-2"></i>12. Прекратяване</h2>

                  <h3>12.1. От страна на Потребителя</h3>
                  <p>
                    Можете да прекратите използването на Платформата по всяко време, като изтриете
                    Вашия акаунт от настройките на профила или като се свържете с поддръжката.
                  </p>

                  <h3>12.2. От страна на Администратора</h3>
                  <p>
                    Metalcutting Hub има право да прекрати или спре Вашия акаунт при:
                  </p>
                  <ul>
                    <li>Нарушаване на тези Условия</li>
                    <li>Предоставяне на невярна информация</li>
                    <li>Незаконна дейност</li>
                    <li>Дълготрайно неактивиране на акаунта (над 24 месеца)</li>
                    <li>По всяко друго основание по преценка на Администратора</li>
                  </ul>

                  <h3>12.3. Последици от прекратяването</h3>
                  <p>
                    При прекратяване на акаунта:
                  </p>
                  <ul>
                    <li>Всички активни обяви ще бъдат премахнати</li>
                    <li>Достъпът до съобщения и история ще бъде ограничен</li>
                    <li>Няма възстановяване на платени такси</li>
                  </ul>
                </div>

                <!-- Section 13: Disputes -->
                <div id="section-13" class="mb-5">
                  <h2><i class="bi bi-balance-scale me-2"></i>13. Разрешаване на спорове</h2>

                  <h3>13.1. Приложимо право</h3>
                  <p>
                    Тези Условия се регулират от законодателството на <strong>Република България</strong>
                    и приложимото право на Европейския съюз.
                  </p>

                  <h3>13.2. Разрешаване на спорове</h3>
                  <p>
                    При възникване на спор, страните се задължават да направят опит за постигане на
                    споразумение чрез преговори. Ако спорът не бъде разрешен в рамките на 30 дни,
                    той се отнася до компетентния съд в гр. София, България.
                  </p>

                  <h3>13.3. Онлайн разрешаване на спорове</h3>
                  <p>
                    Потребителите от Европейския съюз могат да използват платформата за онлайн
                    разрешаване на спорове на Европейската комисия:
                    <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">
                      ec.europa.eu/consumers/odr
                    </a>
                  </p>
                </div>

                <!-- Section 14: Changes -->
                <div id="section-14" class="mb-5">
                  <h2><i class="bi bi-arrow-repeat me-2"></i>14. Промени в условията</h2>

                  <p>
                    Metalcutting Hub си запазва правото да променя тези Условия по всяко време.
                    Промените влизат в сила след публикуването им на Платформата.
                  </p>

                  <h3>14.1. Уведомление за промени</h3>
                  <p>
                    Съществени промени ще бъдат съобщавани чрез:
                  </p>
                  <ul>
                    <li>Публикуване на новата версия на тази страница</li>
                    <li>Имейл известие до регистрираните потребители</li>
                    <li>Уведомление в самата Платформа</li>
                  </ul>

                  <h3>14.2. Приемане на промените</h3>
                  <p>
                    Продължаването на използването на Платформата след влизането в сила на промените
                    се счита за приемане на новите Условия. Ако не сте съгласни с промените, трябва
                    да преустановите използването на Платформата.
                  </p>
                </div>

                <!-- Section 15: Contact -->
                <div id="section-15" class="mb-4">
                  <h2><i class="bi bi-envelope me-2"></i>15. Контакти</h2>

                  <p>
                    За въпроси относно тези Общи условия или използването на Платформата,
                    можете да се свържете с нас чрез:
                  </p>

                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                          <h5 class="card-title">
                            <i class="bi bi-building me-2 text-primary"></i>Metalcutting Hub
                          </h5>
                          <p class="card-text">
                            <strong>Адрес:</strong><br>
                            гр. София, България<br><br>
                            <strong>Имейл:</strong><br>
                            <a href="mailto:legal@metalcutting-hub.bg">legal@metalcutting-hub.bg</a><br><br>
                            <strong>Телефон:</strong><br>
                            +359 2 123 4567
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                          <h5 class="card-title">
                            <i class="bi bi-headset me-2 text-primary"></i>Поддръжка
                          </h5>
                          <p class="card-text">
                            <strong>Техническа поддръжка:</strong><br>
                            <a href="mailto:support@metalcutting-hub.bg">support@metalcutting-hub.bg</a><br><br>
                            <strong>Работно време:</strong><br>
                            Пон-Пет: 09:00 - 18:00<br>
                            Събота-Неделя: Почивен ден
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer Note -->
                <div class="text-center mt-5 pt-4 border-top">
                  <p class="text-muted mb-2">
                    <i class="bi bi-file-earmark-text me-1"></i>
                    Тези Общи условия са последно актуализирани на 24 февруари 2026 г.
                  </p>
                  <p class="text-muted small mb-0">
                    Metalcutting Hub запазва всички права.
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

export default TermsPage;
