const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const MedicalReport = require("../models/MedicalReport");

router.get("/", protect, async (req, res) => {
  try {
    let doc = await MedicalReport.findOne({ userId: req.user._id });
    if (!doc) {
      return res.json({ data: {} });
    }
    const data = {};
    for (const [key, val] of doc.data.entries()) {
      data[key] = val;
    }
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/upload", protect, upload.single("report"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const { reportName } = req.body;
    if (!reportName) {
      return res.status(400).json({ message: "Report name is required" });
    }

    const slug =
      reportName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "") +
      "_" +
      Date.now();
    const fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";
    const fileUrl = `/uploads/${req.user._id}/${req.file.filename}`;
    let doc = await MedicalReport.findOne({ userId: req.user._id });
    if (!doc)
      doc = new MedicalReport({ userId: req.user._id, data: new Map() });

    doc.data.set(slug, {
      reportName,
      fileType,
      link: fileUrl,
      status: "pending",
      uploadedAt: new Date(),
      extractedData: {
        summary: "",
        doctorName: "",
        hospitalName: "",
        reportDate: "",
        diagnosis: "",
        medicines: [],
        testResults: [],
        advice: "",
        followUpDate: "",
        rawText: "",
      },
    });
    await doc.save();
    triggerAnalysis(
      req.user._id.toString(),
      slug,
      req.file.path,
      fileType,
      doc._id,
    ).catch(console.error);

    res
      .status(201)
      .json({ message: "Report uploaded. AI analysis started.", slug });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

async function triggerAnalysis(userId, slug, filePath, fileType, docId) {
  try {
    await MedicalReport.updateOne(
      { userId, [`data.${slug}.status`]: "pending" },
      { $set: { [`data.${slug}.status`]: "processing" } },
    );

    const FormData = require("form-data");
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("file_type", fileType);

    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/analyze`,
      form,
      {
        headers: form.getHeaders(),
        timeout: 120000,
      },
    );

    const result = response.data;

    const doc = await MedicalReport.findOne({ userId });
    if (doc && doc.data.has(slug)) {
      const entry = doc.data.get(slug);
      entry.status = "done";
      entry.extractedData = result;
      doc.data.set(slug, entry);
      await doc.save();
    }
  } catch (err) {
    console.error("AI analysis error:", err.message);
    await MedicalReport.updateOne(
      { userId },
      { $set: { [`data.${slug}.status`]: "failed" } },
    );
  }
}

router.delete("/:slug", protect, async (req, res) => {
  try {
    const doc = await MedicalReport.findOne({ userId: req.user._id });
    if (!doc || !doc.data.has(req.params.slug)) {
      return res.status(404).json({ message: "Report not found" });
    }

    const report = doc.data.get(req.params.slug);

    const localPath = path.join(__dirname, "..", report.link);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    doc.data.delete(req.params.slug);
    await doc.save();
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
