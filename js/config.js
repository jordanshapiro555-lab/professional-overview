(function () {
  'use strict';

  window.CRO_CONSULTING_CONFIG = Object.freeze({
    siteRoot: 'https://jordanshapiro555-lab.github.io/professional-overview',
    requestTimeoutMs: 12000,
    endpoints: Object.freeze({
      chat: 'https://professional-overview.jordanshapiro555.workers.dev/api/chat',
      homepageContact: 'https://sgrijnhcdpioqzzrdbem.supabase.co/functions/v1/capture-homepage-contact',
      exitIntent: 'https://sgrijnhcdpioqzzrdbem.supabase.co/functions/v1/capture-exit-intent'
    })
  });
})();
