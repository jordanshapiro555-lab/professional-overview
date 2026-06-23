(function () {
  const initHomeCaseStudyCarousels = () => {
    document.querySelectorAll('[data-case-study-carousel]').forEach((carousel) => {
      if (carousel.dataset.carouselReady === 'true') return;

      const viewport = carousel.querySelector('[data-case-study-carousel-viewport]');
      const track = carousel.querySelector('[data-case-study-carousel-track]');
      const prevButton = carousel.querySelector('[data-case-study-carousel-prev]');
      const nextButton = carousel.querySelector('[data-case-study-carousel-next]');
      const cards = Array.from(carousel.querySelectorAll('.card'));

      if (!viewport || !track || !prevButton || !nextButton || cards.length < 2) return;

      carousel.dataset.carouselReady = 'true';

      const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const getScrollStep = () => {
        const firstCard = cards[0];
        const trackStyles = window.getComputedStyle(track);
        const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
        return firstCard.getBoundingClientRect().width + gap;
      };

      const getMaxScroll = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);

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

        viewport.scrollTo({
          left: Math.max(0, Math.min(nextPosition, maxScroll)),
          behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });
      };

      prevButton.addEventListener('click', () => moveCarousel(-1));
      nextButton.addEventListener('click', () => moveCarousel(1));
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeCaseStudyCarousels);
  } else {
    initHomeCaseStudyCarousels();
  }
})();
