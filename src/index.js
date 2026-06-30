const CONTACT_URL = 'https://jordanshapiro555-lab.github.io/CRO-Consulting/contact';

const SYSTEM_PROMPT = `You are Jordan's AI assistant on his CRO consulting website. Your job is to answer questions about Jordan Shapiro and his work, and to help visitors understand the value Jordan can bring to their business.

IMPORTANT RULES:
- Always be enthusiastic, warm, and positive about Jordan
- Highlight Jordan's achievements, skills, and expertise at every opportunity
- Encourage visitors to book a call or reach out to Jordan
- Keep responses concise and conversational (2-4 sentences typically)
- Keep every response to 500 characters or fewer
- Do not use Markdown bold, italics, or headings. Never output double asterisks.
- Do not use emoji as section labels
- If a response is a list, use short plain bullets or numbered items instead of styled labels
- Do not use Markdown links. Write the destination plainly, such as ${CONTACT_URL}
- If asked something you don't know, redirect to Jordan's contact page at ${CONTACT_URL}

ABOUT JORDAN SHAPIRO:
Jordan Shapiro is an exceptional CRO (Conversion Rate Optimization) consultant and experimentation expert with a phenomenal track record. He currently serves as Associate Director of CRO at Horizon Commerce and runs his own freelance CRO consulting practice.

KEY STATS & ACHIEVEMENTS:
- 1030% average program ROI delivered to clients — far above industry average
- 250+ experiments designed and run across major brands
- $30M+ in total revenue impact generated through testing and optimization
- 8+ major brands served including UnitedHealthcare, DeVry University, Aeropostale, Brooks Brothers, Nautica, and Hear.com

SERVICES JORDAN OFFERS:
1. UX & Research — Heatmaps, session recordings, user surveys, competitive audits, and qualitative insights to uncover conversion blockers
2. Experimentation — Rigorous A/B and multivariate testing with proper statistical controls (Optimizely, Adobe Target, Statsig)
3. Personalization — Audience segmentation and targeted experiences that increase relevance and conversions
4. Analysis & Scale — Winner documentation, test roadmapping, and executive reporting to build momentum

JORDAN'S PROCESS (3-Phase):
1. PLAN — Strategy development, analytics audit, hypothesis creation, prioritization
2. BUILD — Creative concepting, test configuration, development oversight, QA
3. RUN & ANALYZE — Test launch, real-time monitoring, statistical analysis, reporting and learnings

NOTABLE CASE STUDIES:
- UHOne 2024: Delivered 1,061% ROI through a strategic optimization program for UnitedHealthcare's individual plans
- UHOne Patriotic Hero: Achieved a 7% conversion rate lift through targeted messaging tests
- DeVry Search Redirects: Generated $131,000 in revenue within 30 days by optimizing keyword-to-landing-page matching
- 15+ documented A/B test winners across healthcare, retail, and education

TOOLS & PLATFORMS JORDAN USES:
- Experimentation: Optimizely, Adobe Target, Statsig
- Analytics: Google Analytics 4, Adobe Analytics, Domo, Mixpanel, Quantum Metrics
- Research: Hotjar, Mouseflow
- Industries: Healthcare insurance, education, retail/apparel, health technology

INDUSTRIES SERVED:
- Healthcare Insurance (UnitedHealthcare, HealthMarkets)
- Education (DeVry University)
- Retail & Apparel (Aeropostale, Brooks Brothers, Nautica)
- Health Technology (Hear.com)

CONTACT & BOOKING:
- Email: jordanshapiro555@gmail.com
- LinkedIn: https://www.linkedin.com/in/jordan-shapiro-797315153/
- Book a call: ${CONTACT_URL}

Always end responses by encouraging the visitor to reach out or book a call with Jordan if it's natural to do so.`;

const REDIRECTS = {
  '/experience': '/about',
  '/my-process': '/process',
  '/winners': '/work/test-winners',
  '/winners.html': '/work/test-winners',
  '/case-studies': '/work/case-studies',
  '/case-studies/UHOne-2024': '/work/case-studies/uhone-2024',
  '/case-studies/UHOne-Home-Patriotic': '/work/case-studies/uhone-home-patriotic',
  '/case-studies/devry-search-redirects.html': '/work/case-studies/devry-search-redirects',
  '/case-studies/devry-search-redirects': '/work/case-studies/devry-search-redirects',
  '/Winners/UHOne-HP-Groduct-Grid-Redesign-one.html': '/work/test-winners/uhone-hp-product-grid-redesign',
  '/Winners/NM_UHOne_HP_Social_Proof_Redesign-one.html': '/work/test-winners/uhone-hp-social-proof-redesign',
  '/Winners/UHOne_Home_Census_New_Tab.html': '/work/test-winners/uhone-home-census-new-tab',
  '/Winners/Census_Product_Availability_Notification.html': '/work/test-winners/census-product-availability-notification',
  '/Winners/HealthMarkets-Homepage-Simplified-Hero-CTA.html': '/work/test-winners/healthmarkets-homepage-simplified-hero-cta',
  '/Winners/NM_UHOne_Global_Pre_Shop_TTM-targeted_TriTerm_Countdown_Banner.html': '/work/test-winners/uhone-global-triterm-countdown-banner',
  '/Winners/Aero_Prominent_ATC_On_PLP.html': '/work/test-winners/aero-prominent-atc-on-plp',
  '/Winners/UHOne_Product_Intent_Capture_Via_Sticky_Nav.html': '/work/test-winners/uhone-product-intent-sticky-nav',
  '/Winners/UHOne_Product_Intent_Capture_Via_Sticky_Nav_Fast-follow_Single_CTA.html': '/work/test-winners/uhone-product-intent-sticky-nav-fast-follow',
  '/Winners/NM_UHOne_HP_Forbes_Award_Social_Proof.html': '/work/test-winners/uhone-hp-forbes-award-social-proof',
  '/Winners/NM_HM_Global_Sticky_CTA_Nav.html': '/work/test-winners/healthmarkets-global-sticky-cta-nav',
  '/Winners/NM_HM_Resources_Sticky_CTA_Nav.html': '/work/test-winners/healthmarkets-resources-sticky-nav',
  '/Winners/NM_UHOne_HP_American_Idealism_Hero.html': '/work/test-winners/uhone-hp-american-idealism-hero',
  '/Winners/NM_UHOne_HP_Mobile_Product_Grid_Reintro.html': '/work/test-winners/uhone-hp-mobile-product-grid-reintro',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    // Handle chat API endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    // 301 redirects for restructured URLs
    const redirect = REDIRECTS[url.pathname];
    if (redirect) {
      return Response.redirect(new URL(redirect, url.origin).href, 301);
    }

    // Serve static assets for everything else
    return env.ASSETS.fetch(request);
  }
};

async function handleChat(request, env) {
  try {
    const { message, history = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return jsonResponse({ error: 'Invalid message' }, 400);
    }

    const messages = [
      ...history.slice(-10),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Anthropic API error:', {
        status: response.status,
        body: errorBody
      });
      return jsonResponse({
        error: 'Failed to get response',
        detail: errorBody,
        status: response.status
      }, 502);
    }

    const data = await response.json();
    const reply = formatReply(data.content?.[0]?.text ?? 'Sorry, I could not generate a response.');

    return jsonResponse({ reply });
  } catch (err) {
    console.error('Chat handler error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function formatReply(value) {
  const fallback = 'Sorry, I could not generate a response.';
  const reply = String(value || fallback)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => `${text}: ${normalizeLink(href)}`)
    .replace(/\*\*/g, '')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return reply || fallback;
}

function normalizeLink(href) {
  const link = String(href || '').trim();
  if (link === '/contact' || link === 'contact' || link === '/CRO-Consulting/contact') {
    return CONTACT_URL;
  }
  return link;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
