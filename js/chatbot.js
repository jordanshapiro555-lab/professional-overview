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

  const FALLBACK_SITE_ROOT = 'https://jordanshapiro555-lab.github.io/professional-overview';
  const FALLBACK_CHAT_ENDPOINT = 'https://professional-overview.jordanshapiro555.workers.dev/api/chat';
  const FALLBACK_TIMEOUT_MS = 12000;
  const MAX_HISTORY_MESSAGES = 10;
  const MAX_HISTORY_CHARS = 1000;
  let configLoadPromise = null;

  const getConfig = () => window.CRO_CONSULTING_CONFIG || {};
  const getSiteRoot = () => getConfig().siteRoot || FALLBACK_SITE_ROOT;
  const getChatEndpoint = () => getConfig().endpoints?.chat || FALLBACK_CHAT_ENDPOINT;
  const getRequestTimeoutMs = () => {
    const timeout = Number(getConfig().requestTimeoutMs);
    return timeout > 0 ? timeout : FALLBACK_TIMEOUT_MS;
  };

  const getAssetBase = () => {
    const script = Array.from(document.querySelectorAll('script[src]')).find((item) => {
      const src = item.getAttribute('src') || '';
      return src === 'js/chatbot.js' || src.endsWith('/js/chatbot.js');
    });
    const src = script ? script.src : '';
    return src ? src.replace(/js\/chatbot\.js(?:\?.*)?$/, '') : '';
  };

  const loadPublicConfig = () => {
    if (window.CRO_CONSULTING_CONFIG) return Promise.resolve();
    if (configLoadPromise) return configLoadPromise;

    const existingConfigScript = Array.from(document.querySelectorAll('script[src]')).find((item) => {
      const src = item.getAttribute('src') || '';
      return src === 'js/config.js' || src.endsWith('/js/config.js');
    });

    if (existingConfigScript) {
      configLoadPromise = new Promise((resolve) => {
        existingConfigScript.addEventListener('load', () => resolve(), { once: true });
        existingConfigScript.addEventListener('error', () => resolve(), { once: true });
        window.setTimeout(resolve, 1500);
      });
      return configLoadPromise;
    }

    configLoadPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `${getAssetBase()}js/config.js`;
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });

    return configLoadPromise;
  };

  const logoSvg = (id, size) => `
    <svg width="${size}" height="${size}" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id}" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.15"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="#0A1628"/>
      <polygon points="48,70 352,70 296,152 104,152" fill="#00C9A7" opacity="0.28"/>
      <polygon points="108,162 292,162 248,244 152,244" fill="#00C9A7" opacity="0.60"/>
      <polygon points="156,254 244,254 200,336" fill="#00C9A7" opacity="1.0"/>
      <polygon points="156,254 244,254 200,336" fill="url(#${id})"/>
      <line x1="104" y1="157" x2="296" y2="157" stroke="#0A1628" stroke-width="5"/>
      <line x1="152" y1="249" x2="248" y2="249" stroke="#0A1628" stroke-width="5"/>
    </svg>`;

  function normalizeSiteChrome() {
    const siteRoot = getSiteRoot();
    const brand = document.querySelector('.site-header .brand');
    if (brand) {
      brand.href = `${siteRoot}/`;
      brand.setAttribute('aria-label', "Jordan's CRO Studio - Home");
      if (!brand.querySelector('svg')) {
        brand.innerHTML = `${logoSvg('hdr-conv-glow', 36)}<span>Jordan's CRO Studio</span>`;
      }
    }

    const footer = document.querySelector('.site-footer .footer-grid');
    if (footer) {
      footer.innerHTML = `
        <div>
          <div class="footer-brand">
            ${logoSvg('ftr-conv-glow', 28)}
            <strong>Jordan's CRO Studio</strong>
          </div>
          <p class="muted">Optimization &amp; experimentation agency</p>
        </div>
        <div>
          <nav class="footer-nav" aria-label="Footer">
            <a href="${siteRoot}/work">Work</a>
            <a href="${siteRoot}/process">Process</a>
            <a href="${siteRoot}/about">About</a>
            <a href="${siteRoot}/blog">Blog</a>
            <a href="${siteRoot}/contact">Contact</a>
            <a href="https://www.linkedin.com/in/jordan-shapiro-797315153/" target="_blank" rel="noopener">LinkedIn</a>
            <a href="mailto:jordanshapiro555@gmail.com">Email</a>
          </nav>
        </div>
        <div><small class="muted">&copy; <span id="year"></span> Jordan's CRO Studio</small></div>`;
      const yearEl = footer.querySelector('#year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    }
  }

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
    loadPublicConfig().then(normalizeSiteChrome);

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

  function getSafeHistory() {
    return history
      .slice(-MAX_HISTORY_MESSAGES)
      .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, MAX_HISTORY_CHARS)
      }));
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
      await loadPublicConfig();
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), getRequestTimeoutMs());

      try {
        const res = await fetch(getChatEndpoint(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.slice(0, MAX_HISTORY_CHARS), history: getSafeHistory() }),
          signal: controller.signal
        });

        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
        removeTyping(typingEl);

        const reply = data.reply || "I'm having trouble connecting right now. Please reach out to Jordan directly at jordanshapiro555@gmail.com!";
        appendMessage('bot', reply);

        // Update history for context
        history.push({ role: 'user', content: text.slice(0, MAX_HISTORY_CHARS) });
        history.push({ role: 'assistant', content: String(reply).slice(0, MAX_HISTORY_CHARS) });
        history = history.slice(-MAX_HISTORY_MESSAGES);
      } finally {
        window.clearTimeout(timeout);
      }
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
