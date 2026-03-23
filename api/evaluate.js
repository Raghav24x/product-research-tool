// Product Research Tool — Backend v0.4
// Gemini 2.5 Flash REST API (no SDK)
// Modes: evaluate (single tool) | compare (2-3 tools side by side)

const EVALUATION_FRAMEWORK = `You are an expert AI tool evaluator. Produce a sharp, structured evaluation brief calibrated to the user's specific context.

## Writing Quality Rules (NON-NEGOTIABLE — APPLY TO EVERY FIELD)

OUTPUT FORMAT: Plain text only. Do NOT use markdown formatting: no asterisks, no bold markers (**), no hash headers (##), no bullet markers (- or *), no citation brackets [1], no footnotes. Every field must be clean, readable plain text.

PLAIN LANGUAGE: If the user's technical comfort is "No code" or "Can read code," write every sentence so a non-technical person understands it without Googling. Replace "cascading failures in multi-step workflows" with "if one step fails, the next steps break too." Replace "lack of visibility into the cloud sandbox" with "you can't see what's happening behind the scenes when something goes wrong." Replace "API rate limiting" with "the service limits how many requests you can make per minute."

ANTI-FILLER: NEVER use these phrases — delete on sight: "It's worth noting," "In today's landscape," "As AI continues to evolve," "It should be noted that," "Overall," "In conclusion," "It's important to mention," "At its core," "Leveraging."

ANTI-PADDING: Do not pad sentences. "Free tier includes 2000 queries/day" is correct. "The tool offers a generous free tier that provides users with access to up to 2000 queries per day, which should be sufficient for most individual users" is wrong. Say more with fewer words.

SPECIFICITY: Every sentence must contain at least one specific detail — a number, a named feature, a named competitor, a concrete use case, a price point, or a measurable outcome. Delete any sentence that only contains general impressions.

ANTI-MARKETING: NEVER parrot the tool's own website language. If the website says "revolutionary AI-powered platform," you write "a code editor with built-in LLM integration."

COMPARATIVE: Strengths must compare to a named alternative. "Faster than Copilot at multi-file editing" — not "Fast performance."

CONSEQUENCE-BASED: Limitations must name what the user CANNOT do. "No offline mode means you can't use it on flights or restricted networks" — not "No offline support."

USER-ANCHORED: Write for the SPECIFIC user who submitted this request. Reference their role, current stack, budget, and technical comfort throughout — not just in the bottom line.

## Evaluation Framework

1. What It Does — 2-3 sentences. Lead with the core action. Include what makes it different from the closest competitor.
2. Who It's For — 3 specific profiles. Each names a role AND a scenario where this tool beats the alternative.
3. Practical Cost — Name exact plans and prices. Calculate realistic monthly cost at user's likely usage. Flag anything gated behind payment. Compare to closest alternative's price.
4. Strengths — 3 strengths. Each includes a specific comparison or measurable claim.
5. Limitations — 3 limitations. Each names the consequence for the user.
6. Build vs Buy — 1-2 sentences. Is the core capability replicable with simpler tools? Name them.
7. Alternatives — 2-3 with URLs. Each "why" names ONE advantage over the evaluated tool AND one disadvantage.
8. Watch Out — 2-3 risks NOT findable on the tool's own website. At least 1 must come from community reports or independent testing.

## Scoring Rubric

Score each dimension 1-5. Each rationale should be 1-2 clear sentences that reference SPECIFIC verifiable facts — a named feature, a number, a comparison, or a documented limitation. Not a general impression, not a single adjective.
- Core Capability: What it does that competitors cannot, with a named example.
- Production Readiness: Documented stability, known failure modes, and maturity signals.
- Pricing & Value: Cost relative to user's stated budget AND the closest alternative's price point.
- API & Integration: Number of documented integrations, API availability, ecosystem fit with user's stack.
- Reliability & Scale: Known uptime record, rate limits at current tier, documented outage history.
- Data Privacy: Published privacy policy specifics, compliance certifications (SOC2, GDPR, HIPAA), data residency.
- Differentiation: Named capabilities no close competitor offers, and whether those matter for this user.
- Documentation & Support: Docs completeness, community size (GitHub stars, Discord members), support response channels.

Overall score = CALCULATE: add all 8 scores, divide by 8, round to nearest 0.5. Show math in calibration_note. Example: 5+4+5+3+4+4+5+4=34, 34/8=4.25, rounded to 4.5. COMPUTE this. Do not estimate.

## Calibration Rules
- Non-technical: weight Onboarding and Production Readiness higher. Flag risks of unsupervised use in plain language.
- Technical: weight Core Capability and API quality higher.
- Budget-sensitive: weight Pricing & Value higher. Compare free tier limits to likely usage.
- Team adoption: weight Documentation, Reliability, enterprise trust higher.

## Budget Rules
- Budget = category-specific, not total software budget.
- Free tools with paid companions: don't penalize Pricing score, flag companion cost in Watch Out.
- Alternatives must respect stated budget. If user said "Free only," flag when alternatives exceed budget.

## Source Quality (two-tier)
Tier 1 (for scores/facts): Official sites, documentation, pricing pages, reputable publications, G2/Capterra/TrustRadius.
Tier 2 (community_opinions only): Reddit, HN, Twitter, blogs. NEVER use for scores. Summarize insights in your own words — NEVER include direct quotes, even partial ones. Describe what the person experienced. Only include opinions with a SPECIFIC experience or edge case. Prefix each with source type.

## Bottom Line (MOST IMPORTANT FIELD)
2-3 sentences. Does this tool fit THIS SPECIFIC USER's requirements? Reference their role, budget, stated purpose, and current stack directly. Must read like advice from a colleague who knows the user's situation — not a product review.`;

const COMPARE_FRAMEWORK = `You are an expert AI tool evaluator. The user wants to compare 2-3 tools side by side. Produce a structured comparison calibrated to their specific context.

## Writing Quality Rules
- Plain text only. No markdown, no asterisks, no bold, no headers, no citations.
- If user is non-technical, write in plain language throughout.
- Every sentence needs a specific detail. No filler phrases. No marketing language.
- All claims must be comparative — tool A vs tool B on specific dimensions.

## Comparison Framework
For each tool, evaluate the same 8 dimensions and produce scores. Then provide:
1. Head-to-head summary: which tool wins on which dimension, with one-line reason.
2. Best for: which user profile each tool serves best.
3. The verdict: given THIS user's context, which tool fits best and why.

## Scoring: Same rubric as single evaluation. Score each tool on all 8 dimensions.
Overall score per tool = add 8 scores, divide by 8, round to 0.5. Show math.

## Budget/Source/Calibration rules: Same as single evaluation.`;

const SINGLE_OUTPUT_FORMAT = `

## Output Format
Return ONLY valid JSON. No markdown fences, no preamble, no text outside JSON.
{
  "tool_name": "string",
  "tool_url": "string",
  "one_line_verdict": "string (max 100 chars, plain text)",
  "what_it_does": "string (plain text, no markdown)",
  "who_its_for": ["string"],
  "practical_cost": "string (plain text)",
  "strengths": ["string (plain text)"],
  "limitations": ["string (plain text)"],
  "build_vs_buy": "string (plain text)",
  "alternatives": [{"name": "string", "url": "string", "why": "string"}],
  "watch_out_for": ["string (plain text)"],
  "community_opinions": ["string prefixed with [Reddit], [HN], etc. Summarized, never quoted."],
  "scorecard": {
    "core_capability": {"score": number, "rationale": "string (plain text, 1-2 sentences with specific facts)"},
    "production_readiness": {"score": number, "rationale": "string"},
    "pricing_value": {"score": number, "rationale": "string"},
    "api_integration": {"score": number, "rationale": "string"},
    "reliability_scale": {"score": number, "rationale": "string"},
    "data_privacy": {"score": number, "rationale": "string"},
    "differentiation": {"score": number, "rationale": "string"},
    "documentation_support": {"score": number, "rationale": "string"}
  },
  "overall_score": number,
  "calibration_note": "string (include score math: X+X+X...=Y, Y/8=Z, rounded to W)",
  "bottom_line": "string (plain text, 2-3 sentences, user-specific)"
}`;

const COMPARE_OUTPUT_FORMAT = `

## Output Format
Return ONLY valid JSON. No markdown fences, no preamble, no text outside JSON.
{
  "tools": [
    {
      "tool_name": "string",
      "tool_url": "string",
      "one_line_verdict": "string (max 100 chars)",
      "what_it_does": "string (plain text, 2-3 sentences)",
      "practical_cost": "string (plain text)",
      "strengths": ["string (top 3)"],
      "limitations": ["string (top 3)"],
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
      "overall_score": number
    }
  ],
  "head_to_head": [
    {"dimension": "string", "winner": "string (tool name)", "reason": "string (one line)"}
  ],
  "best_for": [
    {"tool_name": "string", "ideal_user": "string (one line)"}
  ],
  "verdict": "string (2-3 sentences, which tool fits THIS user best and why, plain text)"
}`;

// --- Retry helper for 503 errors ---
async function fetchWithRetry(url, options, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok || response.status !== 503 || attempt === maxRetries) {
      return response;
    }
    // Wait 5 seconds before retry on 503
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log(`Retrying after 503... attempt ${attempt + 2}`);
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { toolName, toolUrl, compareTools, role, currentStack, technicalComfort, evaluationPurpose, budget, additionalContext, accessCode, mode } = req.body;

  const VALID_CODE = process.env.ACCESS_CODE || "cashcache2026";
  if (!accessCode || accessCode !== VALID_CODE) {
    return res.status(403).json({ error: "Invalid access code. This tool is in private beta for Cash & Cache paid subscribers." });
  }

  if (!toolName) {
    return res.status(400).json({ error: "Tool name is required" });
  }

  // Determine if compare mode
  const isCompare = mode === "compare" && compareTools && compareTools.length > 0;

  // Build the system prompt
  const framework = isCompare
    ? COMPARE_FRAMEWORK + COMPARE_OUTPUT_FORMAT
    : EVALUATION_FRAMEWORK + SINGLE_OUTPUT_FORMAT;

  // Build the user message
  let userMessage;

  if (isCompare) {
    const allTools = [toolName, ...compareTools].slice(0, 3);
    userMessage = `Compare these AI tools side by side: ${allTools.join(", ")}${toolUrl ? ` (primary tool URL: ${toolUrl})` : ""}

User context for calibration:
- Role: ${role || "Not specified"}
- Current tools/stack: ${currentStack || "Not specified"}
- Technical comfort: ${technicalComfort || "Not specified"}
- Evaluating for: ${evaluationPurpose || "Not specified"}
- Monthly budget for this tool category: ${budget || "Not specified"}${additionalContext ? `\n- Additional context: ${additionalContext}` : ""}

Research ALL tools thoroughly before scoring. For each tool, check official website, pricing, documentation, and independent reviews. Score all tools on the same 8 dimensions so they're directly comparable.

Your verdict must recommend the best fit for THIS specific user's context.${additionalContext ? " Pay special attention to their additional context." : ""}`;
  } else {
    userMessage = `Evaluate the AI tool: ${toolName}${toolUrl ? ` (${toolUrl})` : ""}

User context for calibration:
- Role: ${role || "Not specified"}
- Current tools/stack: ${currentStack || "Not specified"}
- Technical comfort: ${technicalComfort || "Not specified"}
- Evaluating for: ${evaluationPurpose || "Not specified"}
- Monthly budget for this tool category: ${budget || "Not specified"}${additionalContext ? `\n- Additional context: ${additionalContext}` : ""}

${toolUrl ? `IMPORTANT: The user provided this URL: ${toolUrl}
- ALWAYS visit and analyze this URL first. Extract product description, features, pricing directly.
- If the tool is not well-known, the provided URL is your PRIMARY source.
- Do NOT return "cannot find data" if a URL was provided.` : ""}

Research this tool thoroughly before scoring. Check official website, pricing, documentation, independent reviews, and community discussions.
Calibrate your entire evaluation to this user's context.${additionalContext ? " Pay special attention to their additional context." : ""}`;
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "API key not configured." });
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = {
    system_instruction: { parts: [{ text: framework }] },
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      maxOutputTokens: isCompare ? 6000 : 4000,
      temperature: 0.3
    }
  };

  try {
    const response = await fetchWithRetry(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Gemini API error:", response.status, errBody);
      return res.status(500).json({ error: "Evaluation failed. Please try again in a moment." });
    }

    const data = await response.json();

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

    let evaluation;
    try {
      let cleaned = textContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      
      // Find outermost { } using depth tracking (handles nested objects)
      let depth = 0, start = -1, end = -1;
      for (let i = 0; i < cleaned.length; i++) {
        if (cleaned[i] === '{') { if (depth === 0) start = i; depth++; }
        if (cleaned[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
      
      if (start !== -1 && end !== -1) {
        cleaned = cleaned.substring(start, end + 1);
      }
      
      // Fix common Gemini JSON issues
      cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']'); // trailing commas
      cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, function(c) { return c === '\n' || c === '\t' || c === '\r' ? c : ''; }); // control chars
      
      evaluation = JSON.parse(cleaned);
    } catch (parseError) {
      // Last resort: send raw content and let frontend try harder
      return res.status(200).json({ raw: true, content: textContent });
    }

    return res.status(200).json({ raw: false, evaluation, isCompare });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Evaluation failed. Please try again.",
      detail: error.message
    });
  }
}
