export class Toast {
  constructor() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.createContainer();
    }
    this.toasts = new Map();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    this.container.id = 'toast-container';
    document.body.appendChild(this.container);
  }

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Toast type ('success', 'error', 'warning', 'info')
   * @param {Object} options - Additional options
   * @returns {Toast} - Bootstrap Toast instance
   */
  static show(message, type = 'info', options = {}) {
    const toast = new Toast();
    return toast._show(message, type, options);
  }

  _show(message, type = 'info', options = {}) {
    const {
      title = '',
      duration = 5000,
      autohide = true,
      delay = 0
    } = options;

    const toastId = `toast-${Date.now()}`;
    const icon = this.getIcon(type);
    const headerClass = this.getHeaderClass(type);

    const toastElement = document.createElement('div');
    toastElement.className = 'toast';
    toastElement.id = toastId;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');

    toastElement.innerHTML = `
      <div class="toast-header ${headerClass}">
        <i class="${icon} me-2"></i>
        ${title ? `<strong class="me-auto">${title}</strong>` : '<strong class="me-auto">Известие</strong>'}
        <small class="text-muted">току-що</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${this.escapeHtml(message)}
      </div>
    `;

    this.container.appendChild(toastElement);

    // Create Bootstrap toast instance
    const bsToast = new bootstrap.Toast(toastElement, {
      autohide,
      delay: duration
    });

    // Show toast after delay if specified
    setTimeout(() => {
      bsToast.show();
    }, delay);

    // Store reference
    this.toasts.set(toastId, bsToast);

    // Remove from DOM after hiding
    toastElement.addEventListener('hidden.bs.toast', () => {
      this.toasts.delete(toastId);
      toastElement.remove();
    });

    return bsToast;
  }

  /**
   * Show success toast
   * @param {string} message - Success message
   * @param {Object} options - Additional options
   */
  static success(message, options = {}) {
    return this.show(message, 'success', { ...options, title: options.title || 'Успех!' });
  }

  /**
   * Show error toast
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   */
  static error(message, options = {}) {
    return this.show(message, 'error', { ...options, title: options.title || 'Грешка!', duration: 7000 });
  }

  /**
   * Show warning toast
   * @param {string} message - Warning message
   * @param {Object} options - Additional options
   */
  static warning(message, options = {}) {
    return this.show(message, 'warning', { ...options, title: options.title || 'Внимание!' });
  }

  /**
   * Show info toast
   * @param {string} message - Info message
   * @param {Object} options - Additional options
   */
  static info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * Show confirmation dialog as toast
   * @param {string} message - Confirmation message
   * @param {Function} onConfirm - Callback when confirmed
   * @param {Function} onCancel - Callback when cancelled
   * @returns {Toast} - Bootstrap Toast instance
   */
  static confirm(message, onConfirm, onCancel) {
    const toast = new Toast();

    const toastId = `toast-confirm-${Date.now()}`;
    const toastElement = document.createElement('div');
    toastElement.className = 'toast';
    toastElement.id = toastId;
    toastElement.setAttribute('role', 'alertdialog');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    toastElement.setAttribute('data-bs-autohide', 'false');

    toastElement.innerHTML = `
      <div class="toast-header bg-primary text-white">
        <i class="bi bi-question-circle me-2"></i>
        <strong class="me-auto">Потвърждение</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        <p>${toast.escapeHtml(message)}</p>
        <div class="d-flex gap-2 mt-3">
          <button type="button" class="btn btn-primary btn-confirm">Потвърди</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="toast">Отказ</button>
        </div>
      </div>
    `;

    toast.container.appendChild(toastElement);

    // Create Bootstrap toast instance
    const bsToast = new bootstrap.Toast(toastElement, {
      autohide: false
    });

    // Event listeners
    const confirmBtn = toastElement.querySelector('.btn-confirm');
    confirmBtn.addEventListener('click', () => {
      bsToast.hide();
      if (onConfirm) onConfirm();
    });

    toastElement.addEventListener('hidden.bs.toast', () => {
      toast.toasts.delete(toastId);
      toastElement.remove();
      if (onCancel) onCancel();
    });

    bsToast.show();
    toast.toasts.set(toastId, bsToast);

    return bsToast;
  }

  /**
   * Show loading toast
   * @param {string} message - Loading message
   * @returns {Object} - Control object with hide method
   */
  static loading(message = 'Зареждане...') {
    const toast = new Toast();

    const toastId = `toast-loading-${Date.now()}`;
    const toastElement = document.createElement('div');
    toastElement.className = 'toast';
    toastElement.id = toastId;
    toastElement.setAttribute('role', 'status');
    toastElement.setAttribute('aria-live', 'polite');
    toastElement.setAttribute('aria-atomic', 'true');
    toastElement.setAttribute('data-bs-autohide', 'false');

    toastElement.innerHTML = `
      <div class="toast-header bg-info text-white">
        <div class="spinner-border spinner-border-sm me-2" role="status">
          <span class="visually-hidden">Зареждане...</span>
        </div>
        <strong class="me-auto">Зареждане</strong>
      </div>
      <div class="toast-body">
        ${toast.escapeHtml(message)}
      </div>
    `;

    toast.container.appendChild(toastElement);

    const bsToast = new bootstrap.Toast(toastElement, {
      autohide: false
    });

    bsToast.show();
    toast.toasts.set(toastId, bsToast);

    // Return control object
    return {
      hide: () => {
        bsToast.hide();
      },
      updateMessage: (newMessage) => {
        const body = toastElement.querySelector('.toast-body');
        if (body) body.textContent = newMessage;
      }
    };
  }

  getIcon(type) {
    const icons = {
      'success': 'bi bi-check-circle-fill text-success',
      'error': 'bi bi-x-circle-fill text-danger',
      'warning': 'bi bi-exclamation-triangle-fill text-warning',
      'info': 'bi bi-info-circle-fill text-info'
    };
    return icons[type] || icons.info;
  }

  getHeaderClass(type) {
    const classes = {
      'success': 'bg-success text-white',
      'error': 'bg-danger text-white',
      'warning': 'bg-warning text-dark',
      'info': 'bg-info text-white'
    };
    return classes[type] || classes.info;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Hide all toasts
   */
  hideAll() {
    this.toasts.forEach((toast) => {
      toast.hide();
    });
  }

  /**
   * Remove all toasts immediately
   */
  removeAll() {
    this.toasts.forEach((toast, id) => {
      const element = document.getElementById(id);
      if (element) {
        element.remove();
      }
    });
    this.toasts.clear();
  }

  destroy() {
    this.removeAll();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// Global toast helpers
window.showSuccessToast = (message, options) => Toast.success(message, options);
window.showErrorToast = (message, options) => Toast.error(message, options);
window.showWarningToast = (message, options) => Toast.warning(message, options);
window.showInfoToast = (message, options) => Toast.info(message, options);
window.showConfirmToast = (message, onConfirm, onCancel) => Toast.confirm(message, onConfirm, onCancel);
window.showLoadingToast = (message) => Toast.loading(message);

export default Toast;
