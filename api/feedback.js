export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const body = req.body || {};
    console.log("[FEEDBACK]", JSON.stringify(body));

    const sheetUrl = process.env.FEEDBACK_SHEET_URL;
    if (sheetUrl && body.rating) {
      const p = "?timestamp=" + encodeURIComponent(body.timestamp || new Date().toISOString())
        + "&toolName=" + encodeURIComponent(body.toolName || "unknown")
        + "&rating=" + encodeURIComponent(body.rating)
        + "&comment=" + encodeURIComponent(body.comment || "");
      await fetch(sheetUrl + p).catch(function(){});
    }
  } catch (e) {
    console.log("[FEEDBACK ERROR]", e.message);
  }

  return res.status(200).json({ ok: true });
}
