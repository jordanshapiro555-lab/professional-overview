// script.js - compatibility wrapper plus global chatbot loader
(function () {
  'use strict';

  const ORIGINAL_SITE_SCRIPT_SRC = 'https://cdn.jsdelivr.net/gh/jordanshapiro555-lab/CRO-Consulting@db6ee2173d4e7335886a962b38c5e9a271e36263/script.js';
  const SITE_ROOT = '/CRO-Consulting/';
  const BRAND_MARK_SVG = `
      <svg width="36" height="36" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hdr-conv-glow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.15"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="#0A1628"/>
      <polygon points="48,70 352,70 296,152 104,152" fill="#00C9A7" opacity="0.28"/>
      <polygon points="108,162 292,162 248,244 152,244" fill="#00C9A7" opacity="0.60"/>
      <polygon points="156,254 244,254 200,336" fill="#00C9A7" opacity="1.0"/>
      <polygon points="156,254 244,254 200,336" fill="url(#hdr-conv-glow)"/>
      <line x1="104" y1="157" x2="296" y2="157" stroke="#0A1628" stroke-width="5"/>
      <line x1="152" y1="249" x2="248" y2="249" stroke="#0A1628" stroke-width="5"/>
    </svg>`;

  function loadOriginalSiteScript() {
    if (window.__oneshotOriginalSiteScriptLoaded) return;
    window.__oneshotOriginalSiteScriptLoaded = true;

    if (document.readyState === 'loading') {
      document.write('<script src="' + ORIGINAL_SITE_SCRIPT_SRC + '"><\/script>');
      return;
    }

    const script = document.createElement('script');
    script.src = ORIGINAL_SITE_SCRIPT_SRC;
    script.async = false;
    document.head.appendChild(script);
  }

  function normalizeSiteHeaderBrand() {
    document.querySelectorAll('.site-header .brand').forEach((brand) => {
      if (brand.querySelector('svg')) return;
      brand.insertAdjacentHTML('afterbegin', BRAND_MARK_SVG);
    });
  }

  function hasAsset(selector, suffix) {
    return Array.from(document.querySelectorAll(selector)).some((node) => {
      const value = node.getAttribute('href') || node.getAttribute('src') || '';
      return value.endsWith(suffix) || value.includes(suffix + '?');
    });
  }

  function ensureChatbotStylesheet() {
    if (hasAsset('link[rel="stylesheet"]', '/css/chatbot.css') || hasAsset('link[rel="stylesheet"]', 'css/chatbot.css')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = SITE_ROOT + 'css/chatbot.css';
    document.head.appendChild(link);
  }

  function ensureChatbotScript() {
    if (hasAsset('script[src]', '/js/chatbot.js') || hasAsset('script[src]', 'js/chatbot.js')) return;

    const script = document.createElement('script');
    script.src = SITE_ROOT + 'js/chatbot.js';
    document.body.appendChild(script);
  }

  function ensureChatbotWidget() {
    if (document.getElementById('chat-widget')) return;

    ensureChatbotStylesheet();
    document.body.insertAdjacentHTML('beforeend', `
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
      </div>
    `);
    ensureChatbotScript();
  }

  function bootSiteEnhancements() {
    normalizeSiteHeaderBrand();
    ensureChatbotWidget();
  }

  loadOriginalSiteScript();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootSiteEnhancements);
  } else {
    bootSiteEnhancements();
  }
})();