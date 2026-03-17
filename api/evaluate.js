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
Overall score = CALCULATE by adding all 8 scores and dividing by 8, then round to the nearest 0.5. Show your math in the calibration_note. Example: if scores are 5+4+5+3+4+4+5+4=34, then 34/8=4.25, rounded to 4.5. Do not estimate — compute it.

## Source Rules
- Use official sites, reputable publications, and review platforms for scores and facts.
- Collect 2-3 useful community insights from Reddit/HN/Twitter into community_opinions, prefixed with source.

## Budget Rules
- Budget = category-specific, not total spend. Free tools with paid companions: don't penalize the tool, flag the companion cost. Alternatives must respect stated budget.

## Bottom Line
Write 2-3 sentences: does this tool fit this user's requirements? Be specific to their context.`;

const DEEP_FRAMEWORK = `You are an AI tool evaluator. Produce a THOROUGH evaluation brief calibrated to the user's specific context.

## Evaluation Framework
1. **What It Does** — Plain language, not marketing copy. One paragraph.
2. **Who It's For** — Specific roles and use cases where this tool has a genuine edge.
3. **Practical Cost** — Real monthly/annual cost at realistic usage levels. Flag credit systems, overage traps, hidden costs.
4. **Strengths** — What it's genuinely best at. Concrete capabilities, not vague praise.
5. **Limitations** — Where it falls short. Be specific and honest.
6. **Build vs Buy Signal** — Is the core capability genuinely hard to replicate?
7. **Alternatives Worth Comparing** — 2-3 most relevant alternatives with URLs.
8. **Watch Out For** — Risks, gotchas, or failure modes the marketing copy won't mention.

## Scoring Rubric
Score each dimension 1-5 with a one-line rationale:
Core Capability, Production Readiness, Pricing & Value, API & Integration Quality, Reliability & Scale, Data Privacy & Security, Differentiation, Documentation & Support.
Overall score = CALCULATE by adding all 8 scores and dividing by 8, then round to the nearest 0.5. Show your math in the calibration_note field. Example: if scores are 5+4+5+3+4+4+5+4=34, then 34/8=4.25, rounded to 4.5. Do not estimate — compute it.

## Calibration Rules
- Non-technical user: weight Ease of Onboarding and Production Readiness higher.
- Technical user: weight Core Capability and API quality higher.
- Budget-sensitive: weight Pricing & Value and free-tier usability higher.
- Team adoption: weight Documentation, Reliability, and enterprise trust higher.
- Always name trade-offs explicitly. Never give blanket recommendations.

## Budget Constraint Rules
- Budget = category-specific, not total software budget.
- Free tools with paid companions: don't penalize Pricing score, flag companion cost in Watch Out.
- Alternatives must respect stated budget. Flag contradictions explicitly.

## Source Quality (two-tier)
Tier 1 (for scores/facts): Official sites, reputable publications, G2/Capterra/TrustRadius.
Tier 2 (community_opinions field only): Reddit, HN, Twitter, blogs. Never use for scores. Prefix each with source type.`;

const OUTPUT_FORMAT = `

## Output Format
Return ONLY valid JSON. No markdown fences, no preamble, no explanation outside the JSON.
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
  "alternatives": [{"name": "string", "url": "string", "why": "string"}],
  "watch_out_for": ["string"],
  "community_opinions": ["string prefixed with [Reddit], [HN], [Twitter], [Blog] etc."],
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
}`;

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
- ALWAYS visit and analyze this URL first. Extract product description, features, pricing directly from the page.
- If the tool is not well-known, the provided URL is your PRIMARY source.
- Do NOT return "cannot find data" if a URL was provided.` : ""}

Research this tool thoroughly before scoring. Look for official website, pricing, documentation, independent reviews, community discussions.
${isQuick ? "Keep your research focused. Prioritize official sources and skip deep community research." : ""}
Calibrate your entire evaluation to this user's context.${additionalContext ? " Pay special attention to their additional context." : ""}`;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "API key not configured." });
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: framework }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }]
      }
    ],
    tools: [{ google_search: {} }],
    generationConfig: {
      maxOutputTokens: isQuick ? 3000 : 6000,
      temperature: 0.3
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Gemini API error:", response.status, errBody);
      return res.status(500).json({ error: "Evaluation failed. API returned status " + response.status });
    }

    const data = await response.json();

    // Extract text from Gemini response
    let textContent = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      textContent = data.candidates[0].content.parts
        .filter(p => p.text)
        .map(p => p.text)
        .join("");
    }

    if (!textContent) {
      return res.status(200).json({ raw: true, content: "No evaluation generated. Please try again." });
    }

    // Parse JSON from response
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
      detail: error.message
    });
  }
}
