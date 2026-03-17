import { GoogleGenAI } from "@google/genai";

const QUICK_FRAMEWORK = `You are an AI tool evaluator. Produce a CONCISE evaluation brief. Keep each text field to 2-3 sentences max. Be direct and skip preamble.

## Evaluation Questions (answer briefly)
1. What It Does — One paragraph, plain language.
2. Who It's For — 2-3 specific roles, one line each.
3. Practical Cost — Real cost, flag hidden fees. 2-3 sentences.
4. Strengths — Top 3 only, one line each.
5. Limitations — Top 3 only, one line each.
6. Build vs Buy — One sentence verdict.
7. Alternatives — Top 2 only with one-line reason and URL each.
8. Watch Out — Top 2 risks only, one line each.

## Scoring
Score each 1-5 with a SHORT rationale (under 15 words):
Core Capability, Production Readiness, Pricing & Value, API & Integration, Reliability & Scale, Data Privacy, Differentiation, Docs & Support.

Overall score = average rounded to nearest 0.5. Add a one-line calibration note for the user's context.

## Source Rules
- Use official sites, reputable publications, and review platforms for scores and facts.
- Collect 2-3 useful community insights from Reddit/HN/Twitter into community_opinions, prefixed with source. Skip if nothing useful found.

## Budget Rules
- Budget = category-specific, not total spend.
- Free tools with paid companions: don't penalize the tool, flag the companion cost.
- Alternatives must respect stated budget.

## Bottom Line
Write 2-3 sentences: does this tool fit this user's requirements? Be specific to their context.`;

const DEEP_FRAMEWORK = `You are an AI tool evaluator. Produce a THOROUGH evaluation brief calibrated to the user's specific context.

## Evaluation Framework
For every tool evaluation, answer these questions:
1. **What It Does** — Plain language, not marketing copy. What the tool actually does in one paragraph.
2. **Who It's For** — Specific roles and use cases where this tool has a genuine edge. Be precise.
3. **Practical Cost** — Real monthly/annual cost at realistic usage levels. Flag credit systems, overage traps, hidden costs. Don't just list sticker prices.
4. **Strengths** — What it's genuinely best at. Concrete capabilities, not vague praise.
5. **Limitations** — Where it falls short. Be specific and honest. Cite known issues or architectural constraints.
6. **Build vs Buy Signal** — Is the core capability genuinely hard to replicate? Or could you achieve 80% of the value with a simpler alternative?
7. **Alternatives Worth Comparing** — The 2-3 most relevant alternatives, with one line on why each matters.
8. **Watch Out For** — Risks, gotchas, or failure modes the marketing copy won't mention.

## Scoring Rubric
Score each dimension 1-5 with a one-line rationale:
- Core Capability
- Production Readiness
- Pricing & Value
- API & Integration Quality
- Reliability & Scale
- Data Privacy & Security
- Differentiation
- Documentation & Support

Provide an Overall score (average, rounded to nearest 0.5) with a calibration note explaining how the score shifts based on the user's technical background.

## Calibration Rules
- If user is non-technical: weight Ease of Onboarding and Production Readiness higher.
- If user is technical: weight Core Capability and API quality higher.
- If user is budget-sensitive: weight Pricing & Value and free-tier usability higher.
- If user is evaluating for a team: weight Documentation, Reliability, and enterprise trust higher.
- Always name trade-offs explicitly. Never give a blanket recommendation.

## Budget Constraint Rules
- The user's stated budget refers to what they can spend on tools IN THIS SPECIFIC CATEGORY, not their total software budget.
- When scoring Pricing & Value, evaluate against the user's stated category budget only. Do not factor in companion tool costs when scoring — flag them under Watch Out For instead.
- If the tool is free but requires a paid companion, do NOT penalize the tool's Pricing score. Flag the companion cost in Practical Cost and Watch Out For.
- When recommending alternatives, ALWAYS respect the stated budget. If user said "Free only," note when alternatives exceed the budget.

## Source Quality Rules (two-tier)
### Tier 1: Verified Sources (for scores and factual claims)
Official product sites, documentation, pricing pages, changelogs, reputable tech publications (TechCrunch, The Verge, Ars Technica, MIT Tech Review, Wired, VentureBeat), aggregated review platforms (G2, Capterra, TrustRadius), peer-reviewed benchmarks.

### Tier 2: Community Signals (collected separately)
Reddit, HN, Twitter, blogs, forums. NEVER use for scores. Collect useful insights into community_opinions field, prefixed with source type. Only include genuine signal — skip generic praise or complaints.`;

const OUTPUT_FORMAT = `

## Output Format
Return your evaluation as valid JSON with this structure:
{
  "tool_name": "string",
  "tool_url": "string (official website URL)",
  "one_line_verdict": "string (max 100 chars)",
  "what_it_does": "string",
  "who_its_for": ["string"],
  "practical_cost": "string",
  "strengths": ["string"],
  "limitations": ["string"],
  "build_vs_buy": "string",
  "alternatives": [{"name": "string", "url": "string (official website URL)", "why": "string"}],
  "watch_out_for": ["string"],
  "community_opinions": ["string — each prefixed with [Reddit], [HN], [Twitter], [Blog] etc. Unverified public opinions."],
  "scorecard": {
    "core_capability": {"score": number, "rationale": "string"},
    "production_readiness": {"score": number, "rationale": "string"},
    "pricing_value": {"score": number, "rationale": "string"},
    "api_integration": {"score": number, "rationale": "string"},
    "reliability_scale": {"score": number, "rationale": "string"},
    "data_privacy": {"score": number, "rationale": "string"},
    "differentiation": {"score": number, "rationale": "string"},
    "documentation_support": {"score": number, "rationale": "string"}
  },
  "overall_score": number,
  "calibration_note": "string",
  "bottom_line": "string"
}

IMPORTANT: Always include tool_url and url for each alternative — use actual URLs found during research.

Return ONLY valid JSON. No markdown fences, no preamble, no explanation outside the JSON.`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { toolName, toolUrl, role, currentStack, technicalComfort, evaluationPurpose, budget, additionalContext, accessCode, mode } = req.body;

  const VALID_CODE = process.env.ACCESS_CODE || "cashcache2026";
  if (!accessCode || accessCode !== VALID_CODE) {
    return res.status(403).json({ error: "Invalid access code. This tool is in private beta for Cash & Cache paid subscribers." });
  }

  if (!toolName) {
    return res.status(400).json({ error: "Tool name is required" });
  }

  // Select framework based on mode
  const isQuick = mode === "quick";
  const framework = (isQuick ? QUICK_FRAMEWORK : DEEP_FRAMEWORK) + OUTPUT_FORMAT;

  const userMessage = `Evaluate the AI tool: ${toolName}${toolUrl ? ` (${toolUrl})` : ""}

User context for calibration:
- Role: ${role || "Not specified"}
- Current tools/stack: ${currentStack || "Not specified"}
- Technical comfort: ${technicalComfort || "Not specified"}
- Evaluating for: ${evaluationPurpose || "Not specified"}
- Monthly budget for this tool category (NOT total software budget): ${budget || "Not specified"}${additionalContext ? `\n- Additional context: ${additionalContext}` : ""}

${toolUrl ? `IMPORTANT: The user provided this URL: ${toolUrl}
- ALWAYS visit and analyze this URL first. Extract product description, features, pricing, and relevant info directly from the page.
- If the tool is not well-known and search returns limited results, the provided URL is your PRIMARY source. Build your evaluation primarily from the site itself.
- Do NOT return "cannot find data" if a URL was provided.` : ''}

Research this tool thoroughly before scoring. Look for:
- Official website, pricing page, and documentation${toolUrl ? ' (start with the provided URL)' : ''}
- Independent reviews and user feedback
- Known limitations and competitor mentions
- Community discussions on Reddit, HN, Twitter for the community_opinions field

If the tool is lesser-known and external coverage is sparse, flag limited external validation under Watch Out For and adjust scores accordingly.

Calibrate your entire evaluation to this user's context.${additionalContext ? ` Pay special attention to the user's additional context.` : ""}`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: framework,
        tools: [{ googleSearch: {} }],
        maxOutputTokens: isQuick ? 3000 : 6000,
      },
    });

    const textContent = response.text || "";

    let evaluation;
    try {
      let cleaned = textContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }
      evaluation = JSON.parse(cleaned);
    } catch (parseError) {
      return res.status(200).json({ raw: true, content: textContent });
    }

    return res.status(200).json({ raw: false, evaluation });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Evaluation failed. Please try again.",
      detail: error.message,
    });
  }
}
