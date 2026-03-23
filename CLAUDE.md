# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local Development

```bash
npm install
npx vercel dev
```

Opens at `http://localhost:3000`. Requires environment variables (see below).

## Environment Variables

Set these in Vercel project settings or a local `.env` file:

- `GEMINI_API_KEY` — Google Gemini API key (required for evaluations)
- `ACCESS_CODE` — Gate code for private beta (defaults to `cashcache2026`)
- `FEEDBACK_SHEET_URL` — Google Sheets webhook URL for feedback logging (optional)
- `RESEND_API_KEY` — For email delivery via Resend (optional, see `api/capture.js`)

## Architecture

This is a **no-framework, no-build-step** web app deployed on Vercel.

- `public/index.html` — Entire frontend in one file: HTML, CSS (`<style>`), and JS (`<script>`). No bundler, no React, no imports.
- `api/evaluate.js` — Vercel serverless function. Calls **Gemini 2.5 Flash** via raw REST (no SDK). Handles both single-tool evaluation and side-by-side comparison of 2–3 tools.
- `api/capture.js` — Lead capture endpoint. Logs email + tool name to console. Email delivery via Resend is stubbed out and commented in.
- `api/feedback.js` — Logs star ratings + comments to console and optionally forwards to a Google Sheets webhook.

## Key Design Decisions

**AI model:** The backend uses Gemini 2.5 Flash (not Claude) via direct REST calls to `generativelanguage.googleapis.com`. Web search is enabled via `tools: [{ google_search: {} }]`.

**Two evaluation modes:** `mode: "evaluate"` (single tool) and `mode: "compare"` (2–3 tools). The frontend sends `mode` in the POST body; the backend selects `EVALUATION_FRAMEWORK` or `COMPARE_FRAMEWORK` accordingly.

**JSON parsing:** Gemini sometimes returns malformed JSON. `api/evaluate.js` has a multi-strategy `tryParse()` function (5 fallback strategies) to handle trailing commas, unescaped newlines, and control characters. If all strategies fail, the response falls back to `{ raw: true, content: "..." }`.

**Access control:** Every `/api/evaluate` request must include a matching `accessCode` in the POST body. This is a simple private-beta gate, not authentication.

**Evaluation framework:** The full LLM system prompt lives as `EVALUATION_FRAMEWORK` and `COMPARE_FRAMEWORK` constants at the top of `api/evaluate.js`. Modifying these constants changes what every future evaluation produces. The framework enforces plain-text output (no markdown), specific scoring rubrics, and user-context calibration.

**Frontend state:** No framework — the frontend manages state via direct DOM manipulation and `display: none / block` toggling on `.loading-container` and `.results-container`.
