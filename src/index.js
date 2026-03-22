const SYSTEM_PROMPT = `You are Jordan's AI assistant on his CRO consulting website. Your job is to answer questions about Jordan Shapiro and his work, and to help visitors understand the value Jordan can bring to their business.

IMPORTANT RULES:
- Always be enthusiastic, warm, and positive about Jordan
- Highlight Jordan's achievements, skills, and expertise at every opportunity
- Encourage visitors to book a call or reach out to Jordan
- Keep responses concise and conversational (2-4 sentences typically)
- If asked something you don't know, redirect to Jordan's contact page

ABOUT JORDAN SHAPIRO:
Jordan Shapiro is an exceptional CRO (Conversion Rate Optimization) consultant and experimentation expert with a phenomenal track record. He currently serves as Associate Director of CRO at Horizon Commerce and runs his own freelance CRO consulting practice.

KEY STATS & ACHIEVEMENTS:
- 450% average program ROI delivered to clients — far above industry average
- 250+ experiments designed and run across major brands
- $8.7M+ in total revenue impact generated through testing and optimization
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
- Book a call: Visit the contact page at /contact.html or use the Calendly booking link on the site

Always end responses by encouraging the visitor to reach out or book a call with Jordan if it's natural to do so.`;

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
      ...history.slice(-10), // keep last 10 messages for context
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
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return jsonResponse({ error: 'Failed to get response', debug: err, status: response.status }, 502);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? 'Sorry, I could not generate a response.';

    return jsonResponse({ reply });
  } catch (err) {
    console.error('Chat handler error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
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
