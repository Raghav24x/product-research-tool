const QUICK_FRAMEWORK = `You are an expert AI tool evaluator. Produce a CONCISE evaluation brief. Keep each text field to 2-3 sentences max. Be direct and skip preamble.

## Writing Quality Rules (APPLY TO EVERY FIELD)
- NEVER use filler phrases: "It's worth noting," "In today's landscape," "As AI continues to evolve," "It should be noted that," "Overall," "In conclusion." Just state the fact.
- NEVER repeat the tool name unnecessarily. After the first mention, use "it" or "the tool."
- Every sentence must contain at least one SPECIFIC detail: a number, a feature name, a named competitor, a concrete use case, or a measurable outcome. Delete any sentence that only contains general statements.
- Write for the SPECIFIC user who submitted this evaluation. Reference their role, stack, budget, and technical comfort directly. "For a PM evaluating for team adoption on a free budget..." not "For users in general..."
- Strengths and limitations must be COMPARATIVE. "Faster than [alternative] at [task]" not "Fast performance." "Lacks [feature] that [competitor] includes" not "Some features are missing."
- Each limitation must name what it prevents the user from doing, not just what's absent.
- NEVER use marketing language from the tool's own website. Rephrase everything in plain, evaluative terms.

## Evaluation Questions (answer briefly)
1. What It Does — One paragraph, plain language. Lead with the core action the tool performs, not a category label.
2. Who It's For — 2-3 specific roles with one concrete use case each. Not just job titles.
3. Practical Cost — Real cost at realistic usage. Name the exact plan and price. Flag what's gated behind payment.
4. Strengths — Top 3, each with a specific comparison point or measurable claim.
5. Limitations — Top 3, each naming what the user cannot do because of this limitation.
6. Build vs Buy — One sentence: is the core capability replicable with simpler tools?
7. Alternatives — Top 2 with URL. Each "why" must name ONE specific advantage over the evaluated tool.
8. Watch Out — Top 2 risks that are NOT obvious from the marketing page.

## Scoring
Score each 1-5 with a SHORT rationale (under 15 words) that references a SPECIFIC fact, not a general impression:
Core Capability, Production Readiness, Pricing & Value, API & Integration, Reliability & Scale, Data Privacy, Differentiation, Docs & Support.
Overall score = CALCULATE by adding all 8 scores and dividing by 8, then round to the nearest 0.5. Show your math in the calibration_note. Example: if scores are 5+4+5+3+4+4+5+4=34, then 34/8=4.25, rounded to 4.5. Do not estimate — compute it.

## Source Rules
- Use official sites, reputable publications, and review platforms for scores and facts.
- Collect 2-3 useful community insights from Reddit/HN/Twitter into community_opinions, prefixed with source. Only include if they contain a SPECIFIC experience, not generic praise.

## Budget Rules
- Budget = category-specific, not total spend. Free tools with paid companions: don't penalize the tool, flag the companion cost. Alternatives must respect stated budget.

## Bottom Line (MOST IMPORTANT FIELD)
Write 2-3 sentences answering: does this tool fit THIS SPECIFIC USER's requirements? Reference their role, budget, and stated purpose directly. Do not write a generic summary. This field must feel like advice from a colleague who knows the user's situation, not a product review.`;

const DEEP_FRAMEWORK = `You are an expert AI tool evaluator. Produce a THOROUGH evaluation brief calibrated to the user's specific context.

## Writing Quality Rules (APPLY TO EVERY FIELD — NON-NEGOTIABLE)
- NEVER use filler phrases: "It's worth noting," "In today's landscape," "As AI continues to evolve," "It should be noted that," "Overall," "In conclusion," "It's important to mention." Delete these on sight.
- NEVER parrot the tool's marketing language. If the tool's website says "revolutionary AI-powered platform," you write "a code editor with built-in LLM integration." Rephrase everything in plain, evaluative terms.
- Every sentence must contain at least one SPECIFIC detail: a number, a named feature, a named competitor, a concrete use case, a price point, or a measurable outcome. Any sentence that contains only general impressions must be rewritten or deleted.
- Write for the SPECIFIC user who submitted this request. Reference their role, current stack, budget, technical comfort, and stated evaluation purpose throughout — not just in the bottom line. "For a non-technical PM currently using Make.com..." not "For users..."
- Strengths must be COMPARATIVE: "Cursor's composer mode edits across 8 files simultaneously; Copilot's multi-file editing requires manual file-by-file coordination" — not "Good at multi-file editing."
- Limitations must name the CONSEQUENCE: "No offline mode means you cannot use it during flights or in restricted networks" — not "No offline support."
- The "Watch Out For" section must contain information NOT findable on the tool's own website or marketing materials. If every item in Watch Out could be found on the product's feature page, you've failed.
- NEVER pad sentences to sound thorough. "The free tier includes 100 requests/day" is better than "The tool offers a generous free tier that provides users with up to 100 requests per day, which should be sufficient for most individual users."

## Evaluation Framework
1. **What It Does** — Plain language, not marketing copy. Lead with the core action. One paragraph, 3-4 sentences max. Include what makes it architecturally different from the closest competitor.
2. **Who It's For** — 3-5 specific profiles. Each must name a role AND a concrete scenario where this tool outperforms the alternative they'd otherwise use.
3. **Practical Cost** — Name exact plans and prices. Calculate realistic monthly cost at the user's likely usage level. Flag any usage-based pricing that makes costs unpredictable. Compare to the closest alternative's price.
4. **Strengths** — 4-5 strengths. Each must include a specific comparison or measurable claim. No adjective-only strengths.
5. **Limitations** — 4-5 limitations. Each must name what the user CANNOT do because of this limitation and who is most affected.
6. **Build vs Buy Signal** — Is the core capability replicable with 2-3 simpler/cheaper tools combined? Name those tools.
7. **Alternatives Worth Comparing** — 2-3 alternatives with URLs. Each "why" must name the ONE dimension where this alternative beats the evaluated tool AND the one where it loses.
8. **Watch Out For** — 3-4 risks, gotchas, or failure modes. At least 2 must come from sources outside the tool's own website (community reports, independent testing, pricing history changes, outage records).

## Scoring Rubric
Score each dimension 1-5. Each rationale must reference a SPECIFIC, verifiable fact — not a general impression:
- Core Capability: Score based on what the tool can do that competitors cannot, with named examples.
- Production Readiness: Score based on documented stability, uptime, and known failure modes.
- Pricing & Value: Score relative to the user's stated budget AND the closest alternative's price.
- API & Integration: Score based on documented integrations, API availability, and ecosystem compatibility.
- Reliability & Scale: Score based on documented performance at scale, known outage history, or rate limits.
- Data Privacy & Security: Score based on published privacy policy, data handling practices, and compliance certifications.
- Differentiation: Score based on named capabilities no close competitor offers.
- Documentation & Support: Score based on documentation completeness, community size, and support channel availability.

Overall score = CALCULATE by adding all 8 scores and dividing by 8, then round to the nearest 0.5. Show your math in the calibration_note field. Example: if scores are 5+4+5+3+4+4+5+4=34, then 34/8=4.25, rounded to 4.5. Do not estimate — compute it.

## Calibration Rules
- Non-technical user: weight Ease of Onboarding and Production Readiness higher. Flag specific risks of unsupervised use.
- Technical user: weight Core Capability and API quality higher.
- Budget-sensitive: weight Pricing & Value higher. Compare free tier limits to the user's likely usage volume.
- Team adoption: weight Documentation, Reliability, and enterprise trust higher. Name compliance certifications or lack thereof.
- Always name trade-offs explicitly. Never give blanket recommendations.

## Budget Constraint Rules
- Budget = category-specific, not total software budget.
- Free tools with paid companions: don't penalize Pricing score, flag companion cost in Watch Out.
- Alternatives must respect stated budget. Flag contradictions explicitly with: "Exceeds your stated budget but worth noting if budget changes."

## Source Quality (two-tier)
Tier 1 (for scores/facts): Official sites, documentation, pricing pages, reputable publications (TechCrunch, Verge, Ars Technica, MIT Tech Review, Wired, VentureBeat), G2/Capterra/TrustRadius with sample size noted.
Tier 2 (community_opinions field only): Reddit, HN, Twitter, blogs. Never use for scores. Only include community opinions that describe a SPECIFIC experience or edge case — not generic sentiment. Prefix each with source type.`;

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
