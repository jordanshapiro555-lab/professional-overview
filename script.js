// script.js - nav, shared service dropdown, sticky CTAs, quiz, and page helpers

document.addEventListener('DOMContentLoaded', function () {
  const SITE_BASE_URL = 'https://jordanshapiro555-lab.github.io/professional-overview/';
  const SERVICE_NAV_ITEMS = [
    { slug: 'cro-audit', label: 'CRO Audit' },
    { slug: 'keyword-analysis-and-mapping', label: 'Keyword Analysis & Mapping' },
    { slug: 'seo-technical-page-speed-audit', label: 'SEO Technical Page Speed Audit' },
    { slug: 'personalization', label: 'Personalization' },
    { slug: 'program-management', label: 'Program Management' },
    { slug: 'program-up-skilling', label: 'Program Up-Skilling' }
  ];

  const normalizePath = (path) => {
    let normalized = path || '/';
    while (normalized.length > 1 && normalized.endsWith('/')) normalized = normalized.slice(0, -1);
    if (normalized.toLowerCase().endsWith('.html')) normalized = normalized.slice(0, -5);
    return normalized || '/';
  };

  const stripLeadingSlashes = (path) => {
    let out = path || '';
    while (out.startsWith('/')) out = out.slice(1);
    return out;
  };

  const buildSiteUrl = (path) => new URL(stripLeadingSlashes(path), SITE_BASE_URL).href;
  const currentPath = normalizePath(window.location.pathname);
  const isContactPage = currentPath.endsWith('/contact');
  const isMobileViewport = () => window.matchMedia('(max-width: 700px)').matches;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderServicesNav = () => {
    document.querySelectorAll('.main-nav .nav-item-dropdown').forEach((dropdownItem) => {
      const topLevelLink = dropdownItem.querySelector(':scope > .nav-link');
      const dropdownList = dropdownItem.querySelector(':scope > .nav-dropdown');
      if (!topLevelLink || !dropdownList) return;

      let topLevelUrl;
      try {
        topLevelUrl = new URL(topLevelLink.getAttribute('href') || '', window.location.href);
      } catch {
        return;
      }

      if (normalizePath(topLevelUrl.pathname) !== '/professional-overview/services') return;
      dropdownList.innerHTML = SERVICE_NAV_ITEMS
        .map((item) => `<li><a href='${buildSiteUrl(`services/${item.slug}/`)}'>${item.label}</a></li>`)
        .join('');
    });
  };

  renderServicesNav();

  const ensureDesktopQuizCta = () => {
    document.querySelectorAll('.main-nav').forEach((navEl) => {
      const existingCta = navEl.querySelector('.desktop-quiz-cta');
      if (!isContactPage && !isMobileViewport()) {
        if (existingCta) return;
        const quizCta = document.createElement('a');
        quizCta.href = '#';
        quizCta.className = 'btn btn-ghost desktop-quiz-cta';
        quizCta.setAttribute('data-open-exit-quiz', 'true');
        quizCta.textContent = 'Take the CRO Quiz';
        navEl.appendChild(quizCta);
        return;
      }
      if (existingCta) existingCta.remove();
    });
  };

  if (!isContactPage) {
    ensureDesktopQuizCta();
    window.addEventListener('resize', ensureDesktopQuizCta);
  }

  if (!isContactPage && !document.getElementById('mobile-sticky-banner')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class='mobile-sticky-banner' id='mobile-sticky-banner' aria-label='Primary actions'>
        <a class='btn btn-primary mobile-sticky-banner__cta' href='https://jordanshapiro555-lab.github.io/professional-overview/contact'>Work with me</a>
        <button type='button' class='btn btn-ghost mobile-sticky-banner__cta' data-open-exit-quiz='true'>Take the CRO quiz</button>
      </div>
    `);
    document.body.classList.add('has-mobile-sticky-banner');
  }

  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const mobileStickyBanner = document.getElementById('mobile-sticky-banner');

  const syncMobileBannerWithNav = () => {
    if (!mobileStickyBanner || !mainNav) return;
    mobileStickyBanner.classList.toggle('is-hidden', mainNav.classList.contains('open'));
  };

  if (navToggle && mainNav) {
    syncMobileBannerWithNav();
    navToggle.addEventListener('click', function () {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
      syncMobileBannerWithNav();
      navToggle.querySelector('.hamburger')?.classList.toggle('open');
    });
  }

  document.querySelectorAll('.nav-dropdown-toggle').forEach((btn) => {
    btn.addEventListener('click', function (event) {
      event.stopPropagation();
      const item = btn.closest('.nav-item-dropdown');
      if (!item) return;
      const expanded = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(expanded));
    });
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (!mainNav || !navToggle || !mainNav.classList.contains('open')) return;
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      syncMobileBannerWithNav();
    });
  });

  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  const scrollToHashTarget = (hash, options = {}) => {
    const updateHash = Boolean(options.updateHash);
    const smooth = options.smooth !== false;
    if (!hash || hash === '#') {
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
      if (updateHash) history.replaceState(null, '', '#');
      return true;
    }

    const targetId = decodeURIComponent(hash.replace('#', ''));
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return false;

    targetEl.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    window.scrollBy({ top: -72, behavior: smooth ? 'smooth' : 'auto' });
    if (updateHash) history.replaceState(null, '', `#${encodeURIComponent(targetId)}`);
    return true;
  };

  document.querySelectorAll("a[href*='#']").forEach((anchor) => {
    anchor.addEventListener('click', function (event) {
      const rawHref = this.getAttribute('href');
      if (!rawHref) return;

      let url;
      try {
        url = new URL(rawHref, window.location.href);
      } catch {
        return;
      }

      const isSamePage = url.origin === window.location.origin && normalizePath(url.pathname) === currentPath;
      if (!isSamePage) return;

      event.preventDefault();
      scrollToHashTarget(url.hash || '#', { updateHash: true });
    });
  });

  if (window.location.hash) {
    [0, 120, 360].forEach((delay) => {
      setTimeout(() => scrollToHashTarget(window.location.hash, { smooth: false }), delay);
    });
  }

  window.addEventListener('load', () => {
    if (window.location.hash) scrollToHashTarget(window.location.hash, { smooth: false });
  });

  window.addEventListener('hashchange', () => scrollToHashTarget(window.location.hash, { smooth: true }));

  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
      });
    }, { root: null, rootMargin: '0px', threshold: 0.45 });
    sections.forEach((section) => observer.observe(section));
  }

  document.querySelectorAll('.cards .card').forEach((card) => {
    const link = card.querySelector('.card-link');
    if (!link) return;
    card.addEventListener('click', (event) => {
      if (!event.target.closest('a')) window.location.href = link.getAttribute('href');
    });
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  document.querySelectorAll('.experienceHero_imgCard').forEach((card) => {
    if (!('IntersectionObserver' in window)) {
      card.classList.add('fadeInUp');
      return;
    }
    new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('fadeInUp');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 }).observe(card);
  });

  const experienceDropdown = document.querySelector('.experienceDropdown');
  const experienceDropdownButton = document.getElementById('experienceDropdownButton');
  if (experienceDropdown && experienceDropdownButton) {
    experienceDropdownButton.addEventListener('click', () => {
      const selectedValue = experienceDropdown.value;
      if (!selectedValue) return;
      const targetEl = document.getElementById(`${selectedValue}Experience`);
      if (!targetEl) return;
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.scrollBy({ top: -72, behavior: 'smooth' });
      history.replaceState(null, '', `#${selectedValue}Experience`);
    });
  }

  const isWinnerDetailPage = currentPath.includes('/work/test-winners/') && currentPath !== '/professional-overview/work/test-winners';
  const winnersBottomCta = document.querySelector('.wn-bottom-cta');
  const tallRows = Array.from(document.querySelectorAll('.caseStudyTallRow'));
  if (isWinnerDetailPage && winnersBottomCta && tallRows.length) {
    const appendixSection = document.createElement('section');
    appendixSection.className = 'wn-section wn-section--alt wn-appendix';
    appendixSection.innerHTML = `
      <div class='wn-container'>
        <p class='wn-section-label'>Appendix</p>
        <h2 class='wn-section-heading'>Full-page test visuals</h2>
        <p class='wn-appendix-scroll-hint'>Scroll horizontally to browse all screenshots <span aria-hidden='true'>→</span></p>
        <div class='wn-appendix-scroll' data-appendix-scroll>
          <div class='wn-appendix-track' data-appendix-track aria-label='Appendix image carousel'></div>
        </div>
      </div>
    `;
    winnersBottomCta.parentNode.insertBefore(appendixSection, winnersBottomCta);
    const track = appendixSection.querySelector('[data-appendix-track]');
    const scrollHint = appendixSection.querySelector('.wn-appendix-scroll-hint');
    tallRows.forEach((row) => {
      row.classList.add('wn-appendix-card');
      track.appendChild(row);
    });
    if (track.querySelectorAll('.caseStudyTallRowImageDiv').length <= 1 && scrollHint) scrollHint.remove();
  }

  const stickyCta = document.getElementById('sticky-cta');
  const heroSection = document.querySelector('.hero');
  const footerEl = document.querySelector('.site-footer');
  if (stickyCta) {
    const checkSticky = () => {
      const footerTop = footerEl ? footerEl.getBoundingClientRect().top : window.innerHeight;
      const nearFooter = footerTop <= window.innerHeight * 0.6;
      const pastThreshold = heroSection ? heroSection.getBoundingClientRect().bottom < 0 : window.scrollY > 300;
      stickyCta.classList.toggle('visible', pastThreshold && !nearFooter);
    };
    window.addEventListener('scroll', checkSticky, { passive: true });
    checkSticky();
  }

  const statsStrip = document.querySelector('.stats-strip');
  if (statsStrip && 'IntersectionObserver' in window) {
    let fired = false;
    const runCounters = () => {
      statsStrip.querySelectorAll('.count[data-to]').forEach((el) => {
        const target = parseFloat(el.dataset.to);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        if (Number.isNaN(target)) return;
        const duration = 1400;
        let startTime = null;
        const step = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        runCounters();
      }
    }, { threshold: 0.5 }).observe(statsStrip);
  }

  if (!isContactPage && !document.getElementById('exit-intent-quiz')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id='exit-intent-quiz' class='exit-intent-quiz' role='dialog' aria-modal='true' aria-labelledby='exit-quiz-title' aria-hidden='true'>
        <div class='exit-intent-overlay' data-exit-close></div>
        <form class='exit-intent-panel'>
          <button class='exit-intent-close' type='button' aria-label='Close popup' data-exit-close>×</button>
          <div class='exit-intent-cta' id='exit-intent-step-0'>
            <div class='exit-intent-top-bar'></div>
            <div class='exit-intent-cta-content'>
              <h2 id='exit-quiz-title'>Free CRO needs quiz</h2>
              <p>Find out what you need to improve your site</p>
              <button class='exit-intent-primary-btn' type='button' id='exit-quiz-start'>Take the quiz</button>
            </div>
          </div>
          <div class='exit-intent-quiz-flow is-hidden' id='exit-intent-flow'>
            <div class='exit-quiz-header'>Let's Get Started!</div>
            <div class='exit-quiz-step' data-step='1'><p class='exit-quiz-question'>What kind of funnel do you have?</p><div class='exit-quiz-options-grid'><button type='button' class='exit-quiz-tile' data-value='Ecommerce'>Ecommerce</button><button type='button' class='exit-quiz-tile' data-value='Lead Generation'>Lead Generation</button></div></div>
            <div class='exit-quiz-step is-hidden' data-step='2'><p class='exit-quiz-question'>What are you hoping to get out of a CRO consultant? <strong>(Select all that apply)</strong></p><div id='exit-quiz-goals' class='exit-quiz-checks'></div></div>
            <div class='exit-quiz-step is-hidden' data-step='3'><p class='exit-quiz-question'>Where are you struggling today? <strong>(Select all that apply)</strong></p><div class='exit-quiz-checks'><label><input type='checkbox' value='Strategy'> Strategy</label><label><input type='checkbox' value='Idea Generation'> Idea Generation</label><label><input type='checkbox' value='Design'> Design</label><label><input type='checkbox' value='Development'> Development</label><label><input type='checkbox' value='Tracking'> Tracking</label><label><input type='checkbox' value='Analysis'> Analysis</label></div></div>
            <div class='exit-quiz-step is-hidden' data-step='4'><p class='exit-quiz-question'>Approximately how much traffic goes to your site weekly?</p><div class='exit-quiz-traffic-row'><input type='number' id='exit-quiz-traffic' class='exit-quiz-input' placeholder='100000' value='100000' min='0' step='1'><select id='exit-quiz-traffic-type' class='exit-quiz-input exit-quiz-select' aria-label='Traffic unit'><option value='Users'>Users</option><option value='Sessions' selected>Sessions</option></select></div></div>
            <div class='exit-quiz-step is-hidden' data-step='5'><p class='exit-quiz-question'>Optional: Describe your funnel below:</p><textarea id='exit-quiz-funnel' class='exit-quiz-textarea' rows='4' placeholder='Describe your funnel and where you are seeing the biggest drop-off...'></textarea><button class='exit-quiz-skip' id='exit-quiz-skip-funnel' type='button'>Skip this question</button></div>
            <div class='exit-quiz-step is-hidden' data-step='6'><p class='exit-quiz-question'>Get your free consultation summary:</p><div class='exit-quiz-form'><input type='text' id='exit-quiz-name' class='exit-quiz-input' placeholder='Your Name' required><input type='email' id='exit-quiz-email' class='exit-quiz-input' placeholder='Your Email' required><input type='tel' id='exit-quiz-phone' class='exit-quiz-input' placeholder='Your Phone'></div></div>
            <div class='exit-quiz-footer'><p class='exit-quiz-progress-label'>Progress: <span id='exit-quiz-progress-value'>0%</span></p><div class='exit-quiz-progress'><div class='exit-quiz-progress-fill' id='exit-quiz-progress-fill'></div></div><p class='exit-quiz-error is-hidden' id='exit-quiz-error' role='alert'></p><div class='exit-quiz-nav'><button type='button' id='exit-quiz-back' class='exit-intent-secondary-btn is-hidden'>Back</button><button type='button' id='exit-quiz-next' class='exit-intent-primary-btn'>Next</button></div></div>
            <div class='exit-quiz-success is-hidden' id='exit-quiz-success'><h3>Thanks! Your quiz is complete.</h3><p>Look out for an email from Jordan with your next-step recommendations.</p></div>
          </div>
        </form>
      </div>
    `);
  }

  const exitQuiz = document.getElementById('exit-intent-quiz');
  if (exitQuiz) {
    const EXIT_QUIZ_ANSWERS_KEY = 'exit_quiz_answers_v1';
    const EXIT_QUIZ_LAST_SHOWN_KEY = 'exit_quiz_last_shown_at';
    const EXIT_QUIZ_COOLDOWN_MS = 120000;
    const closeTriggers = exitQuiz.querySelectorAll('[data-exit-close]');
    const panelForm = exitQuiz.querySelector('.exit-intent-panel');
    const startBtn = document.getElementById('exit-quiz-start');
    const flow = document.getElementById('exit-intent-flow');
    const cta = document.getElementById('exit-intent-step-0');
    const nextBtn = document.getElementById('exit-quiz-next');
    const backBtn = document.getElementById('exit-quiz-back');
    const skipFunnelBtn = document.getElementById('exit-quiz-skip-funnel');
    const progressFill = document.getElementById('exit-quiz-progress-fill');
    const progressValue = document.getElementById('exit-quiz-progress-value');
    const steps = Array.from(exitQuiz.querySelectorAll('.exit-quiz-step'));
    const q1Tiles = Array.from(exitQuiz.querySelectorAll('[data-step="1"] .exit-quiz-tile'));
    const goalsWrap = document.getElementById('exit-quiz-goals');
    const successEl = document.getElementById('exit-quiz-success');
    const errorEl = document.getElementById('exit-quiz-error');

    const savedAnswers = (() => {
      try { return JSON.parse(sessionStorage.getItem(EXIT_QUIZ_ANSWERS_KEY) || '{}'); } catch { return {}; }
    })();

    let hasShownQuiz = false;
    let currentStep = 1;
    const answers = {
      audience: savedAnswers.audience || '',
      goals: savedAnswers.goals || [],
      challenges: savedAnswers.challenges || [],
      traffic: savedAnswers.traffic || '',
      trafficType: savedAnswers.trafficType || 'Sessions',
      funnel: savedAnswers.funnel || '',
      name: savedAnswers.name || '',
      email: savedAnswers.email || '',
      phone: savedAnswers.phone || ''
    };

    const stepGoals = {
      Ecommerce: ['More purchases', 'Better landing pages', 'More product engagement', 'Higher order values'],
      'Lead Generation': ['Better landing page conversion rate', 'Higher form completion', 'Improved lead quality', 'More personalization']
    };

    const persistAnswers = () => sessionStorage.setItem(EXIT_QUIZ_ANSWERS_KEY, JSON.stringify(answers));
    const withinCooldown = () => Date.now() - Number(sessionStorage.getItem(EXIT_QUIZ_LAST_SHOWN_KEY) || '0') < EXIT_QUIZ_COOLDOWN_MS;
    const markShown = () => sessionStorage.setItem(EXIT_QUIZ_LAST_SHOWN_KEY, String(Date.now()));

    const openQuiz = (force = false) => {
      if (!force && withinCooldown()) return false;
      exitQuiz.classList.add('is-open');
      exitQuiz.setAttribute('aria-hidden', 'false');
      markShown();
      return true;
    };

    const closeQuiz = () => {
      exitQuiz.classList.remove('is-open');
      exitQuiz.setAttribute('aria-hidden', 'true');
    };

    const renderStepGoals = () => {
      if (!goalsWrap) return;
      const options = stepGoals[answers.audience] || stepGoals['Lead Generation'];
      goalsWrap.innerHTML = options
        .map((item) => `<label><input type='checkbox' value='${item}' ${answers.goals.includes(item) ? 'checked' : ''}> ${item}</label>`)
        .join('');
    };

    const showError = (message) => {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.classList.toggle('is-hidden', !message);
    };

    const showStep = (step) => {
      currentStep = step;
      steps.forEach((el) => el.classList.toggle('is-hidden', Number(el.dataset.step) !== step));
      successEl?.classList.add('is-hidden');
      if (progressFill) progressFill.style.width = `${Math.round(((step - 1) / 5) * 100)}%`;
      if (progressValue) progressValue.textContent = `${Math.round(((step - 1) / 5) * 100)}%`;
      backBtn?.classList.toggle('is-hidden', step < 1);
      if (nextBtn) {
        nextBtn.textContent = step === 6 ? 'Submit' : 'Next';
        nextBtn.type = step === 6 ? 'submit' : 'button';
      }
      if (step === 2) renderStepGoals();
      if (step === 3) {
        exitQuiz.querySelectorAll('[data-step="3"] input').forEach((el) => {
          el.checked = answers.challenges.includes(el.value);
        });
      }
      showError('');
    };

    const collectCurrentAnswers = () => {
      answers.goals = goalsWrap ? Array.from(goalsWrap.querySelectorAll('input:checked')).map((el) => el.value) : [];
      answers.challenges = Array.from(exitQuiz.querySelectorAll('[data-step="3"] input:checked')).map((el) => el.value);
      answers.traffic = document.getElementById('exit-quiz-traffic')?.value.trim() || '';
      answers.trafficType = document.getElementById('exit-quiz-traffic-type')?.value.trim() || 'Sessions';
      answers.funnel = document.getElementById('exit-quiz-funnel')?.value.trim() || '';
      answers.name = document.getElementById('exit-quiz-name')?.value.trim() || '';
      answers.email = document.getElementById('exit-quiz-email')?.value.trim() || '';
      answers.phone = document.getElementById('exit-quiz-phone')?.value.trim() || '';
    };

    const getValidationError = () => {
      collectCurrentAnswers();
      if (currentStep === 1 && !answers.audience) return 'Please select Ecommerce or Lead Generation.';
      if (currentStep === 2 && !answers.goals.length) return 'Please choose at least one CRO goal.';
      if (currentStep === 3 && !answers.challenges.length) return 'Please choose at least one current challenge.';
      if (currentStep === 4 && !answers.traffic) return 'Please enter your weekly traffic estimate.';
      if (currentStep === 4 && !answers.trafficType) return 'Please select traffic unit.';
      if (currentStep === 6 && !(answers.name && answers.email && answers.phone)) return 'Please enter your name, email, and phone to continue.';
      return '';
    };

    const parseTrafficValue = (value) => {
      if (!value) return null;
      const numericValue = Number(String(value).split(',').join('').trim());
      if (!Number.isFinite(numericValue)) return null;
      return Math.max(0, Math.round(numericValue));
    };

    const handleSubmitSuccess = () => {
      steps.forEach((el) => el.classList.add('is-hidden'));
      backBtn?.classList.add('is-hidden');
      nextBtn?.classList.add('is-hidden');
      if (progressFill) progressFill.style.width = '100%';
      if (progressValue) progressValue.textContent = '100%';
      successEl?.classList.remove('is-hidden');
    };

    document.addEventListener('mouseout', (event) => {
      if (!hasShownQuiz && event.clientY <= 0) hasShownQuiz = openQuiz();
    });

    let lastY = window.scrollY;
    let lastT = Date.now();
    window.addEventListener('scroll', () => {
      if (hasShownQuiz) return;
      const now = Date.now();
      const currentY = window.scrollY;
      const deltaY = currentY - lastY;
      const deltaT = now - lastT;
      if (deltaY < -75 && deltaT < 260 && lastY > 280) hasShownQuiz = openQuiz();
      lastY = currentY;
      lastT = now;
    }, { passive: true });

    startBtn?.addEventListener('click', () => {
      cta?.classList.add('is-hidden');
      flow?.classList.remove('is-hidden');
      showStep(1);
    });

    q1Tiles.forEach((btn) => {
      btn.addEventListener('click', () => {
        q1Tiles.forEach((tile) => tile.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        answers.audience = btn.dataset.value || '';
        answers.goals = [];
        persistAnswers();
      });
    });

    nextBtn?.addEventListener('click', () => {
      collectCurrentAnswers();
      persistAnswers();
      const errorMessage = getValidationError();
      if (errorMessage) {
        showError(errorMessage);
        return;
      }
      if (currentStep < 6) showStep(currentStep + 1);
    });

    panelForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (currentStep !== 6) return;
      collectCurrentAnswers();
      persistAnswers();
      const errorMessage = getValidationError();
      if (errorMessage) {
        showError(errorMessage);
        return;
      }

      const nameParts = answers.name.split(' ').filter(Boolean);
      const firstName = nameParts.shift() || null;
      const trafficValue = parseTrafficValue(answers.traffic);
      const finalPayload = {
        audience: answers.audience || null,
        goals: Array.isArray(answers.goals) ? answers.goals : [],
        challenges: Array.isArray(answers.challenges) ? answers.challenges : [],
        email: answers.email || null,
        full_name: answers.name || null,
        funnel_description: answers.funnel || null,
        phone: answers.phone || null,
        weekly_traffic_display: answers.traffic ? `${answers.traffic} ${answers.trafficType || 'Sessions'}` : null,
        weekly_traffic_unit: answers.trafficType || null,
        weekly_traffic_value: trafficValue,
        page_url: window.location.href
      };
      const requestPayload = {
        ...finalPayload,
        first_name: firstName,
        last_name: nameParts.join(' ') || null,
        consent_email: true,
        consent_sms: true,
        module_fields: { ...finalPayload },
        meta: { ...finalPayload }
      };

      try {
        if (!finalPayload.email || !finalPayload.full_name || finalPayload.weekly_traffic_value === null || !finalPayload.weekly_traffic_unit) {
          throw new Error('Missing required quiz fields for submission.');
        }
        const response = await fetch('https://sgrijnhcdpioqzzrdbem.supabase.co/functions/v1/capture-exit-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });
        const responseText = await response.text();
        if (!response.ok) throw new Error(responseText || `Supabase request failed with status ${response.status}`);
        panelForm.reset();
        handleSubmitSuccess();
      } catch (error) {
        console.error('[exit-quiz] Submit failed', error);
        showError('Something went wrong. Please review your responses and try again.');
      }
    });

    backBtn?.addEventListener('click', () => {
      if (currentStep === 1) {
        flow?.classList.add('is-hidden');
        cta?.classList.remove('is-hidden');
        backBtn?.classList.add('is-hidden');
        return;
      }
      if (currentStep > 1) showStep(currentStep - 1);
    });

    skipFunnelBtn?.addEventListener('click', () => {
      if (currentStep !== 5) return;
      answers.funnel = document.getElementById('exit-quiz-funnel')?.value.trim() || '';
      persistAnswers();
      showStep(6);
    });

    if (answers.audience) q1Tiles.find((tile) => tile.dataset.value === answers.audience)?.classList.add('is-selected');
    const trafficEl = document.getElementById('exit-quiz-traffic');
    const trafficTypeEl = document.getElementById('exit-quiz-traffic-type');
    const funnelEl = document.getElementById('exit-quiz-funnel');
    const nameEl = document.getElementById('exit-quiz-name');
    const emailEl = document.getElementById('exit-quiz-email');
    const phoneEl = document.getElementById('exit-quiz-phone');
    if (trafficEl) trafficEl.value = answers.traffic;
    if (trafficTypeEl) trafficTypeEl.value = answers.trafficType || 'Sessions';
    if (funnelEl) funnelEl.value = answers.funnel;
    if (nameEl) nameEl.value = answers.name;
    if (emailEl) emailEl.value = answers.email;
    if (phoneEl) phoneEl.value = answers.phone;

    closeTriggers.forEach((trigger) => trigger.addEventListener('click', closeQuiz));
    document.querySelectorAll('[data-open-exit-quiz]').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        if (trigger.tagName === 'A') event.preventDefault();
        if (!openQuiz(true)) return;
        cta?.classList.remove('is-hidden');
        flow?.classList.add('is-hidden');
        showStep(1);
      });
    });
  }
});

(function () {
  const BASE_PATH = '/professional-overview/';

  const normalizePath = (path) => {
    let normalized = path || '/';
    while (normalized.length > 1 && normalized.endsWith('/')) normalized = normalized.slice(0, -1);
    if (normalized.toLowerCase().endsWith('.html')) normalized = normalized.slice(0, -5);
    return normalized || '/';
  };

  const shouldLoadChatbot = () => {
    const path = normalizePath(window.location.pathname);
    const servicesRoot = normalizePath(`${BASE_PATH}services`);
    const blogRoot = normalizePath(`${BASE_PATH}blog`);
    return path === servicesRoot || path.startsWith(`${servicesRoot}/`) || path === blogRoot || path.startsWith(`${blogRoot}/`);
  };

  const assetExists = (selector, assetPath) => {
    return Array.from(document.querySelectorAll(selector)).some((el) => {
      const value = el.getAttribute('href') || el.getAttribute('src') || '';
      return value.includes(assetPath);
    });
  };

  const loadStylesheet = () => {
    if (assetExists('link[rel="stylesheet"]', '/css/chatbot.css')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${BASE_PATH}css/chatbot.css`;
    document.head.appendChild(link);
  };

  const loadScript = () => {
    if (assetExists('script[src]', '/js/chatbot.js')) return;
    const script = document.createElement('script');
    script.src = `${BASE_PATH}js/chatbot.js`;
    document.body.appendChild(script);
  };

  const loadChatbot = () => {
    if (!shouldLoadChatbot()) return;
    loadStylesheet();
    loadScript();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadChatbot);
  } else {
    loadChatbot();
  }
})();
