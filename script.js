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

  const loadCoreScript = () => {
    if (document.querySelector('script[data-cro-core-script="true"]')) return;
    const currentScript = document.currentScript;
    const scriptUrl = currentScript ? new URL(currentScript.src, window.location.href) : new URL('script.js', window.location.href);
    scriptUrl.pathname = scriptUrl.pathname.replace(/script\.js$/i, 'script-core.js');
    scriptUrl.search = '';
    scriptUrl.hash = '';

    const coreScript = document.createElement('script');
    coreScript.src = scriptUrl.href;
    coreScript.defer = true;
    coreScript.dataset.croCoreScript = 'true';
    document.head.appendChild(coreScript);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureKeywordMappingNavLink);
  } else {
    ensureKeywordMappingNavLink();
  }

  loadCoreScript();
})();
