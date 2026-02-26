import './messages.css';
import { authService } from '../../scripts/services/auth.js';
import { Toast } from '../../scripts/components/Toast.js';
import { formatDate } from '../../scripts/utils/formatters.js';
import { supabase } from '../../scripts/utils/supabaseClient.js';

export class MessagesPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.conversations = [];
    this.messages = [];
    this.currentConversation = null;
    this.toUserId = params.to || null;
    this.listingId = params.listing || null;
    this.user = null;
  }

  async render() {
    this.container.innerHTML = this.getLoadingTemplate();

    try {
      this.user = await authService.getUser();
      if (!this.user) {
        window.router.navigate('/login');
        return;
      }

      // Load profile to ensure avatar is available in sidebar
      await authService.getProfile();

      await this.loadConversations();

      // If we have a "to" parameter, start new conversation
      if (this.toUserId && !this.conversations.find(c => c.other_user_id === this.toUserId)) {
        await this.startNewConversation();
      } else if (this.conversations.length > 0) {
        // Select first conversation
        await this.selectConversation(this.conversations[0].other_user_id);
      }

      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
      this.scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
      this.showError();
    }
  }

  async loadConversations() {
    // Get all conversations (unique user pairs)
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        created_at,
        is_read,
        listing_id
      `)
      .or(`sender_id.eq.${this.user.id},receiver_id.eq.${this.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by conversation (other user)
    const conversationMap = new Map();

    for (const msg of data || []) {
      const otherUserId = msg.sender_id === this.user.id ? msg.receiver_id : msg.sender_id;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          other_user_id: otherUserId,
          last_message: msg,
          unread_count: 0
        });
      }

      // Count unread
      if (msg.receiver_id === this.user.id && !msg.is_read) {
        conversationMap.get(otherUserId).unread_count++;
      }
    }

    // Get other user profiles
    const userIds = Array.from(conversationMap.keys());
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      for (const profile of profiles || []) {
        const conv = conversationMap.get(profile.id);
        if (conv) {
          conv.profile = profile;
        }
      }
    }

    this.conversations = Array.from(conversationMap.values());
  }

  async startNewConversation() {
    // Get the other user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', this.toUserId)
      .single();

    if (profile) {
      this.currentConversation = {
        other_user_id: this.toUserId,
        profile: profile,
        listing_id: this.listingId
      };
      this.messages = [];
    }
  }

  async selectConversation(otherUserId) {
    this.currentConversation = this.conversations.find(c => c.other_user_id === otherUserId);

    if (!this.currentConversation) {
      await this.startNewConversation();
      return;
    }

    // Load messages
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${this.user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${this.user.id})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    this.messages = data || [];

    // Mark as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', this.user.id)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);

    // Update unread count
    const conv = this.conversations.find(c => c.other_user_id === otherUserId);
    if (conv) {
      conv.unread_count = 0;
    }
  }

  getLoadingTemplate() {
    return `
      <div class="container py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Зареждане на съобщенията...</p>
        </div>
      </div>
    `;
  }

  getTemplate() {
    return `
      <div class="container py-4">
        <div class="row">
          <!-- Sidebar -->
          <div class="col-lg-3 mb-4">
            <div class="card shadow-sm">
              <div class="card-body text-center">
                <img src="${authService.currentProfile?.avatar_url || '/images/default-avatar.png'}"
                  class="rounded-circle mb-3"
                  style="width: 80px; height: 80px; object-fit: cover;"
                  alt="Profile">
                <h6 class="card-title">${this.escapeHtml(authService.currentProfile?.full_name || 'Потребител')}</h6>
              </div>
              <div class="list-group list-group-flush">
                <a href="/profile" class="list-group-item list-group-item-action">
                  <i class="bi bi-person me-2"></i>Профил
                </a>
                <a href="/my-listings" class="list-group-item list-group-item-action">
                  <i class="bi bi-list-ul me-2"></i>Моите обяви
                </a>
                <a href="/watchlist" class="list-group-item list-group-item-action">
                  <i class="bi bi-heart me-2"></i>Наблюдавани
                </a>
                <a href="/messages" class="list-group-item list-group-item-action active">
                  <i class="bi bi-chat me-2"></i>Съобщения
                </a>
                <button type="button" class="list-group-item list-group-item-action text-danger" id="sidebar-logout-btn">
                  <i class="bi bi-box-arrow-right me-2"></i>Изход
                </button>
              </div>
            </div>
          </div>

          <!-- Messages Area -->
          <div class="col-lg-9">
            <div class="card shadow-sm" style="height: 600px;">
              <div class="row g-0 h-100">
                <!-- Conversations List -->
                <div class="col-md-4 border-end">
                  <div class="card-header bg-white">
                    <h5 class="mb-0">
                      <i class="bi bi-chat-dots me-2"></i>Съобщения
                    </h5>
                  </div>
                  <div class="list-group list-group-flush" id="conversations-list" style="max-height: 520px; overflow-y: auto;">
                    ${this.getConversationsTemplate()}
                  </div>
                </div>

                <!-- Chat Area -->
                <div class="col-md-8 d-flex flex-column">
                  ${this.currentConversation ? `
                    <!-- Chat Header -->
                    <div class="card-header bg-white d-flex align-items-center">
                      <img src="${this.currentConversation.profile?.avatar_url || '/images/default-avatar.png'}"
                        class="rounded-circle me-2"
                        style="width: 40px; height: 40px; object-fit: cover;"
                        alt="">
                      <div>
                        <h6 class="mb-0">${this.escapeHtml(this.currentConversation.profile?.full_name || 'Потребител')}</h6>
                      </div>
                    </div>

                    <!-- Messages -->
                    <div id="messages-container" class="flex-grow-1 p-3" style="overflow-y: auto;">
                      ${this.getMessagesTemplate()}
                    </div>

                    <!-- Message Input -->
                    <div class="card-footer bg-white">
                      <form id="message-form" class="d-flex gap-2">
                        <input type="text" class="form-control" id="message-input"
                          placeholder="Напишете съобщение..." autocomplete="off">
                        <button type="submit" class="btn btn-primary">
                          <i class="bi bi-send"></i>
                        </button>
                      </form>
                    </div>
                  ` : `
                    <div class="flex-grow-1 d-flex align-items-center justify-content-center">
                      <div class="text-center text-muted">
                        <i class="bi bi-chat-square display-1"></i>
                        <p class="mt-2">Изберете разговор или започнете нов</p>
                      </div>
                    </div>
                  `}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getConversationsTemplate() {
    if (this.conversations.length === 0) {
      return `
        <div class="text-center py-4 text-muted">
          <i class="bi bi-chat-square display-4"></i>
          <p class="mt-2 small">Няма разговори</p>
        </div>
      `;
    }

    return this.conversations.map(conv => `
      <button class="list-group-item list-group-item-action ${this.currentConversation?.other_user_id === conv.other_user_id ? 'active' : ''}"
        data-user-id="${conv.other_user_id}">
        <div class="d-flex align-items-center">
          <img src="${conv.profile?.avatar_url || '/images/default-avatar.png'}"
            class="rounded-circle me-2"
            style="width: 40px; height: 40px; object-fit: cover;"
            alt="">
          <div class="flex-grow-1 text-start">
            <div class="d-flex justify-content-between">
              <span class="fw-semibold">${this.escapeHtml(conv.profile?.full_name || 'Потребител')}</span>
              ${conv.unread_count > 0 ? `<span class="badge bg-danger">${conv.unread_count}</span>` : ''}
            </div>
            <small class="${this.currentConversation?.other_user_id === conv.other_user_id ? '' : 'text-muted'} text-truncate d-block" style="max-width: 150px;">
              ${this.escapeHtml(conv.last_message?.content?.substring(0, 30) || '')}...
            </small>
          </div>
        </div>
      </button>
    `).join('');
  }

  getMessagesTemplate() {
    if (this.messages.length === 0) {
      return `
        <div class="text-center text-muted py-4">
          <p>Няма съобщения. Започнете разговора!</p>
        </div>
      `;
    }

    return this.messages.map(msg => `
      <div class="d-flex ${msg.sender_id === this.user.id ? 'justify-content-end' : 'justify-content-start'} mb-2">
        <div class="message-bubble ${msg.sender_id === this.user.id ? 'sent' : 'received'}">
          <p class="mb-0">${this.escapeHtml(msg.content)}</p>
          <small class="${msg.sender_id === this.user.id ? 'text-white-50' : 'text-muted'}">
            ${formatDate(msg.created_at, true)}
          </small>
        </div>
      </div>
    `).join('');
  }

  attachEventListeners() {
    const logoutBtn = this.container.querySelector('#sidebar-logout-btn');
    const conversationsList = document.getElementById('conversations-list');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await authService.logout();
        } catch (error) {
          console.error('Sidebar logout error:', error);
          Toast.error('Грешка при излизане.');
        }
      });
    }

    // Select conversation
    if (conversationsList) {
      conversationsList.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-user-id]');
        if (btn) {
          const userId = btn.dataset.userId;
          await this.selectConversation(userId);
          this.container.innerHTML = this.getTemplate();
          this.attachEventListeners();
          this.scrollToBottom();
        }
      });
    }

    // Send message
    if (messageForm) {
      messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.sendMessage();
      });
    }
  }

  async sendMessage() {
    const input = document.getElementById('message-input');
    const content = input?.value?.trim();

    if (!content || !this.currentConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: this.user.id,
          receiver_id: this.currentConversation.other_user_id,
          content: content,
          listing_id: this.currentConversation.listing_id
        }]);

      if (error) throw error;

      input.value = '';

      // Reload conversation
      await this.selectConversation(this.currentConversation.other_user_id);

      // Update messages display
      const container = document.getElementById('messages-container');
      if (container) {
        container.innerHTML = this.getMessagesTemplate();
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('Send message error:', error);
      Toast.error('Грешка при изпращане на съобщението.');
    }
  }

  scrollToBottom() {
    const container = document.getElementById('messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
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
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default MessagesPage;
