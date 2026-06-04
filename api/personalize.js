// api/personalize.js
// Vercel serverless function — proxies the CYOA personalization call to Claude.
// The ANTHROPIC_API_KEY lives as a Vercel environment variable, never in the client bundle.
//
// Security model: the client sends ONLY a path key + followup key. This function validates
// them against a fixed allowlist and builds the prompt server-side. There is no free-text
// input, so the endpoint cannot be abused as a general-purpose Claude proxy — the worst a
// direct caller can do is retrieve one of 12 portfolio blurbs.

const PATHS = {
  recruiter: { label: "Looking for a creative leader" },
  brand:     { label: "Has a brand problem to solve" },
  agency:    { label: "Exploring a partnership" },
  curious:   { label: "Arrived via a shared link" },
};

const FOLLOWUPS = {
  recruiter: {
    scale: "Wants someone who can lead at scale",
    ai:    "Wants a creative who genuinely understands AI",
    brand: "Wants a proven brand-building track record",
  },
  brand: {
    clarity:  "Knows what they do but not how to articulate it",
    campaign: "Needs a full campaign, not just a logo",
    reach:    "Is invisible and needs market presence",
  },
  agency: {
    whiteLbl: "Wants white-label creative capacity",
    consult:  "Wants strategic creative consulting",
    aitools:  "Wants AI-powered creative tools or systems",
  },
  curious: {
    story:    "Wants the full origin story",
    work:     "Just wants to see the work",
    ventures: "Wants the entrepreneurship angle",
  },
};

const SYSTEM_PROMPT = `You are the voice of Tim Shephard's portfolio. Tim is a Senior Creative Director based in Dallas–Fort Worth with 15+ years leading national campaigns, federal communications, global broadcast production, and SaaS brand strategy. His signature achievement is leading communications for the Keep America Beautiful PSA campaign. He now builds AI-powered ventures through Creative Mind Ventures LLC.

Voice: direct, warm, confident, never salesy. Write like a thoughtful person, not a brand deck. Refer to Tim in the third person.

Stat attribution rules (do NOT violate):
- Tim personally led the KAB PSA campaign: 160K+ PSA airings and $77.5M earned media value can be attributed to him directly.
- The 11.9M participants / $300M economic impact / 20,000+ partners are KAB ORGANIZATIONAL/movement scale — describe them as what the campaign or movement reached, never as numbers Tim personally generated.
- Broadcast work was as production crew — never frame broadcast reach as Tim's personal audience.
- The AI ventures are in-progress and aspirational where noted — frame as what he is building, not completed track record.

Write a personalized portfolio intro for one specific visitor. 2–4 sentences. Then return ONLY a raw JSON object, no markdown, no backticks, no preamble:
{"intro":"<the 2-4 sentence intro>","headline":"<a 4-7 word headline for this visitor>"}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { path, followup } = req.body || {};

  // Validate against allowlist — rejects anything not in the 12 known combinations.
  if (!PATHS[path] || !FOLLOWUPS[path] || !FOLLOWUPS[path][followup]) {
    return res.status(400).json({ error: "Invalid path or followup" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server not configured" });
  }

  const userPrompt =
    `Visitor: ${PATHS[path].label}\n` +
    `Their specific answer: ${FOLLOWUPS[path][followup]}\n` +
    `Return the JSON now.`;

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",   // verified current versioned string (June 2026)
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!apiRes.ok) {
      const detail = await apiRes.text();
      console.error("Anthropic API error:", apiRes.status, detail);
      return res.status(502).json({ error: "Upstream error" });
    }

    const data = await apiRes.json();
    const raw = data.content?.[0]?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      // Graceful fallback so the UI always has something to render.
      parsed = {
        intro: "Tim Shephard builds campaigns that scale, brands that stick, and systems that last. The work below was chosen with you in mind.",
        headline: "Built for this moment",
      };
    }

    // Cache identical combinations at the edge for an hour — these answers are deterministic enough.
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(parsed);
  } catch (err) {
    console.error("personalize handler error:", err);
    return res.status(500).json({
      intro: "Tim Shephard builds campaigns that scale, brands that stick, and systems that last. The work below was chosen with you in mind.",
      headline: "Built for this moment",
    });
  }
}
