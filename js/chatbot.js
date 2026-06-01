(function () {
  'use strict';

  const SUGGESTIONS = [
    "What does Jordan do?",
    "What results has Jordan achieved?",
    "How can Jordan help my business?",
    "What's Jordan's process?",
  ];

  const WELCOME_MESSAGE =
    "Hi! I'm Jordan's AI assistant 👋 Ask me anything about Jordan's CRO expertise, case studies, or how he can help grow your business!";

  const WIDGET_HTML = `
  <div id="chat-widget">
    <div id="chat-panel" role="dialog" aria-label="Chat with Jordan's AI assistant">
      <div id="chat-header">
        <div class="chat-avatar">&#129302;</div>
        <div class="chat-header-info">
          <div class="chat-header-name">Jordan's AI Assistant</div>
          <div class="chat-header-status">Online</div>
        </div>
      </div>
      <div id="chat-messages" aria-live="polite"></div>
      <div id="chat-suggestions"></div>
      <div id="chat-input-area">
        <textarea id="chat-input" placeholder="Ask me about Jordan..." rows="1" aria-label="Type your message"></textarea>
        <button id="chat-send" aria-label="Send message">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
    <button id="chat-toggle" aria-label="Open chat" aria-expanded="false">
      <svg class="icon-chat" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      <svg class="icon-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>
  </div>`;

  let history = [];
  let isOpen = false;
  let hasChatted = false;

  function ensureWidget() {
    if (!document.getElementById('chat-widget')) {
      document.body.insertAdjacentHTML('beforeend', WIDGET_HTML);
    }
    return document.getElementById('chat-widget');
  }

  function init() {
    const widget = ensureWidget();
    if (!widget || widget.dataset.chatbotInitialized === 'true') return;
    widget.dataset.chatbotInitialized = 'true';

    renderSuggestions();
    addWelcomeMessage();
    bindEvents();
  }

  function renderSuggestions() {
    const container = document.getElementById('chat-suggestions');
    if (!container || container.children.length) return;
    SUGGESTIONS.forEach((text) => {
      const btn = document.createElement('button');
      btn.className = 'chat-suggestion';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        hideSuggestions();
        sendMessage(text);
      });
      container.appendChild(btn);
    });
  }

  function hideSuggestions() {
    const el = document.getElementById('chat-suggestions');
    if (el) el.style.display = 'none';
  }

  function addWelcomeMessage() {
    const container = document.getElementById('chat-messages');
    if (!container || container.children.length) return;
    appendMessage('bot', WELCOME_MESSAGE);
  }

  function bindEvents() {
    const toggle = document.getElementById('chat-toggle');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    if (!toggle || !input || !sendBtn) return;

    toggle.addEventListener('click', () => {
      isOpen = !isOpen;
      document.getElementById('chat-widget').classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
      if (isOpen) {
        setTimeout(() => input.focus(), 300);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitInput();
      }
    });

    input.addEventListener('input', () => {
      // auto-resize textarea
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 80) + 'px';
    });

    sendBtn.addEventListener('click', submitInput);
  }

  function submitInput() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    hideSuggestions();
    sendMessage(text);
  }

  async function sendMessage(text) {
    if (!hasChatted) {
      hasChatted = true;
      document.getElementById('chat-widget').classList.add('chatted');
    }

    appendMessage('user', text);
    setSendDisabled(true);
    const typingEl = showTyping();

    try {
      const res = await fetch('https://cro-consulting.jordanshapiro555.workers.dev/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });

      const data = await res.json();
      removeTyping(typingEl);

      const reply = data.reply || "I'm having trouble connecting right now. Please reach out to Jordan directly at jordanshapiro555@gmail.com!";
      appendMessage('bot', reply);

      // Update history for context
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: reply });
    } catch {
      removeTyping(typingEl);
      appendMessage('bot', "I'm having trouble connecting right now. Please reach out to Jordan directly at jordanshapiro555@gmail.com!");
    } finally {
      setSendDisabled(false);
      document.getElementById('chat-input').focus();
    }
  }

  function appendMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    msgEl.appendChild(bubble);
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    const container = document.getElementById('chat-messages');
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-msg bot';
    wrapper.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
    return wrapper;
  }

  function removeTyping(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function setSendDisabled(disabled) {
    const btn = document.getElementById('chat-send');
    if (btn) btn.disabled = disabled;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
