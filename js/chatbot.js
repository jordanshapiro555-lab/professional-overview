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

  let history = [];
  let isOpen = false;
  let hasChatted = false;

  function init() {
    const widget = document.getElementById('chat-widget');
    if (!widget) return;

    renderSuggestions();
    addWelcomeMessage();
    bindEvents();
  }

  function renderSuggestions() {
    const container = document.getElementById('chat-suggestions');
    if (!container) return;
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
    appendMessage('bot', WELCOME_MESSAGE);
  }

  function bindEvents() {
    const toggle = document.getElementById('chat-toggle');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    toggle.addEventListener('click', () => {
      isOpen = !isOpen;
      document.getElementById('chat-widget').classList.toggle('open', isOpen);
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });

      const data = await res.json();
      removeTyping(typingEl);

      const reply = data.reply || `Error ${data.status || ''}: ${data.debug || data.error || "I'm having trouble connecting right now. Please reach out to Jordan directly at jordanshapiro555@gmail.com!"}`;
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
