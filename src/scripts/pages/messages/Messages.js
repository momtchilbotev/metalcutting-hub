import { authService } from '../../services/auth.js';
import { supabase } from '../../utils/supabaseClient.js';
import { formatPrice, formatDate, formatRelativeTime } from '../../utils/formatters.js';

export class MessagesPage {
  constructor(containerId, params = {}) {
    this.container = document.getElementById(containerId);
    this.params = params;
    this.conversations = [];
    this.selectedConversation = null;
    this.messages = [];
    this.subscription = null;
  }

  async render() {
    // Check auth
    const session = await authService.getSession();
    if (!session) {
      window.router.navigate('/login');
      return;
    }

    try {
      await this.loadConversations();
      this.container.innerHTML = this.getTemplate();
      this.renderConversations();
      this.attachEventListeners();
      this.setupRealtimeSubscription();
    } catch (error) {
      console.error('Error loading messages:', error);
      this.showError();
    }
  }

  async loadConversations() {
    const user = await authService.getUser();
    if (!user) return;

    // Get unique conversations (grouped by the other user)
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        is_read,
        created_at,
        sender_id,
        receiver_id,
        sender:profiles!messages_sender_id_fkey(full_name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(full_name, avatar_url),
        listings (
          id,
          title,
          price,
          listing_images (storage_path, is_primary)
        )
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by conversation (other user + listing)
    const grouped = new Map();

    for (const msg of data || []) {
      const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const listingId = msg.listing_id;
      const key = `${otherUserId}_${listingId}`;

      if (!grouped.has(key)) {
        const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
        grouped.set(key, {
          key,
          otherUserId,
          listing: msg.listings,
          otherUser: otherUser,
          lastMessage: msg,
          unreadCount: 0
        });
      }

      const conv = grouped.get(key);
      // Count unread messages (received and not read)
      if (msg.receiver_id === user.id && !msg.is_read) {
        conv.unreadCount++;
      }
    }

    this.conversations = Array.from(grouped.values());
  }

  async loadMessages(otherUserId, listingId) {
    const user = await authService.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        is_read,
        created_at,
        sender_id,
        sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    this.messages = data || [];

    // Mark received messages as read
    const unreadIds = this.messages
      .filter(m => m.receiver_id === user.id && !m.is_read)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadIds);
    }
  }

  getTemplate() {
    const listing = this.selectedConversation?.listing;
    const otherUser = this.selectedConversation?.otherUser;

    return `
      <div class="container-fluid py-4">
        <div class="container">
          <h1 class="mb-4">
            <i class="bi bi-chat-dots me-2"></i>Съобщения
          </h1>

          <div class="row" style="height: calc(100vh - 200px);">
            <!-- Conversations List -->
            <div class="col-lg-4 mb-3 mb-lg-0">
              <div class="card h-100">
                <div class="card-header">
                  <h6 class="mb-0">Разговори</h6>
                </div>
                <div class="list-group list-group-flush overflow-auto" id="conversations-list">
                  ${this.renderConversationsList()}
                </div>
              </div>
            </div>

            <!-- Messages View -->
            <div class="col-lg-8">
              <div class="card h-100">
                ${this.selectedConversation ? `
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="mb-0">${this.escapeHtml(otherUser?.full_name || 'Потребител')}</h6>
                      ${listing ? `
                        <small class="text-muted">
                        За: <a href="/listings/view?id=${listing.id}" class="text-decoration-none">
                          ${this.escapeHtml(listing.title)}
                        </a> • ${listing.price ? formatPrice(listing.price) : 'По договаряне'}
                        </small>
                      ` : ''}
                    </div>
                    <button class="btn btn-sm btn-outline-danger" id="close-conversation">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>

                  <div class="card-body overflow-auto d-flex flex-column" id="messages-container">
                    <div id="messages-list" class="flex-grow-1">
                      ${this.renderMessages()}
                    </div>

                    <form class="mt-3" id="message-form">
                      <div class="input-group">
                        <input type="text" class="form-control" id="message-input"
                          placeholder="Напишете съобщение..." autocomplete="off">
                        <button type="submit" class="btn btn-primary">
                          <i class="bi bi-send"></i>
                        </button>
                      </div>
                    </form>
                  </div>
                ` : `
                  <div class="card-body d-flex align-items-center justify-content-center h-100">
                    <div class="text-center text-muted">
                      <i class="bi bi-chat-square-text display-4 mb-3"></i>
                      <p>Изберете разговор от списъка или създайте нова обява.</p>
                    </div>
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderConversationsList() {
    if (this.conversations.length === 0) {
      return `
        <div class="p-4 text-center text-muted">
          <i class="bi bi-inbox display-6 mb-3"></i>
          <p class="mb-0">Нямате съобщения.</p>
        </div>
      `;
    }

    return this.conversations.map(conv => {
      const isSelected = this.selectedConversation?.key === conv.key;
      const lastMsgPreview = this.escapeHtml(conv.lastMessage?.content || '').substring(0, 50);
      const time = conv.lastMessage ? formatRelativeTime(conv.lastMessage.created_at) : '';

      return `
        <button class="list-group-item list-group-item-action d-flex gap-3 ${isSelected ? 'active' : ''}"
          data-conversation-key="${conv.key}">
          <div class="flex-shrink-0">
            <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
              style="width: 48px; height: 48px;">
              <i class="bi bi-person fs-5"></i>
            </div>
          </div>
          <div class="flex-grow-1 overflow-hidden">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-1 text-truncate">${this.escapeHtml(conv.otherUser?.full_name || 'Потребител')}</h6>
              <small class="text-muted">${time}</small>
            </div>
            <p class="mb-0 text-truncate small">
              ${conv.unreadCount > 0 ? `<span class="badge bg-primary me-1">${conv.unreadCount}</span>` : ''}
              ${lastMsgPreview}
            </p>
            <small class="text-muted text-truncate d-block">
              ${conv.listing ? this.escapeHtml(conv.listing.title) : 'Обявата е изтрита'}
            </small>
          </div>
        </button>
      `;
    }).join('');
  }

  renderMessages() {
    if (this.messages.length === 0) {
      return `
        <div class="text-center text-muted py-5">
          <p>Начало на разговора.</p>
        </div>
      `;
    }

    const user = this.getUserFromSomewhere(); // Would get from session

    return this.messages.map(msg => {
      const isOwn = msg.sender_id === user?.id;

      return `
        <div class="d-flex ${isOwn ? 'justify-content-end' : 'justify-content-start'} mb-3">
          <div class="card ${isOwn ? 'bg-primary text-white' : ''}" style="max-width: 70%;">
            <div class="card-body py-2 px-3">
              <p class="mb-1">${this.escapeHtml(msg.content)}</p>
              <small class="${isOwn ? 'text-white-50' : 'text-muted'}">
                ${formatDate(msg.created_at, true)}
              </small>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  attachEventListeners() {
    // Conversation selection
    this.container.querySelectorAll('[data-conversation-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.conversationKey;
        const conv = this.conversations.find(c => c.key === key);
        if (conv) {
          this.selectConversation(conv);
        }
      });
    });

    // Close conversation
    const closeBtn = document.getElementById('close-conversation');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.selectedConversation = null;
        this.messages = [];
        this.container.innerHTML = this.getTemplate();
        this.attachEventListeners();
      });
    }

    // Send message
    const form = document.getElementById('message-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }
  }

  async selectConversation(conv) {
    this.selectedConversation = conv;
    await this.loadMessages(conv.otherUserId, conv.listing?.id);
    this.container.innerHTML = this.getTemplate();
    this.attachEventListeners();
    this.scrollToBottom();
  }

  async sendMessage() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();

    if (!content || !this.selectedConversation) return;

    const user = await authService.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          listing_id: this.selectedConversation.listing.id,
          sender_id: user.id,
          receiver_id: this.selectedConversation.otherUserId,
          content: content
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local messages
      this.messages.push({
        ...data,
        sender: { full_name: user.user_metadata?.full_name || 'Вие' }
      });

      input.value = '';
      this.container.innerHTML = this.getTemplate();
      this.attachEventListeners();
      this.scrollToBottom();
    } catch (error) {
      console.error('Send error:', error);
      window.showToast('Грешка при изпращане.', 'error');
    }
  }

  setupRealtimeSubscription() {
    const user = this.getUserFromSomewhere();
    if (!user) return;

    this.subscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
      }, (payload) => {
        const newMsg = payload.new;
        const conv = this.selectedConversation;

        // If message belongs to current conversation, add it
        if (conv &&
            ((newMsg.sender_id === conv.otherUserId && newMsg.receiver_id === user.id) ||
             (newMsg.sender_id === user.id && newMsg.receiver_id === conv.otherUserId)) &&
            newMsg.listing_id === conv.listing?.id) {
          this.messages.push(newMsg);
          const container = document.getElementById('messages-list');
          if (container) {
            container.innerHTML = this.renderMessages();
            this.scrollToBottom();
          }
        } else {
          // Reload conversations to show new message preview
          this.loadConversations().then(() => {
            const listContainer = document.getElementById('conversations-list');
            if (listContainer) {
              listContainer.innerHTML = this.renderConversationsList();
              this.attachEventListeners();
            }
          });
        }
      })
      .subscribe();
  }

  scrollToBottom() {
    const container = document.getElementById('messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  getUserFromSomewhere() {
    // This would get the current user from auth service
    return { id: 'current-user-id' };
  }

  getImageUrl(storagePath) {
    if (!storagePath) return '/images/placeholder.svg';
    const { data } = supabase.storage
      .from('listing-images')
      .getPublicUrl(storagePath);
    return data.publicUrl;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showError() {
    this.container.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Възникна грешка при зареждане на съобщенията.
        </div>
      </div>
    `;
  }

  destroy() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default MessagesPage;
