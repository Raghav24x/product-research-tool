import { fetchYouTubeTraction } from "../api/evaluate.js";

const toolName = process.argv[2] || "Notion";

const result = await fetchYouTubeTraction(toolName);
console.log(JSON.stringify(result, null, 2));
