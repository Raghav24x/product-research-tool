// Feedback capture endpoint
// Logs user feedback to Vercel function logs
// View at: Vercel dashboard → your project → Logs tab

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { rating, comment, toolName } = req.body;

  if (!rating || !["up", "down"].includes(rating)) {
    return res.status(400).json({ error: "Rating must be 'up' or 'down'" });
  }

  const timestamp = new Date().toISOString();
  console.log(`[FEEDBACK] Tool: ${toolName || "unknown"} | Rating: ${rating} | Comment: ${comment || "none"} | Time: ${timestamp}`);

  return res.status(200).json({ success: true });
}
