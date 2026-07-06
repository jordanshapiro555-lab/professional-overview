# Work Section — Context

This directory contains case studies and test winners under two subdirectories.

## Case Studies (`case-studies/`)

### Template
```
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- charset, viewport -->
  <!-- SEO: title includes client name + key metric, meta description, canonical -->
  <!-- Open Graph: type "article" -->
  <!-- JSON-LD: @type Article, headline, description, author (Jordan Shapiro) -->
  <!-- Google Font: Inter -->
  <!-- Stylesheet: ../../css/styles.css (note: two levels up) -->
</head>
<body>
  <!-- Nav: copy from existing case study (absolute URLs, no adjustment needed) -->
  <!-- Main content -->
  <!-- Footer -->
  <script src="../../script.js"></script>
</body>
</html>
```

### Content structure for case studies
1. Hero with client name, key metric, and vertical tag
2. Challenge / business context
3. Approach / methodology used
4. Key test(s) with hypothesis, variant description, metric, lift, sample size
5. Results summary with revenue impact
6. Takeaway or pattern identified

### Existing case studies
- `uhone-2024.html` — UHOne 1061% ROI, $8.7M revenue (includes case-studies.css... some don't)
- `uhone-2025.html` — UHOne 2025 program
- `uhone-home-patriotic.html` — UHOne +7% CVR via patriotic hero messaging
- `devry-search-redirects.html` — DeVry $131K in 30 days from keyword redirects
- `devry-intent-lp-alignment.html` — DeVry intent-to-LP matching

## Test Winners (`test-winners/`)

### Template
```
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- charset, viewport -->
  <!-- title: "[Lift %] [Metric] Via [Test Name]" -->
  <!-- Google Font: Inter -->
  <!-- Stylesheets: ../../css/styles.css + ../../css/case-studies.css -->
</head>
<body>
  <!-- Nav: copy from existing test winner -->
  <!-- Main content: test details, screenshots, results -->
  <!-- Footer -->
  <script src="../../script.js"></script>
</body>
</html>
```

### Content structure for test winners
1. Title with metric lift and test name
2. Context / hypothesis
3. Control vs variant screenshots or descriptions
4. Results: primary metric, lift %, confidence interval, sample size, duration
5. Next steps or follow-on test (if applicable)

### CSS paths from work/ subdirectories
Files are two levels deep (e.g., `/work/test-winners/slug.html`), so CSS uses `../../css/` prefix.

## Image assets
- Case study images: `assets/case-studies/` and `assets/miniCases/`
- Test winner screenshots: `assets/winners/`
- Process assets: `assets/process-assets/`
