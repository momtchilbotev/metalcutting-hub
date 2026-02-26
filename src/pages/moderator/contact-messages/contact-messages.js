import './contact-messages.css';
import { contactService } from '../../../scripts/services/contact.js';
import { Toast } from '../../../scripts/components/Toast.js';
import { formatDate, formatContactSubject, formatContactStatus, getContactStatusBadgeClass } from '../../../scripts/utils/formatters.js';

export class ModeratorContactMessagesPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.submissions = [];
    this.currentPage = parseInt(params.page) || 1;
    this.itemsPerPage = 20;
    this.totalCount = 0;
    this.filters = {
      status: params.status || '',
      subject: params.subject || ''
    };
    this.selectedSubmission = null;
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      await this.loadData();
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error loading contact messages:', error);
      this.showError();
    }
  }

  async loadData() {
    const result = await contactService.getSubmissions({
      page: this.currentPage,
      items_per_page: this.itemsPerPage,
      status: this.filters.status || undefined,
      subject: this.filters.subject || undefined
    });

    this.submissions = result.submissions;
    this.totalCount = result.count;
  }

  getLoadingTemplate() {
    return `
      <div class="container-fluid py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на съобщенията...</p>
        </div>
      </div>
    `;
  }

  getTemplate() {
    const newCount = this.submissions.filter(s => s.status === 'new').length;

    return `
      <div class="container-fluid py-4">
        <div class="row mb-4">
          <div class="col">
            <h2 class="h3 mb-0">
              <i class="bi bi-envelope text-primary me-2"></i>Контакт съобщения
            </h2>
            <p class="text-muted">
              ${this.totalCount} съобщения общо
              ${newCount > 0 ? `<span class="badge bg-danger ms-2">${newCount} нови</span>` : ''}
            </p>
          </div>
        </div>

        <!-- Filters -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <form id="filter-form" class="row g-3">
              <div class="col-md-3">
                <select class="form-select" id="filter-status" name="status">
                  <option value="">Всички статуси</option>
                  <option value="new" ${this.filters.status === 'new' ? 'selected' : ''}>Нови</option>
                  <option value="read" ${this.filters.status === 'read' ? 'selected' : ''}>Прочетени</option>
                  <option value="in_progress" ${this.filters.status === 'in_progress' ? 'selected' : ''}>В процес</option>
                  <option value="resolved" ${this.filters.status === 'resolved' ? 'selected' : ''}>Решени</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select" id="filter-subject" name="subject">
                  <option value="">Всички теми</option>
                  <option value="general" ${this.filters.subject === 'general' ? 'selected' : ''}>Общ въпрос</option>
                  <option value="listing" ${this.filters.subject === 'listing' ? 'selected' : ''}>Въпрос за обява</option>
                  <option value="account" ${this.filters.subject === 'account' ? 'selected' : ''}>Проблем с акаунт</option>
                  <option value="partnership" ${this.filters.subject === 'partnership' ? 'selected' : ''}>Партньорство</option>
                  <option value="feedback" ${this.filters.subject === 'feedback' ? 'selected' : ''}>Обратна връзка</option>
                  <option value="report" ${this.filters.subject === 'report' ? 'selected' : ''}>Доклад за нарушение</option>
                  <option value="other" ${this.filters.subject === 'other' ? 'selected' : ''}>Друго</option>
                </select>
              </div>
              <div class="col-md-3">
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-search me-1"></i>Филтрирай
                </button>
                <button type="button" class="btn btn-outline-secondary" id="clear-filters">
                  <i class="bi bi-x me-1"></i>Изчисти
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Messages Table -->
        <div class="card shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>От</th>
                  <th>Тема</th>
                  <th>Съобщение</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                ${this.submissions.length === 0 ? `
                  <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                      <i class="bi bi-inbox display-4 d-block mb-2"></i>
                      Няма съобщения
                    </td>
                  </tr>
                ` : this.submissions.map(submission => `
                  <tr class="status-${submission.status}">
                    <td>
                      <strong>${this.escapeHtml(submission.name)}</strong>
                      <br><small class="text-muted">${this.escapeHtml(submission.email)}</small>
                      ${submission.phone ? `<br><small class="text-muted"><i class="bi bi-telephone"></i> ${this.escapeHtml(submission.phone)}</small>` : ''}
                      ${submission.user ? `<br><span class="badge bg-info">Регистриран</span>` : ''}
                    </td>
                    <td>
                      <span class="badge bg-secondary">${formatContactSubject(submission.subject)}</span>
                    </td>
                    <td>
                      <span class="message-preview" title="${this.escapeHtml(submission.message)}">
                        ${this.escapeHtml(submission.message.length > 60 ? submission.message.substring(0, 60) + '...' : submission.message)}
                      </span>
                    </td>
                    <td>
                      <span class="badge ${getContactStatusBadgeClass(submission.status)} status-badge">
                        ${formatContactStatus(submission.status)}
                      </span>
                      ${submission.reviewer ? `<br><small class="text-muted">от ${this.escapeHtml(submission.reviewer.full_name)}</small>` : ''}
                    </td>
                    <td><small>${formatDate(submission.created_at, true)}</small></td>
                    <td>
                      <div class="quick-actions">
                        <button class="btn btn-outline-primary btn-view" data-id="${submission.id}" title="Виж">
                          <i class="bi bi-eye"></i>
                        </button>
                        ${submission.status === 'new' ? `
                          <button class="btn btn-outline-success btn-read" data-id="${submission.id}" title="Маркирай като прочетено">
                            <i class="bi bi-check"></i>
                          </button>
                        ` : ''}
                        ${submission.status !== 'resolved' ? `
                          <button class="btn btn-outline-success btn-resolve" data-id="${submission.id}" title="Реши">
                            <i class="bi bi-check2-all"></i>
                          </button>
                        ` : ''}
                        <a href="mailto:${this.escapeHtml(submission.email)}?subject=Re: ${this.escapeHtml(formatContactSubject(submission.subject))}" class="btn btn-outline-info" title="Отговори">
                          <i class="bi bi-reply"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <nav class="mt-4">
          ${this.getPaginationTemplate()}
        </nav>
      </div>

      <!-- View Modal -->
      <div class="modal fade" id="viewModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-envelope-open text-primary me-2"></i>Детайли на съобщението
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="modal-body">
              <!-- Content loaded dynamically -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Затвори</button>
              <button type="button" class="btn btn-primary" id="modal-reply">
                <i class="bi bi-reply me-1"></i>Отговори
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getPaginationTemplate() {
    const totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
    if (totalPages <= 1) return '';

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(`
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `);
    }

    return `
      <ul class="pagination justify-content-center">
        ${this.currentPage > 1 ? `
          <li class="page-item">
            <a class="page-link" href="#" data-page="${this.currentPage - 1}">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>
        ` : ''}
        ${pages.join('')}
        ${this.currentPage < totalPages ? `
          <li class="page-item">
            <a class="page-link" href="#" data-page="${this.currentPage + 1}">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
        ` : ''}
      </ul>
    `;
  }

  attachEventListeners() {
    const filterForm = document.getElementById('filter-form');
    const clearFiltersBtn = document.getElementById('clear-filters');

    // Filter form
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.applyFilters();
      });
    }

    // Clear filters
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        window.router.navigate('/moderator/contact-messages');
      });
    }

    // View buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => this.viewSubmission(btn.dataset.id));
    });

    // Mark as read buttons
    document.querySelectorAll('.btn-read').forEach(btn => {
      btn.addEventListener('click', () => this.markAsRead(btn.dataset.id));
    });

    // Resolve buttons
    document.querySelectorAll('.btn-resolve').forEach(btn => {
      btn.addEventListener('click', () => this.resolveSubmission(btn.dataset.id));
    });

    // Pagination
    document.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(link.dataset.page);
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          this.render();
        }
      });
    });
  }

  applyFilters() {
    const status = document.getElementById('filter-status').value;
    const subject = document.getElementById('filter-subject').value;

    const params = { page: 1 };
    if (status) params.status = status;
    if (subject) params.subject = subject;

    window.router.navigate('/moderator/contact-messages', params);
  }

  async viewSubmission(submissionId) {
    try {
      const submission = await contactService.getSubmission(submissionId);
      this.selectedSubmission = submission;

      const modalBody = document.getElementById('modal-body');
      modalBody.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <div class="contact-detail">
              <div class="contact-detail-label">От</div>
              <strong>${this.escapeHtml(submission.name)}</strong>
              ${submission.user ? `<br><span class="badge bg-info">Регистриран потребител</span>` : ''}
            </div>
          </div>
          <div class="col-md-6">
            <div class="contact-detail">
              <div class="contact-detail-label">Имейл</div>
              <a href="mailto:${this.escapeHtml(submission.email)}">${this.escapeHtml(submission.email)}</a>
            </div>
          </div>
          <div class="col-md-6">
            <div class="contact-detail">
              <div class="contact-detail-label">Телефон</div>
              ${submission.phone ? `<a href="tel:${this.escapeHtml(submission.phone)}">${this.escapeHtml(submission.phone)}</a>` : '<span class="text-muted">Не е посочен</span>'}
            </div>
          </div>
          <div class="col-md-6">
            <div class="contact-detail">
              <div class="contact-detail-label">Тема</div>
              <span class="badge bg-secondary">${formatContactSubject(submission.subject)}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="contact-detail">
              <div class="contact-detail-label">Статус</div>
              <span class="badge ${getContactStatusBadgeClass(submission.status)}">${formatContactStatus(submission.status)}</span>
              ${submission.reviewer ? `<small class="text-muted ms-2">от ${this.escapeHtml(submission.reviewer.full_name)}</small>` : ''}
            </div>
          </div>
          <div class="col-md-6">
            <div class="contact-detail">
              <div class="contact-detail-label">Получено</div>
              ${formatDate(submission.created_at, true)}
            </div>
          </div>
          <div class="col-12">
            <div class="contact-detail">
              <div class="contact-detail-label">Съобщение</div>
              <div class="message-content">${this.escapeHtml(submission.message)}</div>
            </div>
          </div>
          ${submission.admin_notes ? `
            <div class="col-12">
              <div class="admin-notes">
                <div class="contact-detail-label">Бележки</div>
                ${this.escapeHtml(submission.admin_notes)}
              </div>
            </div>
          ` : ''}
          <div class="col-12">
            <hr>
            <label class="form-label">Добави бележки:</label>
            <textarea class="form-control" id="admin-notes" rows="3" placeholder="Бележки...">${this.escapeHtml(submission.admin_notes || '')}</textarea>
          </div>
          <div class="col-12">
            <div class="action-buttons d-flex gap-2 flex-wrap">
              ${submission.status === 'new' ? `
                <button class="btn btn-success btn-modal-read" data-id="${submission.id}">
                  <i class="bi bi-check me-1"></i>Маркирай като прочетено
                </button>
              ` : ''}
              ${submission.status !== 'resolved' ? `
                <button class="btn btn-success btn-modal-resolve" data-id="${submission.id}">
                  <i class="bi bi-check2-all me-1"></i>Маркирай като решено
                </button>
              ` : ''}
              ${submission.status !== 'in_progress' && submission.status !== 'resolved' ? `
                <button class="btn btn-warning btn-modal-progress" data-id="${submission.id}">
                  <i class="bi bi-hourglass-split me-1"></i>В процес
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      // Add event listeners for modal buttons
      const modalReadBtn = modalBody.querySelector('.btn-modal-read');
      const modalResolveBtn = modalBody.querySelector('.btn-modal-resolve');
      const modalProgressBtn = modalBody.querySelector('.btn-modal-progress');

      if (modalReadBtn) {
        modalReadBtn.addEventListener('click', async () => {
          const notes = document.getElementById('admin-notes').value;
          await this.updateStatusWithNotes(submission.id, 'read', notes);
          this.closeModalAndView();
        });
      }

      if (modalResolveBtn) {
        modalResolveBtn.addEventListener('click', async () => {
          const notes = document.getElementById('admin-notes').value;
          await this.updateStatusWithNotes(submission.id, 'resolved', notes);
          this.closeModalAndView();
        });
      }

      if (modalProgressBtn) {
        modalProgressBtn.addEventListener('click', async () => {
          const notes = document.getElementById('admin-notes').value;
          await this.updateStatusWithNotes(submission.id, 'in_progress', notes);
          this.closeModalAndView();
        });
      }

      // Modal reply button
      const replyBtn = document.getElementById('modal-reply');
      if (replyBtn) {
        replyBtn.onclick = () => {
          window.location.href = `mailto:${submission.email}?subject=Re: ${formatContactSubject(submission.subject)}`;
        };
      }

      // Show modal
      const modal = new bootstrap.Modal(document.getElementById('viewModal'));
      modal.show();

      // Mark as read if new
      if (submission.status === 'new') {
        await contactService.markAsRead(submission.id);
      }

    } catch (error) {
      console.error('Error viewing submission:', error);
      Toast.error('Грешка при зареждане на съобщението.');
    }
  }

  closeModalAndView() {
    const modalEl = document.getElementById('viewModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
      modal.hide();
    }
    this.render();
  }

  async markAsRead(submissionId) {
    try {
      await contactService.markAsRead(submissionId);
      Toast.success('Съобщението е маркирано като прочетено!');
      await this.render();
    } catch (error) {
      Toast.error('Грешка при обновяване на съобщението.');
    }
  }

  async resolveSubmission(submissionId) {
    const notes = prompt('Бележки (по желание):');
    if (notes === null) return;

    try {
      await contactService.updateSubmissionStatus(submissionId, 'resolved', notes);
      Toast.success('Съобщението е маркирано като решено!');
      await this.render();
    } catch (error) {
      Toast.error('Грешка при обновяване на съобщението.');
    }
  }

  async updateStatusWithNotes(submissionId, status, notes) {
    try {
      await contactService.updateSubmissionStatus(submissionId, status, notes);
      Toast.success('Статусът е обновен успешно!');
    } catch (error) {
      Toast.error('Грешка при обновяване на съобщението.');
      throw error;
    }
  }

  showError() {
    this.container.innerHTML = `
      <div class="container-fluid py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Грешка при зареждане на съобщенията.
        </div>
        <div class="text-center">
          <button class="btn btn-primary" onclick="window.location.reload()">Опитайте отново</button>
        </div>
      </div>
    `;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy() {
    // Close modal if open
    const modalEl = document.getElementById('viewModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) {
        modal.hide();
      }
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default ModeratorContactMessagesPage;
