# Jordan's CRO Studio — Project Context

This file provides project context for AI coding assistants (Codex, Copilot, etc.).
For the canonical version with identical content, see CLAUDE.md.

## Architecture

Static site hosted on GitHub Pages at `https://jordanshapiro555-lab.github.io/CRO-Consulting/`.
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
3. Open Graph tags
4. Twitter Card tags
5. Google Font: Inter with weights 300,400,600,700,800
6. Stylesheets: `css/styles.css` + page-type CSS
7. JSON-LD structured data

### Navigation
The nav is copy-pasted into every page (no server-side includes). Uses absolute URLs. Copy the nav block from an existing page of the same depth level when creating a new page.

### Footer
Also copy-pasted. Includes SVG logo, footer-nav links, copyright year span.

### Chatbot Widget
Included on most pages. Requires: `css/chatbot.css` in head, `js/config.js` and `js/chatbot.js` scripts at bottom, plus the widget HTML markup between them.

### All internal links use absolute URLs
Pattern: `https://jordanshapiro555-lab.github.io/CRO-Consulting/path`

## URL Structure

| Path pattern | Content type |
|---|---|
| `/` | Homepage |
| `/about` | About page |
| `/process` | Process overview |
| `/contact` | Contact form |
| `/blog/` | Blog index |
| `/blog/{slug}` | Blog post |
| `/work/case-studies/` | Case studies index |
| `/work/case-studies/{slug}` | Individual case study |
| `/work/test-winners/` | Test winners index |
| `/work/test-winners/{slug}` | Individual test winner |
| `/services/{slug}/` | Individual service page |

Legacy paths under `/Winners/` and `/case-studies/` 301-redirect to `/work/` (configured in `src/index.js`).

## Content Rules

See `STYLE.md` for full writing style guide. Key rules:
- Practitioner-first voice, no hedging
- 14–20 word average sentences, max 30 words
- Every H2 section needs a cited data point
- Blog posts require: 1 contrarian take, 1 test example, 1 external stat, 1 internal link, 1 closing CTA
- Banned: "leverage", "synergy", "best-in-class", "robust solution", "delve", "seamless", "game-changer"

## Backend Services

- **Cloudflare Worker** (`src/index.js`): Chat API → Anthropic, 301 redirects, static serving
- **Supabase**: Contact form capture edge function
- **Statsig**: Homepage A/B testing only

## Knowledge Base

Domain knowledge and reference data live in `.knowledge/`.
Consult `.knowledge/test-history.md` for real test data when writing content.
Consult `.knowledge/site-map.md` for site structure.
Consult `.knowledge/design-patterns.md` for HTML/CSS conventions.
