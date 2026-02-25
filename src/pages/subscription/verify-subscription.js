import { subscriptionService } from '../../scripts/services/subscription.js';

export class VerifySubscriptionPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    const token = this.params.token;

    if (!token) {
      this.container.innerHTML = this.getErrorTemplate('Липсва токен за потвърждение.');
      return;
    }

    try {
      const result = await subscriptionService.verifyEmail(token);
      this.container.innerHTML = this.getSuccessTemplate(result.email);

      // Redirect to home after 5 seconds
      setTimeout(() => {
        window.router.navigate('/');
      }, 5000);
    } catch (error) {
      console.error('Verification error:', error);
      this.container.innerHTML = this.getErrorTemplate(
        error.message === 'INVALID_TOKEN' || error.message === 'TOKEN_NOT_FOUND'
          ? 'Невалиден или изтекъл токен за потвърждение.'
          : 'Възникна грешка при потвърждаването. Моля, опитайте отново.'
      );
    }
  }

  getLoadingTemplate() {
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-6 text-center">
            <div class="card shadow-sm">
              <div class="card-body py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">Зареждане...</span>
                </div>
                <h4>Потвърждение на абонамента...</h4>
                <p class="text-muted">Моля, изчакайте.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getSuccessTemplate(email) {
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-6 text-center">
            <div class="card shadow-sm border-success">
              <div class="card-body py-5">
                <div class="mb-4">
                  <i class="bi bi-check-circle-fill text-success display-1"></i>
                </div>
                <h3 class="text-success">Абонаментът е потвърден!</h3>
                <p class="text-muted">
                  Имейл адресът <strong>${email}</strong> е успешно потвърден.
                  Ще получавате нашите новини и промоции.
                </p>
                <hr>
                <p class="text-muted small mb-3">
                  Пренасочване към началната страница след <span id="redirect-countdown">5</span> секунди...
                </p>
                <a href="/" class="btn btn-primary">
                  <i class="bi bi-house me-2"></i>Към началната страница
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getErrorTemplate(message) {
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-6 text-center">
            <div class="card shadow-sm border-danger">
              <div class="card-body py-5">
                <div class="mb-4">
                  <i class="bi bi-x-circle-fill text-danger display-1"></i>
                </div>
                <h3 class="text-danger">Грешка при потвърждение</h3>
                <p class="text-muted">${message}</p>
                <hr>
                <p class="text-muted small">
                  Можете да се абонирате отново от футъра на сайта.
                </p>
                <a href="/" class="btn btn-primary">
                  <i class="bi bi-house me-2"></i>Към началната страница
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Countdown for redirect
    let seconds = 5;
    const countdownEl = document.getElementById('redirect-countdown');
    if (countdownEl) {
      const interval = setInterval(() => {
        seconds--;
        if (countdownEl) {
          countdownEl.textContent = seconds;
        }
        if (seconds <= 0) {
          clearInterval(interval);
        }
      }, 1000);
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default VerifySubscriptionPage;
