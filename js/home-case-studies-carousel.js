(function () {
  'use strict';

  const additionalCaseStudies = [
    {
      tag: 'Healthcare Insurance · UHOne',
      title: '$16.77M From A Connected Shopping Journey',
      description: "How capturing product intent at the top of the page reshaped UHOne's funnel and shipped 3 winners.",
      href: 'https://jordanshapiro555-lab.github.io/professional-overview/work/case-studies/uhone-2025',
      image: 'assets/case-studies/UHOne2025/img/uhone_2025-01.png',
      alt: 'UHOne 2025 case study — $16.77M from a connected shopping journey'
    },
    {
      tag: 'Education · DeVry University',
      title: '$8.75MM From Intent-to-LP Alignment',
      description: 'A 5-step query-to-LP mapping process and parallel UX testing delivered 47x ROI for DeVry.',
      href: 'https://jordanshapiro555-lab.github.io/professional-overview/work/case-studies/devry-intent-lp-alignment',
      image: 'assets/case-studies/devrypilot/img/devry_intent_lp-4.png',
      alt: 'DeVry case study — $8.75MM from intent-to-LP alignment'
    }
  ];

  function createCaseStudyCard(study) {
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <div class="card-media">
        <img src="${study.image}" alt="${study.alt}" loading="lazy">
      </div>
      <div class="card-body">
        <p class="card-tag">${study.tag}</p>
        <h3><a class="homeCaseStudyLink" href="${study.href}">${study.title}</a></h3>
        <p class="muted">${study.description}</p>
        <a class="card-link" href="${study.href}">Read the case study →</a>
      </div>
    `;
    return article;
  }

  function bindCardClick(card) {
    if (card.dataset.caseStudyCardReady === 'true') return;
    const link = card.querySelector('.card-link');
    if (!link) return;
    card.dataset.caseStudyCardReady = 'true';
    card.addEventListener('click', (event) => {
      if (!event.target.closest('a')) window.location.href = link.getAttribute('href');
    });
  }

  function buildCarousel() {
    const grid = document.querySelector('#case-studies .container > .grid.cards');
    if (!grid || grid.dataset.caseStudyCarouselReady === 'true') return null;

    additionalCaseStudies.forEach((study) => grid.appendChild(createCaseStudyCard(study)));
    grid.classList.add('home-case-study-carousel__track');
    grid.setAttribute('data-case-study-carousel-track', '');
    grid.dataset.caseStudyCarouselReady = 'true';

    const carousel = document.createElement('div');
    carousel.className = 'home-case-study-carousel';
    carousel.setAttribute('data-case-study-carousel', '');

    const prevButton = document.createElement('button');
    prevButton.className = 'home-case-study-carousel__arrow home-case-study-carousel__arrow--prev';
    prevButton.type = 'button';
    prevButton.setAttribute('aria-label', 'Previous case studies');
    prevButton.setAttribute('data-case-study-carousel-prev', '');
    prevButton.innerHTML = '<span aria-hidden="true">‹</span>';

    const viewport = document.createElement('div');
    viewport.className = 'home-case-study-carousel__viewport';
    viewport.setAttribute('data-case-study-carousel-viewport', '');
    viewport.setAttribute('aria-label', 'Case study carousel');
    viewport.tabIndex = 0;

    const nextButton = document.createElement('button');
    nextButton.className = 'home-case-study-carousel__arrow home-case-study-carousel__arrow--next';
    nextButton.type = 'button';
    nextButton.setAttribute('aria-label', 'Next case studies');
    nextButton.setAttribute('data-case-study-carousel-next', '');
    nextButton.innerHTML = '<span aria-hidden="true">›</span>';

    const dots = document.createElement('div');
    dots.className = 'home-case-study-carousel__dots';
    dots.setAttribute('aria-label', 'Case study slides');
    dots.setAttribute('data-case-study-carousel-dots', '');

    grid.parentNode.insertBefore(carousel, grid);
    viewport.appendChild(grid);
    carousel.append(prevButton, viewport, nextButton, dots);

    carousel.querySelectorAll('.card').forEach(bindCardClick);
    return carousel;
  }

  function bindCarouselNavigation(carousel) {
    if (!carousel || carousel.dataset.carouselReady === 'true') return;

    const viewport = carousel.querySelector('[data-case-study-carousel-viewport]');
    const track = carousel.querySelector('[data-case-study-carousel-track]');
    const prevButton = carousel.querySelector('[data-case-study-carousel-prev]');
    const nextButton = carousel.querySelector('[data-case-study-carousel-next]');
    const dotsWrap = carousel.querySelector('[data-case-study-carousel-dots]');
    const cards = Array.from(carousel.querySelectorAll('.card'));

    if (!viewport || !track || !prevButton || !nextButton || !dotsWrap || cards.length < 2) return;

    carousel.dataset.carouselReady = 'true';

    const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const getMaxScroll = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);

    const getScrollStep = () => {
      const firstCard = cards[0];
      const trackStyles = window.getComputedStyle(track);
      const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const scrollToPosition = (left) => {
      const maxScroll = getMaxScroll();
      viewport.scrollTo({
        left: Math.max(0, Math.min(left, maxScroll)),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    };

    const dots = cards.map((card, index) => {
      const dot = document.createElement('button');
      dot.className = 'home-case-study-carousel__dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show case study ${index + 1}`);
      dot.addEventListener('click', () => scrollToPosition(card.offsetLeft - track.offsetLeft));
      dotsWrap.appendChild(dot);
      return dot;
    });

    const updateDots = () => {
      const viewportLeft = viewport.scrollLeft;
      let activeIndex = 0;
      let smallestDistance = Infinity;

      cards.forEach((card, index) => {
        const distance = Math.abs((card.offsetLeft - track.offsetLeft) - viewportLeft);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          activeIndex = index;
        }
      });

      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };

    const moveCarousel = (direction) => {
      const maxScroll = getMaxScroll();
      if (maxScroll <= 0) return;

      const edgeBuffer = 4;
      const atStart = viewport.scrollLeft <= edgeBuffer;
      const atEnd = viewport.scrollLeft >= maxScroll - edgeBuffer;
      let nextPosition = viewport.scrollLeft + (direction * getScrollStep());

      if (direction > 0 && atEnd) nextPosition = 0;
      if (direction < 0 && atStart) nextPosition = maxScroll;
      if (nextPosition > maxScroll + edgeBuffer) nextPosition = 0;
      if (nextPosition < -edgeBuffer) nextPosition = maxScroll;

      scrollToPosition(nextPosition);
    };

    let rafId = null;
    viewport.addEventListener('scroll', () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateDots();
      });
    }, { passive: true });

    window.addEventListener('resize', updateDots);
    prevButton.addEventListener('click', () => moveCarousel(-1));
    nextButton.addEventListener('click', () => moveCarousel(1));
    updateDots();
  }

  function initHomeCaseStudyCarousel() {
    bindCarouselNavigation(buildCarousel());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeCaseStudyCarousel);
  } else {
    initHomeCaseStudyCarousel();
  }
})();
