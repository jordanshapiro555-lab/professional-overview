# Design Patterns

HTML and CSS conventions used across the site. Reference when building new pages.

## Page Shell

Every page follows this structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <!-- SEO meta tags -->
  <!-- OG + Twitter Card tags -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="[path]/css/styles.css">
  <!-- Page-type CSS -->
  <!-- JSON-LD structured data -->
</head>
<body>
  <header class="site-header" id="site-header">...</header>
  <main>...</main>
  <!-- Calendly CTA section (on pages with CTA) -->
  <footer class="site-footer">...</footer>
  <!-- Sticky CTA (on pages that use it) -->
  <!-- Chatbot widget (on most pages) -->
  <script src="[path]/script.js"></script>
</body>
</html>
```

## Relative Path Prefixes by Depth

| Page location | CSS/JS prefix |
|---|---|
| Root (`index.html`, `about.html`) | `css/`, `script.js` |
| One deep (`blog/*.html`) | `../css/`, `../script.js` |
| Two deep (`work/case-studies/*.html`, `services/*/index.html`) | `../../css/`, `../../script.js` |

## Component Patterns

### Section Eyebrow
```html
<p class="section-eyebrow">Label Text</p>
```
Used above `<h2>` headings to categorize sections.

### Hero Section
```html
<section class="hero [pageHero]">
  <div class="container hero-grid">
    <div class="hero-copy">
      <h1>Headline</h1>
      <p class="hero-subhead">Subheadline</p>
      <div class="hero-ctas">
        <a class="btn btn-primary" href="...">Primary CTA</a>
        <a class="btn btn-ghost" href="...">Secondary CTA</a>
      </div>
    </div>
    <div class="hero-media">...</div>
  </div>
</section>
```

### Card Grid
```html
<div class="grid cards">
  <article class="card">
    <div class="card-media"><img ...></div>
    <div class="card-body">
      <p class="card-tag">Category · Client</p>
      <h3><a href="...">Title</a></h3>
      <p class="muted">Description</p>
      <a class="card-link" href="...">Read more →</a>
    </div>
  </article>
</div>
```

### Service Card Grid
```html
<div class="grid services-grid">
  <a href="..." class="service-card">
    <div class="service-card-icon" aria-hidden="true">🔬</div>
    <h3 class="service-card-title">Service Name <span aria-hidden="true">→</span></h3>
    <p class="service-card-desc">Description text.</p>
  </a>
</div>
```

### FAQ Accordion
```html
<div class="faq-list" itemscope itemtype="https://schema.org/FAQPage">
  <details class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <summary class="faq-question" itemprop="name">Question text?</summary>
    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">Answer text.</p>
    </div>
  </details>
</div>
```

### Buttons
- Primary: `<a class="btn btn-primary" href="...">Label</a>`
- Ghost: `<a class="btn btn-ghost" href="...">Label →</a>`
- Arrows use `<span aria-hidden="true">→</span>`

### Breadcrumb
```html
<nav class="breadcrumb-nav" aria-label="Breadcrumb">
  <ol class="breadcrumb-list">
    <li><a href="...">Home</a></li>
    <li><a href="...">Section</a></li>
    <li aria-current="page">Current Page</li>
  </ol>
</nav>
```

### Calendly CTA
```html
<section class="calendly-cta">
  <div class="container calendly-cta-inner">
    <h2>Ready to grow your conversions?</h2>
    <p>Book a free 30-minute strategy call — directly on my calendar.</p>
    <a href="https://calendly.com/jas692" target="_blank" rel="noopener" class="btn-calendly">
      Schedule a call <span aria-hidden="true">→</span>
    </a>
  </div>
</section>
```

### Sticky Floating CTA
```html
<div id="sticky-cta" class="sticky-cta" aria-label="Quick contact">
  <a href=".../contact" class="btn btn-primary sticky-cta-btn">
    Let's talk <span aria-hidden="true">→</span>
  </a>
</div>
```

## JSON-LD Patterns

### Homepage: Person + ProfessionalService + FAQPage
### Blog post: Article with headline, datePublished, author, publisher, image
### Service page: Service + FAQPage in @graph
### Case study: Article with headline, description, author, publisher

## SVG Logo
The conversion funnel logo SVG is embedded inline in both header and footer.
It uses a gradient ID — when copy-pasting, use `hdr-conv-glow` for header and `ftr-conv-glow` for footer to avoid ID collisions.
