const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/auth");
const ChatSession = require("../models/ChatSession");
const MedicalReport = require("../models/MedicalReport");

let _grok = null;
function getGrok() {
  if (!_grok) {
    _grok = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: process.env.GROK_BASE_URL || "https://api.x.ai/v1",
    });
  }
  return _grok;
}

const SYSTEM_PROMPT = `You are MediBot, a medical AI assistant for MediSetu, an Indian health app.

LANGUAGE DETECTION — THIS IS YOUR MOST IMPORTANT RULE:
- Look at the user's CURRENT message carefully
- If it contains English words and English sentence structure → respond in ENGLISH ONLY
- If it contains Hindi Devanagari script (क, ख, ग, etc.) → respond in HINDI ONLY  
- If it contains Roman script Hindi words (kya, hai, mera, tera, aapka, kaise) → respond in HINGLISH ONLY
- NEVER respond in Hindi if the user wrote in English
- NEVER respond in English if the user wrote in Hindi
- Match the user's language EXACTLY every single time

You help users with:
- Understanding medical reports and test results
- Explaining medicines and their side effects
- General health advice
- Symptoms and when to see a doctor

Other rules:
- Always recommend consulting a real doctor for serious concerns
- Never prescribe new medicines
- Be warm and friendly
- Use Indian context for diet advice (dal, roti, sabzi)
- Keep responses concise
Only focus on major points
`;

router.get("/session/:sessionId", protect, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      userId: req.user._id,
      sessionId: req.params.sessionId,
    });

    if (!session) return res.json({ messages: [] });

    res.json({ messages: session.messages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/message", protect, async (req, res) => {
  try {
    const { message, sessionId, language = "en" } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const sid = sessionId || uuidv4();

    let session = await ChatSession.findOne({
      userId: req.user._id,
      sessionId: sid,
    });

    if (!session) {
      session = new ChatSession({
        userId: req.user._id,
        sessionId: sid,
        messages: [],
        language,
      });
    }

    const historyMessages = session.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let reportContext = "";

    try {
      const reportDoc = await MedicalReport.findOne({
        userId: req.user._id,
      });

      if (reportDoc && reportDoc.data && reportDoc.data.size > 0) {
        const latest = [...reportDoc.data.values()]
          .filter((r) => r.status === "done")
          .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];

        if (latest && latest.extractedData) {
          const diagnosis = latest.extractedData.diagnosis || [];
          const testResults = latest.extractedData.testResults || [];
          const medicines = latest.extractedData.medicines || [];

          reportContext = `

User's latest report context:
Report: ${latest.reportName || "N/A"}
Diagnosis: ${diagnosis.join(", ") || "N/A"}
Test results: ${
            testResults
              .map((t) => `${t.testName}: ${t.value} ${t.unit} (${t.status})`)
              .join(", ") || "N/A"
          }
Medicines: ${medicines.map((m) => `${m.name} ${m.dosage}`).join(", ") || "N/A"}
`;
        }
      }
    } catch (e) {
      console.error("Report context error:", e.message);
    }

    const grokMessages = [
      { role: "system", content: SYSTEM_PROMPT + reportContext },
      ...historyMessages,
      { role: "user", content: message },
    ];

    const grok = getGrok();

    const completion = await grok.chat.completions.create({
      model: process.env.GROK_MODEL || "grok-2-latest",
      messages: grokMessages,
      max_tokens: 800,
      temperature: 0.7,
    });

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    session.messages.push({
      role: "assistant",
      content: reply,
      timestamp: new Date(),
    });

    session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await session.save();

    res.json({ reply, sessionId: sid });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({
      message: "AI service error",
      error: err.message,
    });
  }
});

router.delete("/session/:sessionId", protect, async (req, res) => {
  try {
    await ChatSession.deleteOne({
      userId: req.user._id,
      sessionId: req.params.sessionId,
    });

    res.json({ message: "Chat session cleared" });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;
