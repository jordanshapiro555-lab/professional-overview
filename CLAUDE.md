# Jordan's CRO Studio — Project Context

## Architecture

Static site hosted on GitHub Pages at `https://jordanshapiro555-lab.github.io/professional-overview/`.
No build system, no framework, no package.json. Plain HTML + CSS + vanilla JS.
Backend: Cloudflare Worker (`src/index.js`) for the chat API and 301 redirects.
Supabase edge function for contact form capture. Statsig for A/B testing (homepage only).

## Code Organization

### JavaScript — where code lives matters

| File | Role | Scope |
|------|------|-------|
| `script.js` | Nav, dropdowns, sticky CTA, service nav rendering, page utilities | Loaded on every page |
| `js/config.js` | Shared config: site root URL, API endpoints, timeout | Loaded on pages with chatbot |
| `js/chatbot.js` | Chatbot widget logic (API calls, message rendering, suggestions) | Loaded on pages with chatbot |
| `js/home-contact-form.js` | Homepage inline contact form | Homepage only |
| `js/home-case-studies-carousel.js` | Case study card carousel | Homepage only |
| `src/index.js` | **Cloudflare Worker** — NOT browser JS. Handles `/api/chat`, 301 redirects, static asset serving | Server-side only |

**Rules:**
- Page-specific JS goes in a `<script>` tag at the bottom of that page's HTML file.
- NEVER put page-specific logic in `script.js`, `js/chatbot.js`, or `js/config.js`.
- If JS is reused on 3+ pages, it belongs in `js/` as its own file. Otherwise keep it inline.
- `src/index.js` is a Cloudflare Worker entry point. Do not import browser APIs or DOM code into it.

### CSS

| File | Role |
|------|------|
| `css/styles.css` | Global: reset, CSS variables, nav, footer, container, buttons, grid, cards, typography |
| `css/blog.css` | Blog post article layout and typography |
| `css/case-studies.css` | Case study and test winner page layout |
| `css/services.css` | Shared service page layout |
| `css/chatbot.css` | Chatbot widget styles |
| `css/cro-audit.css` | CRO Audit service page specific |
| `css/home-contact-form.css` | Homepage inline contact form |
| `css/winners.css` | Legacy winners gallery |
| `css/process-styles.css` | Process page |

**Rules:**
- No CSS-in-JS, no preprocessors, no utility-class frameworks.
- Page-type styles go in their own CSS file. Global layout/component styles go in `styles.css`.
- Never add page-specific styles to `chatbot.css` or `styles.css`.

### CSS Variables (from styles.css)
```
--bg: #ffffff
--muted: #667085
--accent: #0f6cff
--accent-2: #0b4bd8
--text: #0f1724
--radius: 12px
--container: 1100px
--gap: 24px
Header background: #D5FFFF
Brand/logo color: #00C9A7
Font: Inter (Google Fonts)
```

## HTML Patterns

### Head section — every page must include:
1. `<meta charset="utf-8">` and `<meta name="viewport">`
2. SEO: `<title>`, `<meta name="description">`, `<link rel="canonical">`
3. Open Graph tags (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`)
4. Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
5. Google Font: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">`
6. Stylesheets: `css/styles.css` + page-type CSS
7. JSON-LD structured data (schema type depends on page type)

### Navigation
The nav is copy-pasted into every page (no server-side includes). It uses absolute URLs. When creating a new page, copy the nav block from an existing page of the same type. The nav structure:
- Work (dropdown: Case Studies, Test Winners)
- Services (dropdown: CRO Audit, Personalization, Program Management, Program Up-Skilling)
- Process
- About
- Blog
- "Get in touch" CTA button → /contact

### Footer
Also copy-pasted. Includes SVG logo, footer-nav links, copyright with `<span id="year">`.

### Chatbot Widget
Included on most pages. Requires: `css/chatbot.css` in head, then at bottom of body:
```html
<script src="js/config.js"></script>
<!-- chatbot HTML widget markup -->
<script src="js/chatbot.js"></script>
```

### All internal links use absolute URLs
Pattern: `https://jordanshapiro555-lab.github.io/professional-overview/path`

## URL Structure

| Path pattern | Content type |
|---|---|
| `/` | Homepage |
| `/about` | About page |
| `/process` | Process overview |
| `/contact` | Contact form |
| `/blog/` | Blog index |
| `/blog/{slug}` | Blog post |
| `/work/` | Work landing |
| `/work/case-studies/` | Case studies index |
| `/work/case-studies/{slug}` | Individual case study |
| `/work/test-winners/` | Test winners index |
| `/work/test-winners/{slug}` | Individual test winner |
| `/services/` | Services index |
| `/services/{slug}/` | Individual service page |

Note: There are legacy paths under `/Winners/` and `/case-studies/` that 301-redirect to the `/work/` structure (configured in `src/index.js`).

## Content Rules

See `STYLE.md` for the full writing style guide. Key rules:
- Practitioner-first voice, no hedging filler
- 14–20 word average sentence length, hard cap 30 words
- Every H2 section needs a cited data point
- Every section ends with a concrete takeaway
- Banned jargon: "leverage", "synergy", "best-in-class", "robust solution", "delve", "seamless", "game-changer"
- Blog posts require: 1 contrarian take, 1 specific test example, 1 external stat, 1 internal link, 1 closing CTA

## Backend Services

### Cloudflare Worker (`src/index.js`)
- Chat API at `/api/chat` — proxies to Anthropic API (claude-haiku-4-5) with a system prompt about Jordan
- 301 redirect map for legacy URLs
- Static asset serving via `env.ASSETS`
- Requires `env.ANTHROPIC_API_KEY`

### Supabase
- Project: `professional-overview`
- Edge function: `capture-homepage-contact` (contact form submissions)
- Endpoint configured in `js/config.js`

### Statsig
- Client SDK loaded on homepage only
- Used for A/B testing hero CTA text
- Client key in inline `<script>` on index.html

## Knowledge Base

Domain knowledge and reference data live in `.knowledge/`.
When writing blog posts or case study content, consult `.knowledge/test-history.md` for real test data.
When you need site structure info, consult `.knowledge/site-map.md`.
When building new pages, consult `.knowledge/design-patterns.md` for HTML/CSS conventions.

## Maintenance Rules

When you make structural changes to this repo, update the corresponding knowledge files in the same commit:

| Change type | Update |
|---|---|
| Add/remove/rename a page | Update `.knowledge/site-map.md` |
| Add a new A/B test winner or case study | Update `.knowledge/test-history.md` |
| Add/change HTML components or CSS patterns | Update `.knowledge/design-patterns.md` |
| Add a new blog post | Add to the "Existing blog posts" list in `blog/CLAUDE.md` |
| Add a new service page | Add to the "Existing services" list in `services/CLAUDE.md` |
| Add a new test winner or case study | Add to the "Existing" lists in `work/CLAUDE.md` |
| Change URL routing or add redirects | Update `src/index.js` redirect map AND `.knowledge/site-map.md` |
| Change CSS variables or add new CSS files | Update the CSS tables in this file |
| Add/move JS files | Update the JS table in this file |

If you're unsure whether a change warrants an update, err on the side of updating.

## Known Issues — Do NOT Replicate These Patterns

The following are existing inconsistencies in the codebase. Do not copy these patterns when creating new pages. Fix them when you're already touching the affected file.

### styles.css is ~55% page-specific CSS (HIGH priority)
Approximately 1,500 of 2,705 lines in `css/styles.css` are page-specific styles that should be in their own files:
- Lines 208–214, 335–337, 427–437, 750–908: Homepage-specific classes (`.homeHeroBullet`, `.homeCaseStudyLink`, `.headshot`, `.homeContactFormSection`, brand carousel, etc.)
- Lines 439–476: Contact page form styles (`.contact-page .contact-form`, etc.)
- Lines 487–637, 909–948: Case study layout styles (`.caseStudyHeroContainer`, `.caseStudyRow*`, `.appendixImage`, `.caseStudyTallRow`) — should be in `case-studies.css`
- Lines 639–748: About/experience page carousel and hero styles
- Lines 956–1133: Process page grid styles (`.processGrid*`, `.processApproachDetails`)
- Lines 1511–1713: Additional contact page styles (`.contact-page-shell`, `.contact-hero`, etc.)
- Lines 2436–2704: Exit-intent quiz styles — homepage-specific

**Rule for new code:** never add page-specific styles to `styles.css`. Create a new CSS file or use an existing page-type file.

### script.js contains page-specific JS
Despite the rule that page-specific JS goes inline, `script.js` contains:
- Lines 208–234: About page experience dropdown logic (targets `.experience-page-carousel-wrapper`)
- Lines 236–260: Test winner detail page appendix logic (targets `.caseStudyTallRow`)
- Lines 611–661: Chatbot auto-loader that dynamically injects chatbot CSS/JS for `/services/` and `/blog/` paths

**Rule for new code:** never add page-specific logic to `script.js`. Put it in an inline `<script>` at the bottom of that page's HTML.

### Legacy URL links still in use
`index.html` and `process.html` link to legacy paths instead of canonical `/work/` paths:
- `index.html`: links to `/case-studies/UHOne-2024`, `/case-studies/UHOne-Home-Patriotic`, `/case-studies/devry-search-redirects.html`, `/winners`, `/my-process`
- `process.html` line 127: links to `/case-studies` instead of `/work/case-studies`
- 3 case study pages have legacy paths in their JSON-LD `url` fields (uhone-2024, uhone-home-patriotic, devry-search-redirects)
- Homepage brand link uses `href="#"` instead of the absolute homepage URL

### Chatbot widget inclusion is inconsistent
Three different delivery mechanisms exist:
1. **Explicit inclusion** (12 pages): chatbot.css `<link>` + widget HTML + chatbot.js `<script>` — this is the correct pattern
2. **Auto-loader** (blog + some service pages): `script.js` dynamically injects chatbot for `/services/` and `/blog/` paths at runtime
3. **Partial inclusion** (several pages): load chatbot.css but have no widget HTML or JS — dead CSS weight

Individual case study and test winner detail pages have NO chatbot at all.

**Rule for new code:** use explicit inclusion (pattern #1) — do not rely on the auto-loader.

### Service pages: nav missing SVG, footer has reduced links
All 7 service pages have:
- Nav brand with text-only "Jordan's CRO Studio" — no conversion funnel SVG logo
- Reduced footer with only 4 links (Services, Work, Blog, Contact) — missing Process, About, LinkedIn, Email, and the SVG logo

New service pages should copy the full nav and footer from a non-service page (e.g., `about.html`).

### Service pages load each other's CSS
Personalization, program-management, program-up-skilling, and keyword-analysis pages all load `cro-audit.css` and `cro-audit-mobile-feedback.css` — CSS files specific to the CRO Audit page. These likely share some component styles but the pattern is confusing.

### Case study pages don't load case-studies.css
Individual case study pages (uhone-2024, uhone-2025, devry-search-redirects, devry-intent-lp-alignment) load only `styles.css` and rely on the page-specific styles embedded in `styles.css`. They should load `case-studies.css` instead.

### SEO meta gaps
- `about.html`, `contact.html`, `process.html`: missing Twitter Card tags
- `contact.html`, `work/index.html`, `work/test-winners/index.html`: missing JSON-LD structured data
- 16 of 18 test winner detail pages: missing Twitter Card tags
- All 5 case study pages: missing Twitter Card tags
- All 18 test winner pages: missing JSON-LD
- `blog/ecommerce-cro-ai-shopping-agents.html`: canonical URL ends with `.html` (inconsistent with other blog posts)
- `services/seo-technical-page-speed-audit/`: canonical URL has trailing slash (inconsistent with other service pages)

### Orphan page
`custom-contact-form.html` has no `<head>`, no nav, no footer, no stylesheets — completely outside all site conventions.
