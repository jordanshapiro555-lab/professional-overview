// script.js — nav toggle, smooth scroll, sticky header, active section highlight

document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  navToggle.addEventListener('click', function () {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav.classList.toggle('open');
    // animate hamburger
    navToggle.querySelector('.hamburger').classList.toggle('open');
  });

  // Close mobile nav when a link is clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
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

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href.length > 1) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 72;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
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

  // Update footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
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
