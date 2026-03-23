// Feedback endpoint v4
// Primary: Vercel function logs (always works)
// Secondary: Google Sheets via Apps Script (if FEEDBACK_SHEET_URL is set and reachable)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { rating, comment, toolName, timestamp } = req.body;

  if (!rating) {
    return res.status(400).json({ error: "Rating is required" });
  }

  const ts = timestamp || new Date().toISOString();
  const tool = toolName || "unknown";
  const cmnt = comment || "";

  // Always log to Vercel function logs — this is the reliable record
  console.log(`[FEEDBACK] Time: ${ts} | Tool: ${tool} | Rating: ${rating}/5 | Comment: ${cmnt}`);

  // Try Google Sheets if configured
  const sheetUrl = process.env.FEEDBACK_SHEET_URL;
  if (sheetUrl) {
    try {
      const params = new URLSearchParams({
        timestamp: ts,
        toolName: tool,
        rating: String(rating),
        comment: cmnt
      });
      const sheetRes = await fetch(sheetUrl + '?' + params.toString(), {
        method: 'GET',
        redirect: 'follow'
      });
      const sheetText = await sheetRes.text();
      console.log(`[SHEET] Response: ${sheetText}`);
    } catch (sheetErr) {
      console.error(`[SHEET ERROR] ${sheetErr.message}`);
    }
  }

  return res.status(200).json({ success: true });
}
