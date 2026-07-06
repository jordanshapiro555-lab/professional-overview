# Services — Context

## Structure
Each service lives in its own subdirectory as `index.html` (e.g., `/services/cro-audit/index.html`).

## Template
```
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- charset, viewport -->
  <!-- SEO: title "[Service] | Jordan Shapiro", meta description, canonical -->
  <!-- Open Graph + Twitter Card -->
  <!-- Google Font: Inter -->
  <!-- Stylesheets: ../../css/styles.css + ../../css/services.css + [service-specific].css + ../../css/chatbot.css -->
  <!-- JSON-LD: @graph with @type Service and optional FAQPage -->
</head>
<body>
  <!-- Nav with class="active" on Services link -->
  <!-- Breadcrumb: Home > Services > [Service Name] -->
  <main class="[service]-page">
    <!-- Hero section with eyebrow, h1, lead paragraph, CTA row -->
    <!-- Value proposition section (tabs or cards) -->
    <!-- Deliverables section (numbered list) -->
    <!-- Social proof / case study reference -->
    <!-- FAQ section -->
    <!-- CTA section -->
  </main>
  <!-- Footer -->
  <!-- Chatbot widget -->
  <script src="../../script.js"></script>
</body>
</html>
```

## CSS paths
Service pages are two levels deep, so: `../../css/styles.css`, `../../css/services.css`.

## Existing services
- `cro-audit/` — CRO Audit (uses cro-audit.css + cro-audit-mobile-feedback.css)
- `personalization/` — Personalization
- `program-management/` — Program Management (experimentation)
- `program-up-skilling/` — Program Up-Skilling (analysis & scale)
- `keyword-analysis-and-mapping/` — Keyword Analysis & Mapping
- `seo-technical-page-speed-audit/` — SEO Technical Page Speed Audit

## Common patterns
- Breadcrumb nav: `<nav class="breadcrumb-nav">` with `<ol class="breadcrumb-list">`
- Section eyebrow: `<p class="section-eyebrow">Label</p>`
- CTA row: primary button + ghost button (download or secondary action)
- Tab panels for value proposition: `role="tablist"` with `role="tab"` buttons and `role="tabpanel"` articles
- Deliverables: numbered `.deliverable-item` articles with `.deliverable-icon`
