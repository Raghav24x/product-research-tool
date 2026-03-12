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

## Output Format

Return your evaluation as valid JSON with this structure:
{
  "tool_name": "string",
  "one_line_verdict": "string (max 100 chars)",
  "what_it_does": "string",
  "who_its_for": ["string"],
  "practical_cost": "string",
  "strengths": ["string"],
  "limitations": ["string"],
  "build_vs_buy": "string",
  "alternatives": [{"name": "string", "why": "string"}],
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

  const { toolName, toolUrl, role, currentStack, technicalComfort, evaluationPurpose, budget } = req.body;

  if (!toolName) {
    return res.status(400).json({ error: "Tool name is required" });
  }

  const userMessage = `Evaluate the AI tool: ${toolName}${toolUrl ? ` (${toolUrl})` : ""}

User context for calibration:
- Role: ${role || "Not specified"}
- Current tools/stack: ${currentStack || "Not specified"}
- Technical comfort: ${technicalComfort || "Not specified"}
- Evaluating for: ${evaluationPurpose || "Not specified"}
- Budget range: ${budget || "Not specified"}

Research this tool thoroughly using web search before scoring. Look for:
- Official website, pricing page, and documentation
- Independent reviews and user feedback from the last 6 months
- Known limitations, complaints, and competitor mentions
- Recent product changes, funding, or team developments

Calibrate your entire evaluation to this user's context. A non-developer PM evaluating for team adoption needs different emphasis than a solo founder evaluating for personal productivity.`;

  try {
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 4096,
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

    // Parse JSON from response
    let evaluation;
    try {
      const cleaned = textContent.replace(/```json|```/g, "").trim();
      evaluation = JSON.parse(cleaned);
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
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
