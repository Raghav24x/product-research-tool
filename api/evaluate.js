import Anthropic from "@anthropic-ai/sdk";

const EVALUATION_FRAMEWORK = `You are an AI tool evaluator. You produce structured, honest evaluation briefs calibrated to the user's specific context.

## Evaluation Framework

For every tool evaluation, answer these questions:

1. **What It Does** — Plain language, not marketing copy. What the tool actually does in one paragraph.
2. **Who It's For** — Specific roles and use cases where this tool has a genuine edge. Be precise.
3. **Practical Cost** — Real monthly/annual cost at realistic usage levels. Flag credit systems, overage traps, hidden costs. Don't just list sticker prices.
4. **Strengths** — What it's genuinely best at. Concrete capabilities, not vague praise.
5. **Limitations** — Where it falls short. Be specific and honest. Cite known issues, user complaints, or architectural constraints.
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

- If user is non-technical: weight Ease of Onboarding and Production Readiness higher. Flag risks of using the tool without technical oversight.
- If user is technical: weight Core Capability and API quality higher.
- If user is budget-sensitive: weight Pricing & Value and free-tier usability higher.
- If user is evaluating for a team: weight Documentation, Reliability, and enterprise trust higher.
- Always name trade-offs explicitly. Never give a blanket recommendation.

## Budget Constraint Rules (CRITICAL — prevents contradictions)

- The user's stated budget refers to what they can spend on tools IN THIS SPECIFIC CATEGORY, not their total software budget.
- When scoring Pricing & Value, evaluate the tool's cost against the user's stated category budget only. Do not factor in costs of companion tools (e.g., API subscriptions, separate IDE licenses) when scoring the tool itself — instead, flag companion costs explicitly under "Watch Out For" as hidden costs.
- If the tool being evaluated is free but requires a paid companion service to function, do NOT penalize the tool's Pricing & Value score. Instead, clearly flag the companion cost in "Practical Cost" and "Watch Out For."
- When recommending alternatives, ALWAYS respect the user's stated budget. If the user specified "Free only," never recommend paid alternatives without explicitly noting they exceed the budget. If all strong alternatives are paid, say so honestly rather than recommending them as if they fit.
- If a recommendation contradicts the user's budget constraint, flag the contradiction explicitly: "This alternative exceeds your stated budget but is worth noting if your budget changes."

## Source Quality Rules (CRITICAL — prevents bias and noise)

- ONLY use information from high-authority sources: official product websites, official documentation, official pricing pages, official changelogs, reputable tech publications (TechCrunch, The Verge, Ars Technica, MIT Technology Review, Wired), peer-reviewed benchmarks, and verified company announcements.
- DO NOT cite, reference, or draw conclusions from: Reddit threads, Hacker News comments, personal blog opinions, Twitter/X posts, YouTube video opinions, or any user-generated forum content. These are anecdotal and introduce bias.
- When reporting user sentiment or adoption signals, ONLY use aggregated review data from structured platforms (G2, Capterra, TrustRadius) and note the sample size and reviewer demographic if available.
- When reporting pricing, ONLY use the official pricing page. If pricing is ambiguous or requires a sales call, say so explicitly rather than guessing.
- When reporting benchmarks or performance claims, ONLY cite the original source (the company's own published benchmark or an independent third-party evaluation). Do not cite secondhand reporting of benchmarks.
- If you cannot verify a claim from a high-authority source, do not include it. Omission is better than unverified information.
- Frame all assessments as evidence-based findings, not opinions. Use language like "official documentation states," "G2 reviews indicate," "pricing page shows" — not "people say," "it seems," or "generally considered."

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

IMPORTANT: Always include the tool_url (the evaluated tool's official website) and url for each alternative. Use the actual official website URL found during research, not a guess.

Return ONLY valid JSON. No markdown fences, no preamble, no explanation outside the JSON.`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { toolName, toolUrl, role, currentStack, technicalComfort, evaluationPurpose, budget, additionalContext, accessCode } = req.body;

  // Access code verification
  const VALID_CODE = process.env.ACCESS_CODE || "cashcache2026";
  if (!accessCode || accessCode !== VALID_CODE) {
    return res.status(403).json({ error: "Invalid access code. This tool is in private beta for Cash & Cache paid subscribers." });
  }

  if (!toolName) {
    return res.status(400).json({ error: "Tool name is required" });
  }

  const userMessage = `Evaluate the AI tool: ${toolName}${toolUrl ? ` (${toolUrl})` : ""}

User context for calibration:
- Role: ${role || "Not specified"}
- Current tools/stack: ${currentStack || "Not specified"}
- Technical comfort: ${technicalComfort || "Not specified"}
- Evaluating for: ${evaluationPurpose || "Not specified"}
- Monthly budget for this tool category (NOT total software budget): ${budget || "Not specified"}${additionalContext ? `\n- Additional context: ${additionalContext}` : ""}

Research this tool thoroughly using web search before scoring. Look for:
- Official website, pricing page, and documentation
- Independent reviews and user feedback from the last 6 months
- Known limitations, complaints, and competitor mentions
- Recent product changes, funding, or team developments

Calibrate your entire evaluation to this user's context. A non-developer PM evaluating for team adoption needs different emphasis than a solo founder evaluating for personal productivity.${additionalContext ? ` Pay special attention to the user's additional context when calibrating scores and recommendations.` : ""}`;

  try {
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8096,
      system: EVALUATION_FRAMEWORK,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text content from response
    const textContent = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    // Parse JSON from response — handle preamble text, markdown fences, and multiple blocks
    let evaluation;
    try {
      // First try: strip markdown fences and parse
      let cleaned = textContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

      // Second try: find the first { and last } to extract JSON object
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }

      evaluation = JSON.parse(cleaned);
    } catch (parseError) {
      // If JSON parsing still fails, return the raw text
      return res.status(200).json({
        raw: true,
        content: textContent,
      });
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
