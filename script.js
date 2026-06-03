// Adds branch-specific global nav item, then loads the existing site script.
(function () {
  const keywordMappingHref = 'https://jordanshapiro555-lab.github.io/CRO-Consulting/services/keyword-analysis-and-mapping';

  const ensureKeywordMappingNavLink = () => {
    document.querySelectorAll('.nav-item-dropdown').forEach((item) => {
      const topLink = item.querySelector('.nav-link');
      const dropdown = item.querySelector('.nav-dropdown');
      if (!topLink || !dropdown || !topLink.href.includes('/services')) return;
      if (dropdown.querySelector('a[href*="/services/keyword-analysis-and-mapping"]')) return;

      const keywordItem = document.createElement('li');
      const keywordLink = document.createElement('a');
      keywordLink.href = keywordMappingHref;
      keywordLink.textContent = 'Keyword Analysis & Mapping';
      keywordItem.appendChild(keywordLink);

      const croAuditLink = dropdown.querySelector('a[href*="/services/cro-audit"]');
      const croAuditItem = croAuditLink ? croAuditLink.closest('li') : null;
      if (croAuditItem) {
        croAuditItem.insertAdjacentElement('afterend', keywordItem);
      } else {
        dropdown.insertAdjacentElement('afterbegin', keywordItem);
      }
    });
  };

  const runWhenReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  };

  const withLateDomReadySupport = (loadScript) => {
    if (document.readyState === 'loading') {
      loadScript();
      return;
    }

    const originalAddEventListener = document.addEventListener;
    document.addEventListener = function (type, listener, options) {
      if (type === 'DOMContentLoaded' && typeof listener === 'function') {
        window.setTimeout(() => listener.call(document, new Event('DOMContentLoaded')), 0);
        return;
      }
      return originalAddEventListener.call(document, type, listener, options);
    };

    loadScript(() => {
      document.addEventListener = originalAddEventListener;
    });
  };

  const loadCoreScript = (onComplete) => {
    if (document.querySelector('script[data-cro-core-script="true"]')) {
      if (onComplete) onComplete();
      return;
    }

    const currentScript = document.currentScript;
    const scriptUrl = currentScript ? new URL(currentScript.src, window.location.href) : new URL('script.js', window.location.href);
    scriptUrl.pathname = scriptUrl.pathname.replace(/script\.js$/i, 'script-core.js');
    scriptUrl.search = '';
    scriptUrl.hash = '';

    const coreScript = document.createElement('script');
    coreScript.src = scriptUrl.href;
    coreScript.async = false;
    coreScript.defer = true;
    coreScript.dataset.croCoreScript = 'true';
    if (onComplete) {
      coreScript.addEventListener('load', onComplete, { once: true });
      coreScript.addEventListener('error', onComplete, { once: true });
    }
    document.head.appendChild(coreScript);
  };

  runWhenReady(ensureKeywordMappingNavLink);
  withLateDomReadySupport(loadCoreScript);
})();
