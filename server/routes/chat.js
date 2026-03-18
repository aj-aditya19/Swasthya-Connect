const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/auth");
const ChatSession = require("../models/ChatSession");
const MedicalReport = require("../models/MedicalReport");

// Lazy Grok initialization
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

const SYSTEM_PROMPT = `You are MediBot, a knowledgeable and compassionate medical AI assistant built into MediSetu, an Indian health app. 

You help users:
- Understand their medical reports and test results
- Learn about medicines, their uses and side effects
- Get general health advice and lifestyle tips
- Know about symptoms and when to see a doctor
- Understand medical terminology in simple language

Important rules:
- Always respond in the same language the user writes in (Hindi or English)
- If the user writes in Hindi (Devanagari or Hinglish), respond in Hindi/Hinglish
- Always recommend consulting a real doctor for serious concerns
- Never prescribe medicines — only explain what has already been prescribed
- Be warm, friendly, and use simple everyday language
- For Indian users, use Indian context (dal, roti, chai, etc. for diet advice)
- Keep responses concise but complete

You have access to the user's latest medical report data if provided.`;

// ✅ GET session history
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

// ✅ POST message (main AI route)
router.post("/message", protect, async (req, res) => {
  try {
    const { message, sessionId, language = "en" } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const sid = sessionId || uuidv4();

    // Get or create session
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

    // Last 10 messages for context
    const historyMessages = session.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // ✅ Fetch latest medical report (safe)
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

    // ✅ Build AI messages
    const grokMessages = [
      { role: "system", content: SYSTEM_PROMPT + reportContext },
      ...historyMessages,
      { role: "user", content: message },
    ];

    // ✅ Initialize Grok properly
    const grok = getGrok();

    // ✅ Call Grok API
    const completion = await grok.chat.completions.create({
      model: process.env.GROK_MODEL || "grok-2-latest",
      messages: grokMessages,
      max_tokens: 800,
      temperature: 0.7,
    });

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    // ✅ Save messages
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

// ✅ DELETE session
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
