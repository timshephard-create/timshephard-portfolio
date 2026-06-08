// api/brief.js
// Allowlisted serverless function — builds the /hire/ project-brief prompt server-side.
// The client sends ONLY structured intake fields (validated against fixed option sets)
// plus short name/company identity strings (length-capped). No raw prompt and no model
// choice cross the wire, so this cannot be repurposed as a general-purpose Claude proxy.

const CHALLENGE = {
  'brand-overhaul': 'Brand Overhaul', 'campaign': 'Campaign Launch',
  'digital': 'Digital Presence', 'strategy': 'Strategic Direction',
  'community': 'Community & Engagement', 'content': 'Content & Production',
};
const INDUSTRY = {
  'nonprofit-cause': 'Nonprofit / Cause', 'tech-saas': 'Tech / SaaS',
  'consumer-brand': 'Consumer Brand', 'government-defense': 'Government / Defense',
  'gaming-entertainment': 'Gaming / Entertainment', 'real-estate': 'Real Estate / Construction',
};
const TIMELINE = {
  'asap': 'ASAP', '1-2months': '1–2 Months', '3-6months': '3–6 Months', 'ongoing': 'Ongoing',
};
const BUDGET = {
  'under-2k': 'Under $2,000', '2k-10k': '$2,000–$10,000', '10k-50k': '$10,000–$50,000',
  '50k-plus': '$50,000+', 'full-time': 'Full-Time Role',
};

const MAX_IDENTITY = 100; // hard cap for name / company free-text

const SYSTEM_PROMPT = `You are Tim Shephard, a Creative Director with experience spanning Olympic broadcast crews, federal communications (DHS), SaaS marketing (Ecrion Software), Hollywood production (Icon Productions), and national nonprofit brand and campaign work.

The "Recycle Like Everyone's Watching" PSA campaign Tim led directly earned 160K+ airings across all 50 states and $77.5M in earned media value. That campaign supported the wider Keep America Beautiful movement, which reached 11.9 million participants and $300M in economic impact — those are the organisation's / movement's scale, NOT numbers Tim personally generated. His Olympic and broadcast work was as production crew, not his personal audience.

Attribution rules (do NOT violate):
- 160K+ PSA airings and $77.5M earned media value → attribute to Tim's campaign directly.
- 11.9M participants and $300M economic impact → attribute to the Keep America Beautiful movement / organisation, never as Tim's personal output.
- Never frame broadcast or Olympic reach as Tim's personal audience.

A potential client just completed your intake form. Write a personalised project brief in Tim's voice — pragmatic, direct, no fluff, genuinely useful. Collaborative, not salesy. Back everything with real experience, applied accurately per the rules above.

Respond with ONLY a raw JSON object — no markdown, no backticks, no preamble:
{
  "overview": "2–3 sentences on what you understand about their situation. Sound like you've thought about their specific industry.",
  "approach": "3–4 sentences on how you'd approach this. Reference relevant experience (KAB/DHS/Ecrion/Olympics) only where genuinely applicable.",
  "investment": "1–2 sentences contextualising the budget range and whether it's realistic for the scope.",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "ctaHeadline": "Short, warm headline referencing their challenge or org",
  "ctaEmailSubject": "Email subject line pre-filled for booking a call"
}`;

function clean(s) {
  return typeof s === 'string' ? s.replace(/[\r\n]+/g, ' ').trim().slice(0, MAX_IDENTITY) : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Backstop: body must be a plain object.
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Invalid body' });
  }

  const { challenge, industry, timeline, budget, name, company } = body;

  // Required enums — reject anything not on the allowlist.
  if (!CHALLENGE[challenge] || !INDUSTRY[industry] || !TIMELINE[timeline]) {
    return res.status(400).json({ error: 'Invalid or missing brief fields' });
  }
  // Budget is optional, but if present it must be valid.
  if (budget != null && budget !== '' && !BUDGET[budget]) {
    return res.status(400).json({ error: 'Invalid budget' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server not configured' });

  const userPrompt =
    `A potential client just completed the intake form:\n` +
    `- Name: ${clean(name) || 'not provided'}\n` +
    `- Organisation: ${clean(company) || 'not provided'}\n` +
    `- Challenge: ${CHALLENGE[challenge]}\n` +
    `- Industry: ${INDUSTRY[industry]}\n` +
    `- Timeline: ${TIMELINE[timeline]}\n` +
    `- Budget: ${BUDGET[budget] || 'not specified'}\n\n` +
    `Return the JSON brief now.`;

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',   // current; the dated claude-sonnet-4-20250514 is retired
        max_tokens: 900,              // capped server-side
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!apiRes.ok) {
      console.error('Anthropic API error:', apiRes.status, await apiRes.text());
      return res.status(502).json({ error: 'Upstream error' });
    }

    const data = await apiRes.json();
    const raw = (data.content?.[0]?.text || '').replace(/```json|```/g, '').trim();

    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { return res.status(502).json({ error: 'Bad upstream format' }); }

    res.setHeader('Cache-Control', 'no-store');  // personalized; don't cache
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('brief handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
