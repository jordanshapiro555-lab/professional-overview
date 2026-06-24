(function () {
  const form = document.getElementById('home-contact-form');
  if (!form) return;

  const config = window.CRO_CONSULTING_CONFIG || {};
  const endpoint = config.endpoints?.homepageContact || 'https://sgrijnhcdpioqzzrdbem.supabase.co/functions/v1/capture-homepage-contact';
  const requestTimeoutMs = Number(config.requestTimeoutMs) > 0 ? Number(config.requestTimeoutMs) : 12000;
  const submitButton = document.getElementById('home-contact-submit');
  const formError = document.getElementById('home-contact-form-error');
  const success = document.getElementById('home-contact-success');
  const intro = document.querySelector('#cro-homepage-contact .croHomepageContact__intro');
  const emailInput = document.getElementById('home-contact-email');
  const phoneInput = document.getElementById('home-contact-phone');
  const emailError = document.getElementById('home-contact-email-error');
  const phoneError = document.getElementById('home-contact-phone-error');
  let isSubmitting = false;

  const setFieldError = (input, errorElement, message) => {
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    errorElement.textContent = message;
  };

  const stripQuery = (value) => {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.origin);
      return `${url.origin}${url.pathname}`;
    } catch {
      return '';
    }
  };

  const getAttribution = () => {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    return keys.reduce((result, key) => {
      const value = params.get(key);
      if (value) result[key] = value.slice(0, 200);
      return result;
    }, {});
  };

  const validate = () => {
    let valid = true;
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    setFieldError(emailInput, emailError, '');
    setFieldError(phoneInput, phoneError, '');
    formError.hidden = true;

    if (!email) {
      setFieldError(emailInput, emailError, 'Please enter your email address.');
      valid = false;
    } else if (!emailInput.validity.valid) {
      setFieldError(emailInput, emailError, 'Please enter a valid email address.');
      valid = false;
    }

    if (phone) {
      const digits = phone.replace(/\D/g, '');
      const validLength = phone.startsWith('+')
        ? digits.length >= 8 && digits.length <= 15
        : digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));

      if (!validLength) {
        setFieldError(phoneInput, phoneError, 'Please enter a valid phone number, including country code when outside the US.');
        valid = false;
      }
    }

    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
    }

    return valid;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting || !validate()) return;

    isSubmitting = true;
    form.classList.add('croHomepageContact__form--submitting');
    submitButton.disabled = true;
    formError.hidden = true;

    const formData = new FormData(form);
    const payload = {
      first_name: String(formData.get('first_name') || '').trim(),
      last_name: String(formData.get('last_name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      pain_points: String(formData.get('pain_points') || '').trim(),
      company_website: String(formData.get('company_website') || '').trim(),
      page_url: stripQuery(window.location.href),
      referrer: stripQuery(document.referrer),
      attribution: getAttribution()
    };

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(response.status === 429 ? 'rate_limited' : 'submission_failed');
      }

      form.reset();
      form.hidden = true;
      if (intro) intro.hidden = true;
      success.hidden = false;
      success.focus();

      window.statsigClient?.logEvent('homepage_contact_form_submitted', null, {
        location: 'homepage_contact_form'
      });
    } catch (error) {
      formError.textContent = error.message === 'rate_limited'
        ? 'Please wait a few minutes before trying again.'
        : 'Something went wrong. Please try again in a moment.';
      formError.hidden = false;

      window.statsigClient?.logEvent('homepage_contact_form_failed', null, {
        location: 'homepage_contact_form',
        reason: error.name === 'AbortError' ? 'timeout' : 'request_failed'
      });
    } finally {
      window.clearTimeout(timeout);
      isSubmitting = false;
      form.classList.remove('croHomepageContact__form--submitting');
      submitButton.disabled = false;
    }
  });
})();

(function () {
  'use strict';

  function getAssetBase() {
    const script = Array.from(document.querySelectorAll('script[src]')).find((item) => {
      const src = item.getAttribute('src') || '';
      return src === 'js/home-contact-form.js' || src.endsWith('/js/home-contact-form.js');
    });
    const src = script ? script.src : '';
    return src ? src.replace(/js\/home-contact-form\.js(?:\?.*)?$/, '') : '';
  }

  function loadStylesheet(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(src) {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
  }

  function loadHomeCaseStudyCarouselAssets() {
    if (!document.querySelector('#case-studies .container > .grid.cards, #case-studies [data-case-study-carousel]')) return;
    const assetBase = getAssetBase();
    loadStylesheet(`${assetBase}css/home-case-studies-carousel.css`);
    loadScript(`${assetBase}js/home-case-studies-carousel.js`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHomeCaseStudyCarouselAssets, { once: true });
  } else {
    loadHomeCaseStudyCarouselAssets();
  }
})();
