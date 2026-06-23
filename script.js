(function () {
  'use strict';

  const ORIGINAL_SCRIPT = 'https://cdn.jsdelivr.net/gh/jordanshapiro555-lab/CRO-Consulting@961b5ae0cffa1f3ecc88ab8289e3249e656a9ebe/script.js';
  const currentScript = document.currentScript;
  const currentScriptSrc = currentScript ? currentScript.src : '';
  const assetBase = currentScriptSrc ? currentScriptSrc.replace(/script\.js(?:\?.*)?$/, '') : '';
  const carouselCss = `${assetBase}css/home-case-studies-carousel.css`;
  const carouselScript = `${assetBase}js/home-case-studies-carousel.js`;

  const loadStylesheet = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  const loadScript = (src) => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
  };

  const runWhenReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  };

  const loadCarouselAssets = () => {
    if (!document.querySelector('#case-studies .container > .grid.cards, #case-studies [data-case-study-carousel]')) return;
    loadStylesheet(carouselCss);
    loadScript(carouselScript);
  };

  if (currentScript && document.readyState === 'loading') {
    document.write(`<script src="${ORIGINAL_SCRIPT}"><\/script>`);
    runWhenReady(loadCarouselAssets);
    return;
  }

  loadScript(ORIGINAL_SCRIPT);
  runWhenReady(loadCarouselAssets);
})();
