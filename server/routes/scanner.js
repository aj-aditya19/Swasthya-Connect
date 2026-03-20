const express = require("express");
const router = express.Router();
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const { protect } = require("../middleware/auth");

const upload = multer({ dest: "uploads/scanner/" });

let _client = null;
function getClient() {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return _client;
}

// ── Language name map for prompt injection ──────────────────────────
const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi (हिंदी)",
  ta: "Tamil (தமிழ்)",
  bn: "Bengali (বাংলা)",
  te: "Telugu (తెలుగు)",
  mr: "Marathi (मराठी)",
};

// ── Category prompt templates ────────────────────────────────────────
// {LANGUAGE} placeholder gets replaced at runtime
const PROMPTS = {
  medicine: `You are a pharmacist. Analyse this medicine image and return JSON only.
IMPORTANT: Write ALL text values (summary, keyPoints, warning, medicine names and uses) in {LANGUAGE}.
{
  "summary": "what this medicine is for in 2 simple sentences",
  "keyPoints": ["how to take it", "common side effects", "when to avoid"],
  "medicines": [{"name": "medicine name", "use": "what it treats"}],
  "warning": "any important warning or empty string"
}`,

  terms: `You are a legal expert. Analyse this terms & conditions document and return JSON only.
IMPORTANT: Write ALL text values (summary, keyPoints, warning) in {LANGUAGE}.
{
  "summary": "what this document is about in simple sentences focus on points",
  "keyPoints": ["most important point 1", "most important point 2", "most important point 3", "most important point 4"],
  "medicines": [],
  "warning": "any concerning clause the user should know about or empty string"
}`,

  report: `You are a doctor. Analyse this medical report image and return JSON only.
IMPORTANT: Write ALL text values (summary, keyPoints, warning) in {LANGUAGE}.
{
  "summary": "what this report shows in simple sentences, in points",
  "keyPoints": ["key finding 1", "key finding 2", "key finding 3"],
  "medicines": [],
  "warning": "any abnormal value or concern or empty string"
}`,

  insurance: `You are an insurance expert. Analyse this insurance document and return JSON only.
IMPORTANT: Write ALL text values (summary, keyPoints, warning) in {LANGUAGE}.
{
  "summary": "what this insurance covers in simple sentences in points",
  "keyPoints": ["coverage point 1", "coverage point 2", "exclusion to note", "claim process"],
  "medicines": [],
  "warning": "any important exclusion or limitation or empty string"
}`,

  bill: `You are a medical billing expert. Analyse this hospital bill and return JSON only.
IMPORTANT: Write ALL text values (summary, keyPoints, warning) in {LANGUAGE}.
{
  "summary": "summary of this bill in 2 simple sentences in points",
  "keyPoints": ["total amount", "major charges", "insurance claimable items"],
  "medicines": [],
  "warning": "any overcharge concern or empty string"
}`,

  other: `Analyse this document image and return JSON only.
IMPORTANT: Write ALL text values (summary, keyPoints, warning) in {LANGUAGE}.
{
  "summary": "what this document is about in simple sentences, in points",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "medicines": [],
  "warning": "any important information or empty string"
}`,
};

// ── Build final prompt with language injected ────────────────────────
function buildPrompt(category, languageCode) {
  const template = PROMPTS[category] || PROMPTS.other;
  const languageName = LANGUAGE_NAMES[languageCode] || "English";
  return template.replace(/\{LANGUAGE\}/g, languageName);
}

// ── Route ────────────────────────────────────────────────────────────
router.post("/analyse", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const category = req.body.category || "other";
    const language = req.body.language || "en"; // ← read language from request
    const prompt = buildPrompt(category, language);

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";

    const completion = await getClient().chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.1,
    });

    let content = completion.choices[0].message.content.trim();

    // Strip markdown code fences if any
    content = content.replace(/```json\s*/gi, "");
    content = content.replace(/```\s*/gi, "");
    content = content.trim();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    content = jsonMatch[0];

    const result = JSON.parse(content);

    fs.unlinkSync(req.file.path);

    res.json(result);
  } catch (err) {
    console.error("Scanner error:", err.message);
    if (req.file?.path && fs.existsSync(req.file.path))
      fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

module.exports = router;
