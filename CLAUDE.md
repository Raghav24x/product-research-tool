# CLAUDE.md — Product Research Tool

## What This Project Is

A web-based tool that evaluates any AI tool against an 8-dimension scoring framework, calibrated to the user's specific context (role, technical comfort, budget, workflow, current stack). Users fill a form, the backend calls Gemini's API with a structured evaluation prompt + Google Search grounding, and the frontend renders a formatted evaluation report.

Built by Raghav Mehra and Ashwin Francis for Cash & Cache, a Substack newsletter covering practical AI implementation for tech leaders, PMs, VCs, and AI practitioners.

**Live URL:** Hosted on Vercel free tier. Access-code protected for paid subscribers.
**GitHub repo:** `github.com/Raghav24x/product-research-tool`

---

## Tech Stack

- **Frontend:** Single HTML file (`public/index.html`) — vanilla JS, no framework, no build step, no npm frontend dependencies
- **Backend:** Vercel serverless functions (`api/evaluate.js`, `api/feedback.js`) — Node.js
- **AI Model:** Google Gemini 2.5 Flash via REST API (NOT the SDK — the SDK doesn't install on Vercel)
- **Search:** Google Search grounding enabled in the Gemini API call
- **Hosting:** Vercel free tier, auto-deploys from GitHub
- **Font:** Arial (system font, no external loading)
- **PDF:** Desktop uses `window.print()`, mobile uses html2canvas + jsPDF from CDN
- **Feedback:** Star rating (1-5) + optional comment → Vercel function logs (Google Sheets integration blocked by Vercel network allowlist)

---

## Project Structure

```
product-research-tool/
├── api/
│   ├── evaluate.js       ← Main backend: Gemini REST API, evaluation + compare prompts
│   └── feedback.js       ← Feedback endpoint: logs to Vercel, attempts Google Sheets
├── public/
│   ├── index.html        ← Complete frontend: form, results renderer, PDF, feedback widget
│   ├── logo.png          ← Cash & Cache logo (topbar)
│   ├── tool-logo.png     ← Product Research Tool logo (header, 80px)
│   ├── favicon.ico       ← Browser tab icon (multi-size)
│   ├── favicon-16.png    ← 16px favicon
│   ├── favicon-32.png    ← 32px favicon
│   ├── apple-touch-icon.png ← iOS bookmark icon (180px)
│   └── icon-512.png      ← OG image for link previews
├── package.json          ← Minimal, NO dependencies
├── vercel.json           ← Empty {} (default config)
└── README.md
```

---

## Vercel Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google AI Studio API key (free tier) |
| `ACCESS_CODE` | Beta access code (embedded in URL as `?code=VALUE`) |
| `FEEDBACK_SHEET_URL` | Google Apps Script URL for feedback (optional, currently blocked by network) |

---

## Architecture Decisions & Why

### Gemini REST API, NOT the SDK
The `@google/genai` SDK fails to install on Vercel — module resolution issues with `node_modules`. We tried `import`, `require`, reinstalling, clearing cache. None worked. The fix: call Gemini's REST API directly with `fetch`. Zero dependencies. The `package.json` has NO dependencies.

**API endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

### Why Gemini, not Claude
Cost. Claude Sonnet 4.5 costs $3/$15 per million tokens (~$0.05-0.10/evaluation). Gemini 2.5 Flash has a free tier: 10 RPM, 250 RPD. For beta with 20-30 testers, zero cost.

### Why vanilla JS, not React
Single-file deployment. No build step. Raghav deploys by pasting into GitHub's web editor. React would require a build pipeline, node_modules, and more complexity than the project needs.

### Why Vercel
Free tier includes serverless functions, auto-deploy from GitHub, HTTPS, and custom domain support. One-click deployment.

### `responseMimeType: "application/json"` — DO NOT USE
This parameter conflicts with Google Search grounding (`tools: [{ google_search: {} }]`). When both are set, the API returns an error. We tried this and had to revert. Always leave `responseMimeType` unset when using Google Search.

---

## Code Conventions

### Frontend (index.html)
- All CSS is inline in `<style>` — no external stylesheets
- All JS is inline in `<script>` — no external JS files
- CSS uses custom properties (CSS variables) defined in `:root` for theming
- Light/dark theme via `data-theme` attribute on `<html>`
- Functions use `var` not `let`/`const` (broadest browser compatibility)
- No ES6 arrow functions in critical paths — use `function` for compatibility
- HTML strings built with concatenation, not template literals
- Form data collected by `document.getElementById()`, not FormData API

### Backend (evaluate.js)
- Uses `export default async function handler(req, res)` — Vercel serverless format
- CORS headers set on every response
- OPTIONS method handled for preflight
- Access code validated before any API call
- All prompts stored as template literal constants at top of file
- JSON parsing uses depth-tracking brace finder + trailing comma fix
- `fetchWithRetry` wrapper handles 503 errors (2 retries, 5-second delay)

### Naming
- CSS classes: kebab-case (`result-header-card`, `score-legend-dot`)
- JS functions: camelCase (`renderResults`, `showLoading`, `resetForm`)
- JSON fields from Gemini: snake_case (`tool_name`, `overall_score`, `what_it_does`)
- `formatLabel()` converts snake_case JSON keys to display labels

---

## Critical Rules

### NEVER do these:
- **Never use the `@google/genai` SDK** — it doesn't install on Vercel. Always use REST API with `fetch`.
- **Never use `responseMimeType: "application/json"`** with Google Search grounding — they conflict.
- **Never use lookbehind regex `(?<!...)`** in frontend JS — not supported in older Safari/iOS.
- **Never use `new Function()` or `eval()`** in frontend — blocked by CSP on Vercel.
- **Never use extended date-format model strings** like `claude-sonnet-4-5-20250929` — only short format works (`gemini-2.5-flash`).
- **Never try to reach `script.google.com` from Vercel serverless functions** — it's blocked by the network allowlist. Feedback to Google Sheets must go through alternative paths.
- **Never show raw JSON to users** — always parse, and if parsing fails, use `renderRawFallback()` to extract readable content.
- **Never trust Gemini's score calculation** — the frontend recalculates `overall_score` from individual scorecard scores and caps at 5.0.

### ALWAYS do these:
- **Always validate the access code** before making any API call.
- **Always auto-prepend `https://`** if a user enters a URL without a protocol.
- **Always strip markdown from Gemini output** — the `stripMd()` and `cleanEval()` functions remove `**bold**`, `## headers`, `` `backticks` ``, and `[citation]` markers.
- **Always cap scores** — individual dimensions between 1-5, overall score max 5.0. The `cleanEval()` function enforces this.
- **Always use `fetchWithRetry()`** for Gemini API calls — handles transient 503 errors.
- **Always include the "CRITICAL: Evaluate the EXACT tool" instruction** in both single eval and compare prompts — prevents Gemini from drifting to parent products.
- **Always log feedback to Vercel function logs** as the primary record: `console.log('[FEEDBACK]', JSON.stringify(body))`.

---

## The Evaluation Prompt Architecture

### Single Evaluation
- System prompt: `EVALUATION_FRAMEWORK` + `SINGLE_OUTPUT_FORMAT`
- Contains: Writing Quality Rules, Evaluation Framework (8 sections), Scoring Rubric, Calibration Rules, Budget Rules, Source Quality (two-tier), Bottom Line instruction
- User message includes: tool name, URL, user context (role, stack, comfort, purpose, budget, additional context)
- `maxOutputTokens: 4000`, `temperature: 0.3`

### Compare Mode
- System prompt: `COMPARE_FRAMEWORK` + `COMPARE_OUTPUT_FORMAT`
- Accepts 2-3 tools
- Output includes: per-tool scorecards, head-to-head table, best-for profiles, verdict
- `maxOutputTokens: 6000`, `temperature: 0.3`
- Each tool name is listed on its own line with explicit "evaluate EXACT name" instruction

### Key Prompt Rules
- **Anti-filler:** 7 banned phrases ("It's worth noting," "In today's landscape," etc.)
- **Anti-padding:** "Free tier includes 2000 queries/day" not "The tool offers a generous free tier..."
- **Anti-marketing:** Never parrot the tool's website language
- **Plain text enforcement:** "No markdown, no asterisks, no bold, no headers, no citations"
- **Plain language for non-technical users:** If user comfort is "No code" or "Can read code," every sentence must be understandable without Googling
- **Comparative strengths:** Must compare to a named alternative
- **Consequence-based limitations:** Must name what the user CANNOT do
- **Source quality two-tier:** Tier 1 (official sites, publications, G2/Capterra) for scores. Tier 2 (Reddit, HN, Twitter) for community_opinions field only, prefixed with source, summarized never quoted
- **Budget rules:** Category-specific, don't penalize free tools for companion costs, respect stated budget in alternatives
- **Score calculation:** Backend prompt says "CALCULATE: add 8 scores, divide by 8, round to 0.5." Frontend recalculates anyway as safety net.

---

## JSON Output Format (Single Evaluation)

```json
{
  "tool_name": "string",
  "tool_url": "string",
  "one_line_verdict": "string (max 100 chars)",
  "what_it_does": "string",
  "who_its_for": ["string"],
  "practical_cost": "string",
  "strengths": ["string"],
  "limitations": ["string"],
  "build_vs_buy": "string",
  "alternatives": [{"name": "string", "url": "string", "why": "string"}],
  "watch_out_for": ["string"],
  "community_opinions": ["string prefixed with [Reddit], [HN], etc."],
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
  "bottom_line": "string",
  "name_correction": "string or null"
}
```

---

## JSON Output Format (Compare Mode)

```json
{
  "tools": [
    {
      "tool_name": "string",
      "tool_url": "string",
      "one_line_verdict": "string",
      "what_it_does": "string",
      "practical_cost": "string",
      "strengths": ["string"],
      "limitations": ["string"],
      "scorecard": { ... same 8 dimensions ... },
      "overall_score": number
    }
  ],
  "head_to_head": [
    {"dimension": "string", "winner": "string", "reason": "string"}
  ],
  "best_for": [
    {"tool_name": "string", "ideal_user": "string"}
  ],
  "verdict": "string"
}
```

---

## Problems Solved & How

### JSON parsing failures (Gemini returns invalid JSON)
**Problem:** Gemini wraps JSON in markdown fences, includes preamble text, adds trailing commas, embeds control characters, or splits response across multiple parts.
**Solution:** Multi-layer parsing:
1. Backend: strip markdown fences → depth-tracking brace finder → trailing comma fix → control char removal → 5-strategy `tryParse` function
2. Frontend: if backend sends `raw: true`, frontend tries simple first-brace/last-brace parse with same cleanup
3. If both fail: `renderRawFallback()` extracts readable content using regex — tool name, verdict, strengths, limitations etc. — and displays them in formatted sections. User never sees raw JSON.

### Scores exceeding 5.0 (Gemini math errors)
**Problem:** Gemini sometimes adds scores instead of averaging, producing 6.5/5 or similar.
**Solution:** Frontend `cleanEval()` recalculates `overall_score` from individual scorecard scores: `Math.round((total/count)*2)/2`. Also caps individual scores between 1-5. The prompt still instructs Gemini to calculate correctly, but the frontend enforces it.

### Markdown bleeding into output
**Problem:** Despite "plain text only" instruction, Gemini sometimes includes `**bold**`, `## headers`, `[citations]`.
**Solution:** `stripMd()` function applied to every text field via `cleanEval()`. Strips asterisks, hash headers, backticks, citation brackets.

### Tool name drift in evaluation (e.g., "Perplexity Computer" → "Perplexity AI")
**Problem:** Gemini's Google Search finds more results for the parent product and evaluates that instead.
**Solution:** "CRITICAL: Evaluate the EXACT tool or feature named" instruction in both single and compare prompts. In compare mode, each tool is listed on its own numbered line with an individual instruction. The `name_correction` output field flags when Gemini had to interpret the name, and the frontend shows an orange banner.

### Spell-check for tool names
**Solution:** Frontend has a 150+ tool dictionary and Levenshtein distance function. On blur of the tool name field, suggests corrections: "Did you mean **Cursor**?" Clickable to replace. Backend also has `name_correction` field for post-research correction flagging.

### Mobile PDF download not working (iOS Chrome)
**Problem:** `pdf.save()` blocked on iOS Chrome. `window.print()` unreliable on mobile.
**Solution:** Generate PDF via html2canvas + jsPDF (loaded from CDN), create blob URL, trigger download via temporary `<a>` link. iOS Safari uses `window.print()` directly. Ultimate fallback: "Copy text instead" button.

### 503 errors on Gemini free tier
**Solution:** `fetchWithRetry()` wrapper retries up to 2 times with 5-second delay on 503.

### Feedback not reaching Google Sheets
**Problem:** Vercel sandboxes frontend (blocks iframes, cross-origin scripts, fetch to external domains). Backend network allowlist blocks `script.google.com`.
**Current solution:** Feedback logged to Vercel function logs as `[FEEDBACK]` entries. Google Sheets integration deferred until Vercel Pro (which allows custom network allowlist) or Make.com automation.

---

## Deployment Workflow

Raghav deploys by manually pasting files into GitHub's web editor (no Git CLI):

1. GitHub → navigate to file → pencil icon → select all → delete → paste new content → commit
2. For new files: "Add file" → "Create new file" → type path → paste → commit
3. For image files: "Add file" → "Upload files" → drag and drop → commit
4. Vercel auto-deploys after each commit (takes ~30 seconds)
5. Environment variables: Vercel dashboard → Settings → Environment Variables → add/edit → must redeploy for changes to take effect

---

## Frontend Features

- Access code gate (`?code=` URL parameter + sessionStorage persistence)
- Light/dark theme toggle (persisted to localStorage)
- Tool discovery chips (8 trending tools — one-click to pre-fill form)
- Compare mode (checkbox toggle → 1-2 additional tool fields → "Compare Tools" button)
- "Other" option on role, technical comfort, evaluating for dropdowns (reveals text input)
- Spell-check on tool name (Levenshtein distance against 150+ tool dictionary)
- Loading spinner with rotating step messages + time estimate
- Results: header with tool name link + score, TOC, "How it fits your requirements," scorecard with expandable rationale, strengths, limitations, watch out, build vs buy, alternatives with links, practical cost, community opinions (amber border)
- Name correction banner (orange, shown when Gemini corrected the tool name)
- Score recalculation + cap (frontend overrides Gemini's math)
- Markdown stripping on all text fields
- PDF download (desktop: print dialog, mobile: html2canvas + jsPDF)
- Star rating feedback widget (1-5 stars + 300-char comment)
- Favicon + OG meta tags for link previews

---

## Brand & Styling

### Colors (CSS variables)
- Navy: `#0A1628` (backgrounds, headers)
- Orange: `#FF8C42` (CTAs, highlights, accents)
- Cyan: `#00D9FF` (links, tech elements, focus states)
- Green: `#22A66E` (score 4-5, strengths)
- Amber: `#E8960C` (score 2, limitations, community opinions)
- Red: `#D94052` (score 1, warnings, errors)

### Score color mapping
- 4-5: green (Strong)
- 3: cyan (Adequate)
- 2: amber (Below avg)
- 1: red (Poor)

### Typography
- Body: `Arial, Helvetica, sans-serif`
- Mono: `'Courier New', Courier, monospace`

---

## Gemini API Rate Limits (Free Tier)

- 10 requests per minute
- 250 requests per day
- 250,000 tokens per minute
- Daily quota resets at midnight Pacific Time

---

## Known Issues

1. **JSON parsing occasionally fails** — `renderRawFallback` handles it, but users get a simplified view without the full scorecard
2. **Community opinions sometimes include near-verbatim quotes** — prompt says summarize, Gemini occasionally ignores
3. **Feedback doesn't reach Google Sheets** — blocked by Vercel network allowlist. Data is in Vercel logs.
4. **Deep compare mode can 503** — auto-retry handles most cases, but heavy comparisons (3 tools) can still fail

---

## Future Plans (Phase 2)

- Chrome extension (same API endpoint, popup UI)
- MCP server (expose `evaluate_tool` as a composable tool for LLMs)
- Custom domain (point to Vercel deployment)
- Open access (remove access code gate when quality is stable)
- Evaluation history per user (personalized recommendations based on past evaluations)
- Make.com automation for Vercel logs → Google Sheets
