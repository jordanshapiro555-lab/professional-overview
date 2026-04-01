// script.js — nav toggle, smooth scroll, sticky header, active section highlight

document.addEventListener('DOMContentLoaded', function () {
  const isContactPage = /(^|\/)contact(?:\.html)?$/.test(window.location.pathname);

  // Desktop secondary quiz CTA in sticky nav
  const isMobileViewport = () => window.matchMedia('(max-width: 700px)').matches;
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

  // Mobile sticky CTA banner across pages
  if (!isContactPage && !document.getElementById('mobile-sticky-banner')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="mobile-sticky-banner" id="mobile-sticky-banner" aria-label="Primary actions">
        <a class="btn btn-primary mobile-sticky-banner__cta" href="https://jordanshapiro555-lab.github.io/CRO-Consulting/contact">Work with me</a>
        <button type="button" class="btn btn-ghost mobile-sticky-banner__cta" data-open-exit-quiz="true">Take the CRO quiz</button>
      </div>
    `);
    document.body.classList.add('has-mobile-sticky-banner');
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const mobileStickyBanner = document.getElementById('mobile-sticky-banner');

  const syncMobileBannerWithNav = () => {
    if (!mobileStickyBanner || !mainNav) return;
    const navIsOpen = mainNav.classList.contains('open');
    mobileStickyBanner.classList.toggle('is-hidden', navIsOpen);
  };
  syncMobileBannerWithNav();

  navToggle.addEventListener('click', function () {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav.classList.toggle('open');
    syncMobileBannerWithNav();
    // animate hamburger
    navToggle.querySelector('.hamburger').classList.toggle('open');
  });

  // Mobile Work dropdown toggle (chevron button)
  document.querySelectorAll('.nav-dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const item = btn.closest('.nav-item-dropdown');
      const expanded = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(expanded));
    });
  });

  // Close mobile nav when a nav-link is clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        syncMobileBannerWithNav();
      }
    });
  });

  // Sticky header shadow on scroll
  const header = document.getElementById('site-header');
  const hero = document.querySelector('.hero');
  const heroBottom = hero ? (hero.getBoundingClientRect().height - 48) : 100;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 8) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Smooth scrolling for same-page hash links
  document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const rawHref = this.getAttribute('href');
      if (!rawHref || rawHref === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      let url;
      try {
        url = new URL(rawHref, window.location.href);
      } catch {
        return;
      }

      const isSamePage =
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname;

      if (!isSamePage || !url.hash) return;

      const targetId = decodeURIComponent(url.hash.slice(1));
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const y = targetEl.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', `#${encodeURIComponent(targetId)}`);
    });
  });

  // Highlight active nav link using IntersectionObserver
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const obsOptions = { root: null, rootMargin: '0px', threshold: 0.45 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      }
    });
  }, obsOptions);

  sections.forEach(s => observer.observe(s));

  // Make case study cards fully clickable
  document.querySelectorAll('.cards .card').forEach(function (card) {
    var link = card.querySelector('.card-link');
    if (!link) return;
    card.addEventListener('click', function (e) {
      if (!e.target.closest('a')) {
        window.location.href = link.getAttribute('href');
      }
    });
  });

  // Update footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Sticky floating CTA ──
  const stickyCta = document.getElementById('sticky-cta');
  const heroSection = document.querySelector('.hero');
  const footerEl = document.querySelector('.site-footer');
  if (stickyCta) {
    const checkSticky = () => {
      const footerTop = footerEl ? footerEl.getBoundingClientRect().top : window.innerHeight;
      const nearFooter = footerTop <= window.innerHeight * 0.6;
      let pastThreshold;
      if (heroSection) {
        pastThreshold = heroSection.getBoundingClientRect().bottom < 0;
      } else {
        pastThreshold = window.scrollY > 300;
      }
      if (pastThreshold && !nearFooter) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }
    };
    window.addEventListener('scroll', checkSticky, { passive: true });
  }

  // ── Count-up animation for stats strip ──
  const statsStrip = document.querySelector('.stats-strip');
  if (statsStrip) {
    let fired = false;
    const runCounters = () => {
      statsStrip.querySelectorAll('.count[data-to]').forEach(el => {
        const target = parseFloat(el.dataset.to);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        if (isNaN(target)) return;
        const duration = 1400;
        let startTime = null;
        const step = (ts) => {
          if (!startTime) startTime = ts;
          const progress = Math.min((ts - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired) { fired = true; runCounters(); }
    }, { threshold: 0.5 }).observe(statsStrip);
  }

  // ── Exit intent fly-in quiz ──
  if (!isContactPage && !document.getElementById('exit-intent-quiz')) {
    const quizTemplate = `
      <div id="exit-intent-quiz" class="exit-intent-quiz" role="dialog" aria-modal="true" aria-labelledby="exit-quiz-title" aria-hidden="true">
        <div class="exit-intent-overlay" data-exit-close></div>
        <form class="exit-intent-panel">
          <button class="exit-intent-close" type="button" aria-label="Close popup" data-exit-close>×</button>
          <div class="exit-intent-cta" id="exit-intent-step-0">
            <div class="exit-intent-top-bar"></div>
            <div class="exit-intent-cta-content">
              <h2 id="exit-quiz-title">Free CRO needs quiz</h2>
              <p>Find out what you need to improve your site</p>
              <button class="exit-intent-primary-btn" type="button" id="exit-quiz-start">Take the quiz</button>
            </div>
          </div>
          <div class="exit-intent-quiz-flow is-hidden" id="exit-intent-flow">
            <div class="exit-quiz-header">Let's Get Started!</div>
            <div class="exit-quiz-step" data-step="1">
              <p class="exit-quiz-question">What kind of funnel do you have?</p>
              <div class="exit-quiz-options-grid">
                <button type="button" class="exit-quiz-tile" data-value="Ecommerce">Ecommerce</button>
                <button type="button" class="exit-quiz-tile" data-value="Lead Generation">Lead Generation</button>
              </div>
            </div>
            <div class="exit-quiz-step is-hidden" data-step="2">
              <p class="exit-quiz-question">What are you hoping to get out of a CRO consultant? <strong>(Select all that apply)</strong></p>
              <div id="exit-quiz-goals" class="exit-quiz-checks"></div>
            </div>
            <div class="exit-quiz-step is-hidden" data-step="3">
              <p class="exit-quiz-question">Where are you struggling today? <strong>(Select all that apply)</strong></p>
              <div class="exit-quiz-checks">
                <label><input type="checkbox" value="Strategy"> Strategy</label>
                <label><input type="checkbox" value="Idea Generation"> Idea Generation</label>
                <label><input type="checkbox" value="Design"> Design</label>
                <label><input type="checkbox" value="Development"> Development</label>
                <label><input type="checkbox" value="Tracking"> Tracking</label>
                <label><input type="checkbox" value="Analysis"> Analysis</label>
              </div>
            </div>
            <div class="exit-quiz-step is-hidden" data-step="4">
              <p class="exit-quiz-question">Approximately how much traffic goes to your site weekly?</p>
              <div class="exit-quiz-traffic-row">
                <input type="number" id="exit-quiz-traffic" class="exit-quiz-input" placeholder="100000" value="100000" min="0" step="1">
                <select id="exit-quiz-traffic-type" class="exit-quiz-input exit-quiz-select" aria-label="Traffic unit">
                  <option value="Users">Users</option>
                  <option value="Sessions" selected>Sessions</option>
                </select>
              </div>
            </div>
            <div class="exit-quiz-step is-hidden" data-step="5">
              <p class="exit-quiz-question">Optional: Describe your funnel below:</p>
              <textarea id="exit-quiz-funnel" class="exit-quiz-textarea" rows="4" placeholder="Describe your funnel and where you're seeing the biggest drop-off..."></textarea>
              <button class="exit-quiz-skip" id="exit-quiz-skip-funnel" type="button">Skip this question</button>
            </div>
            <div class="exit-quiz-step is-hidden" data-step="6">
              <p class="exit-quiz-question">Get your free consultation summary:</p>
              <div class="exit-quiz-form">
                <input type="text" id="exit-quiz-name" class="exit-quiz-input" placeholder="Your Name" required>
                <input type="email" id="exit-quiz-email" class="exit-quiz-input" placeholder="Your Email" required>
                <input type="tel" id="exit-quiz-phone" class="exit-quiz-input" placeholder="Your Phone">
              </div>
            </div>
            <div class="exit-quiz-footer">
              <p class="exit-quiz-progress-label">Progress: <span id="exit-quiz-progress-value">0%</span></p>
              <div class="exit-quiz-progress"><div class="exit-quiz-progress-fill" id="exit-quiz-progress-fill"></div></div>
              <p class="exit-quiz-error is-hidden" id="exit-quiz-error" role="alert"></p>
              <div class="exit-quiz-nav">
                <button type="button" id="exit-quiz-back" class="exit-intent-secondary-btn is-hidden">Back</button>
                <button type="button" id="exit-quiz-next" class="exit-intent-primary-btn">Next</button>
              </div>
            </div>
            <div class="exit-quiz-success is-hidden" id="exit-quiz-success">
              <h3>Thanks! Your quiz is complete.</h3>
              <p>Look out for an email from Jordan with your next-step recommendations.</p>
            </div>
          </div>
        </form>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', quizTemplate);
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
      try {
        return JSON.parse(sessionStorage.getItem(EXIT_QUIZ_ANSWERS_KEY) || '{}');
      } catch {
        return {};
      }
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
      Ecommerce: [
        'More purchases',
        'Better landing pages',
        'More product engagement',
        'Higher order values'
      ],
      'Lead Generation': [
        'Better landing page conversion rate',
        'Higher form completion',
        'Improved lead quality',
        'More personalization'
      ]
    };

    const persistAnswers = () => {
      sessionStorage.setItem(EXIT_QUIZ_ANSWERS_KEY, JSON.stringify(answers));
    };

    const withinCooldown = () => {
      const lastShown = Number(sessionStorage.getItem(EXIT_QUIZ_LAST_SHOWN_KEY) || '0');
      return Date.now() - lastShown < EXIT_QUIZ_COOLDOWN_MS;
    };

    const markShown = () => {
      sessionStorage.setItem(EXIT_QUIZ_LAST_SHOWN_KEY, String(Date.now()));
    };

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
        .map((item) => `<label><input type="checkbox" value="${item}" ${answers.goals.includes(item) ? 'checked' : ''}> ${item}</label>`)
        .join('');
    };

    const showStep = (step) => {
      currentStep = step;
      steps.forEach((el) => el.classList.toggle('is-hidden', Number(el.dataset.step) !== step));
      successEl?.classList.add('is-hidden');

      const progress = Math.round(((step - 1) / 5) * 100);
      progressFill.style.width = `${progress}%`;
      progressValue.textContent = `${progress}%`;
      const showBack = step >= 1;
      backBtn?.classList.toggle('is-hidden', !showBack);

      if (nextBtn) {
        nextBtn.textContent = step === 6 ? 'Submit' : 'Next';
        nextBtn.type = step === 6 ? 'submit' : 'button';
      }

      if (step === 2) {
        renderStepGoals();
      }
      if (step === 3) {
        exitQuiz.querySelectorAll('[data-step="3"] input').forEach((el) => {
          el.checked = answers.challenges.includes(el.value);
        });
      }
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('is-hidden');
      }
    };

    const getValidationError = () => {
      if (currentStep === 1 && !answers.audience) return 'Please select Ecommerce or Lead Generation.';
      if (currentStep === 2 && !goalsWrap.querySelector('input:checked')) return 'Please choose at least one CRO goal.';
      if (currentStep === 3) {
        if (!exitQuiz.querySelector('[data-step="3"] input:checked')) return 'Please choose at least one current challenge.';
      }
      if (currentStep === 4) {
        const trafficValue = document.getElementById('exit-quiz-traffic')?.value.trim();
        if (!trafficValue) return 'Please enter your weekly traffic estimate.';
        const trafficTypeValue = document.getElementById('exit-quiz-traffic-type')?.value.trim();
        if (!trafficTypeValue) return 'Please select traffic unit.';
      }
      if (currentStep === 6) {
        const name = document.getElementById('exit-quiz-name')?.value.trim();
        const email = document.getElementById('exit-quiz-email')?.value.trim();
        const phone = document.getElementById('exit-quiz-phone')?.value.trim();
        if (!(name && email && phone)) return 'Please enter your name, email, and phone to continue.';
      }
      return '';
    };

    const handleSubmitSuccess = () => {
      const selectedGoals = Array.from(goalsWrap.querySelectorAll('input:checked')).map((el) => el.value);
      answers.goals = selectedGoals;
      steps.forEach((el) => el.classList.add('is-hidden'));
      backBtn?.classList.add('is-hidden');
      nextBtn?.classList.add('is-hidden');
      progressFill.style.width = '100%';
      progressValue.textContent = '100%';
      successEl?.classList.remove('is-hidden');
    };

    const parseUTM = () => {
      const url = new URL(window.location.href);
      const out = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((k) => {
        const v = url.searchParams.get(k);
        if (v) out[k] = v;
      });
      return Object.keys(out).length ? out : null;
    };

    document.addEventListener('mouseout', (e) => {
      if (hasShownQuiz) return;
      if (e.clientY <= 0) {
        hasShownQuiz = openQuiz();
      }
    });

    let lastY = window.scrollY;
    let lastT = Date.now();
    window.addEventListener('scroll', () => {
      if (hasShownQuiz) return;
      const now = Date.now();
      const currentY = window.scrollY;
      const deltaY = currentY - lastY;
      const deltaT = now - lastT;
      const fastUpward = deltaY < -75 && deltaT < 260 && lastY > 280;
      if (fastUpward) {
        hasShownQuiz = openQuiz();
      }
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
        persistAnswers();
      });
    });

    nextBtn?.addEventListener('click', () => {
      if (currentStep === 2) {
        answers.goals = Array.from(goalsWrap.querySelectorAll('input:checked')).map((el) => el.value);
      }
      if (currentStep === 3) {
        answers.challenges = Array.from(exitQuiz.querySelectorAll('[data-step="3"] input:checked')).map((el) => el.value);
      }
      if (currentStep === 4) {
        answers.traffic = document.getElementById('exit-quiz-traffic')?.value.trim() || '';
        answers.trafficType = document.getElementById('exit-quiz-traffic-type')?.value.trim() || 'Sessions';
      }
      if (currentStep === 5) {
        answers.funnel = document.getElementById('exit-quiz-funnel')?.value.trim() || '';
      }
      if (currentStep === 6) {
        answers.name = document.getElementById('exit-quiz-name')?.value.trim() || '';
        answers.email = document.getElementById('exit-quiz-email')?.value.trim() || '';
        answers.phone = document.getElementById('exit-quiz-phone')?.value.trim() || '';
      }
      persistAnswers();

      const errorMessage = getValidationError();
      if (errorMessage) {
        if (errorEl) {
          errorEl.textContent = errorMessage;
          errorEl.classList.remove('is-hidden');
        }
        return;
      }
      if (currentStep < 6) {
        showStep(currentStep + 1);
      }
    });

    panelForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (currentStep !== 6) return;

      answers.name = document.getElementById('exit-quiz-name')?.value.trim() || '';
      answers.email = document.getElementById('exit-quiz-email')?.value.trim() || '';
      answers.phone = document.getElementById('exit-quiz-phone')?.value.trim() || '';
      persistAnswers();

      const errorMessage = getValidationError();
      if (errorMessage) {
        if (errorEl) {
          errorEl.textContent = errorMessage;
          errorEl.classList.remove('is-hidden');
        }
        return;
      }

      const [firstName, ...rest] = answers.name.split(/\s+/).filter(Boolean);
      const payload = {
        email: answers.email,
        first_name: firstName || null,
        last_name: rest.join(' ') || null,
        consent_email: true,
        consented_at: new Date().toISOString(),
        page_url: window.location.href,
        referrer: document.referrer || null,
        utm: parseUTM(),
        meta: {
          user_agent: navigator.userAgent,
          language: navigator.language,
          phone: answers.phone || null,
          audience: answers.audience || null,
          goals: answers.goals || [],
          challenges: answers.challenges || [],
          traffic: answers.traffic ? `${answers.traffic} ${answers.trafficType || 'Sessions'}` : null,
          traffic_value: answers.traffic || null,
          traffic_type: answers.trafficType || null,
          funnel: answers.funnel || null
        }
      };

      try {
        const resp = await fetch("https://sgrijnhcdpioqzzrdbem.supabase.co/functions/v1/capture-exit-intent", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) throw new Error(await resp.text());

        panelForm.reset();
        handleSubmitSuccess();
      } catch (err) {
        console.error(err);
        if (errorEl) {
          errorEl.textContent = 'Something went wrong.';
          errorEl.classList.remove('is-hidden');
        } else {
          alert('Something went wrong.');
        }
      }
    });

    backBtn?.addEventListener('click', () => {
      if (currentStep === 1) {
        flow?.classList.add('is-hidden');
        cta?.classList.remove('is-hidden');
        backBtn?.classList.add('is-hidden');
      } else if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    });

    skipFunnelBtn?.addEventListener('click', () => {
      if (currentStep === 5) {
        answers.funnel = document.getElementById('exit-quiz-funnel')?.value.trim() || '';
        persistAnswers();
        showStep(6);
      }
    });

    // hydrate saved values
    if (answers.audience) {
      q1Tiles.find((tile) => tile.dataset.value === answers.audience)?.classList.add('is-selected');
    }
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

    document.querySelectorAll('[data-open-exit-quiz="true"]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        if (trigger.tagName === 'A') e.preventDefault();
        const opened = openQuiz(true);
        if (!opened) return;
        cta?.classList.remove('is-hidden');
        flow?.classList.add('is-hidden');
        showStep(1);
      });
    });
  }
});


// Experience Page Hero
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".experienceHero_imgCard");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fadeInUp");
        }
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach((card) => observer.observe(card));
});

// Experience Page Dropdown
// Experience Page Dropdown
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const experienceDropdown = document.querySelector(".experienceDropdown");
    const experienceDropdownButton = document.getElementById("experienceDropdownButton");

    if (!experienceDropdown || !experienceDropdownButton) return;

    function scrollWithOffset() {
      const selectedValue = experienceDropdown.value;
      if (!selectedValue) return;

      const targetId = `${selectedValue}Experience`;
      const targetEl = document.getElementById(targetId);

      if (!targetEl) return;

      const yOffset = -70;
      const y =
        targetEl.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });

      // Optional: update URL without jumping
      history.replaceState(null, "", `#${targetId}`);
    }

    experienceDropdownButton.addEventListener("click", scrollWithOffset);
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const contentHTML = `
    <div class="caseStudyRow1">
      <img class="strategicPlanningRowContainerImage"
           src="assets/process-assets/KPIsByFunnelStage.png"
           style="width:50%; float:left; padding-right:32px;">
      <div class="rowContentCopy">
        <p>In 2024, site analytics, survey data, industry trends, and competitive auditing produced 4 key strategic pillars for optimizing the UHOne site:</p>
        <ol>
          <li><strong>TriTerm promotion:</strong> Selling TriTerm, UHOne's highest margin product, prior to its sunset</li>
          <li><strong>Conecting UHOne:</strong> Ensuring a seamless experience from beginning to end of funnel</li>
          <li><strong>Design &amp; UX:</strong> General design optimization</li>
          <li><strong>New vs Return Personalization:</strong> Tailoring content and functionality to user intent and previous interactions</li>
        </ol>
      </div>
    </div>
  `;


});
