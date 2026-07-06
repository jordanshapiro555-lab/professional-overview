# Blog — Context

## Template

Every blog post follows this structure:

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />

  <!-- SEO: title, meta description, canonical URL -->
  <!-- Open Graph: og:type "article", og:url, og:title, og:description, og:image -->
  <!-- Twitter Card: summary_large_image -->

  <!-- Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">

  <!-- Stylesheets (note relative paths from /blog/) -->
  <link rel="stylesheet" href="../css/styles.css">
  <link rel="stylesheet" href="../css/blog.css">
  <link rel="stylesheet" href="../css/chatbot.css">

  <!-- JSON-LD: @type Article, with headline, description, datePublished, author, publisher, image -->
</head>
<body>
  <!-- Nav: copy from an existing blog post (paths are absolute, no adjustment needed) -->
  <!-- <article class="blog-post"> wraps the post content -->
  <!-- Footer: copy from an existing blog post -->
  <!-- Chatbot widget: config.js + widget HTML + chatbot.js -->
  <script src="../script.js"></script>
</body>
</html>
```

## CSS paths from /blog/
Stylesheets use `../css/` prefix. Script uses `../script.js`.
Chatbot scripts: `../js/config.js` and `../js/chatbot.js`.

## Writing rules (from STYLE.md)

### Required per post
- 1 contrarian or non-obvious take in the intro
- 1 specific test example with: hypothesis, variant, metric, lift %, sample size
- 1 quote or stat from Baymard, NNG, CXL, GoodUI, or peer-reviewed source
- 1 internal link to another /blog/ post
- 1 closing CTA (audit, conversation, or subscribe)

### Voice
- Direct, practitioner-first
- First-person plural ("we tested...") for methodology
- Second-person ("you") when giving advice
- No hedging: cut "I think," "perhaps," "it could be argued"

### Sentence rules
- Average 14–20 words per sentence
- Hard cap: 30 words
- At least 1 sentence under 8 words per section

### Banned patterns
- No "In this post, we'll explore..." intros — start with the insight
- No "In conclusion" or "To summarize" closers
- Max 2 em-dashes per post
- No rhetorical questions in headings — make a claim instead

### Banned words
"leverage", "synergy", "best-in-class", "robust solution", "game-changer", "delve",
"in today's fast-paced world", "unlock", "unleash", "seamless", "moving forward",
"at the end of the day", "circle back", "low-hanging fruit"

## Existing blog posts (for internal linking)
- `/blog/5-most-common-cro-mistakes-healthcare` — Healthcare CRO mistakes
- `/blog/cro-for-ecommerce-vs-lead-gen` — Ecommerce vs lead gen CRO differences
- `/blog/ecommerce-cro-ai-shopping-agents` — AI shopping agents and ecommerce CRO
- `/blog/how-i-measure-cro-program-roi` — ROI measurement methodology
- `/blog/how-i-use-personalization-to-lift-conversion` — Personalization strategies
- `/blog/why-ab-test-win-rate-doesnt-matter` — Win rate as a misleading metric
