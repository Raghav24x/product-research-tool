# Product Research Tool — Cash & Cache

Evaluate any AI tool in minutes. Structured, honest, calibrated to your context.

## Project Structure

```
product-research-tool/
  api/
    evaluate.js        ← Vercel serverless function (calls Anthropic API)
  public/
    index.html         ← Frontend (single page, no framework)
  package.json
  vercel.json
  .env.example
```

## Deploy to Vercel (5 minutes)

### Prerequisites
- A [Vercel](https://vercel.com) account (free tier works)
- An [Anthropic API key](https://console.anthropic.com/)
- A [GitHub](https://github.com) account

### Steps

1. **Push to GitHub**
   Create a new repo and push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/product-research-tool.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Vercel auto-detects the project settings

3. **Add your API key**
   - In Vercel project settings → Environment Variables
   - Add: `ANTHROPIC_API_KEY` = your key from console.anthropic.com
   - This keeps your key server-side only (never exposed to the browser)

4. **Deploy**
   - Click Deploy. Vercel handles everything.
   - Your tool is live at `your-project.vercel.app`

### Local Development

```bash
npm install
npx vercel dev
```

Open `http://localhost:3000` in your browser.

## How It Works

1. User enters a tool name and their context (role, stack, technical comfort, budget)
2. Frontend sends a POST request to `/api/evaluate`
3. The serverless function calls Claude (Sonnet 4.6) with:
   - The evaluation framework as the system prompt
   - Web search enabled for live research
   - The user's context for calibration
4. Claude researches the tool and returns a structured JSON evaluation
5. Frontend renders the scorecard, strengths, limitations, and verdict

## Customising the Evaluation Framework

The framework lives in `api/evaluate.js` as the `EVALUATION_FRAMEWORK` constant. To add new evaluation criteria, edit the system prompt. Every future evaluation will automatically include your changes.

## Cost

- **Hosting**: Free (Vercel free tier)
- **API**: ~$0.03–0.10 per evaluation (Claude Sonnet 4.6 with web search)
- **For 100 evaluations**: ~$5–10 total

## Beta Feedback

This is a beta. If you find issues or want to suggest improvements:
- What evaluation criteria are missing?
- Which tools did you test it on?
- Was the output useful enough to act on?

Send feedback to [cashcache.substack.com](https://cashcache.substack.com).
