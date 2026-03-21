// Feedback capture endpoint
// Sends feedback directly to a Google Sheet via Apps Script web app
//
// SETUP (one-time, 5 minutes):
// 1. Open Google Sheets → create a new sheet
// 2. Add headers in row 1: Timestamp | Tool | Rating | Comment
// 3. Go to Extensions → Apps Script
// 4. Paste this code in the script editor:
//
//    function doPost(e) {
//      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//      var data = JSON.parse(e.postData.contents);
//      sheet.appendRow([data.timestamp, data.toolName, data.rating, data.comment]);
//      return ContentService.createTextOutput(JSON.stringify({status: "ok"}))
//        .setMimeType(ContentService.MimeType.JSON);
//    }
//
// 5. Click Deploy → New deployment → Type: Web app
//    → Execute as: Me → Who has access: Anyone
//    → Deploy → copy the URL
// 6. Add the URL as FEEDBACK_SHEET_URL in Vercel environment variables
//
// That's it. Every feedback submission goes straight to your sheet.

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
  const payload = { timestamp, toolName: toolName || "unknown", rating, comment: comment || "" };

  // Always log to Vercel function logs as backup
  console.log(`[FEEDBACK] ${JSON.stringify(payload)}`);

  // Send to Google Sheet if configured
  const sheetUrl = process.env.FEEDBACK_SHEET_URL;
  if (sheetUrl) {
    try {
      await fetch(sheetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (sheetError) {
      console.error("Sheet write failed:", sheetError.message);
      // Don't block the user — feedback is still in logs
    }
  }

  return res.status(200).json({ success: true });
}
