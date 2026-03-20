const express = require("express");
const router = express.Router();
const streamifier = require("streamifier");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const MedicalReport = require("../models/MedicalReport");
const axios = require("axios");
const FormData = require("form-data");

// ── helpers ───────────────────────────────────────────────────────────────────

function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// ── GET /api/reports ──────────────────────────────────────────────────────────

router.get("/", protect, async (req, res) => {
  try {
    const doc = await MedicalReport.findOne({ userId: req.user._id });
    if (!doc) return res.json({ data: {} });

    const data = {};
    for (const [key, val] of doc.data.entries()) data[key] = val;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/reports/upload ──────────────────────────────────────────────────

router.post("/upload", protect, upload.single("report"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { reportName } = req.body;
    if (!reportName)
      return res.status(400).json({ message: "Report name is required" });

    const fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
      folder: `medisetu/${req.user._id}`,
      resource_type: fileType === "pdf" ? "raw" : "image",
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    });

    const slug =
      reportName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "") +
      "_" +
      Date.now();

    let doc = await MedicalReport.findOne({ userId: req.user._id });
    if (!doc)
      doc = new MedicalReport({ userId: req.user._id, data: new Map() });

    doc.data.set(slug, {
      reportName,
      fileType,
      link: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
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

    // Trigger AI analysis in background
    triggerAnalysis(
      req.user._id.toString(),
      slug,
      cloudinaryResult.secure_url,
      fileType,
      req.file.buffer,
      req.file.mimetype,
    ).catch(console.error);

    res
      .status(201)
      .json({ message: "Report uploaded. AI analysis started.", slug });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── AI analysis (background) ──────────────────────────────────────────────────

async function triggerAnalysis(
  userId,
  slug,
  fileUrl,
  fileType,
  fileBuffer,
  mimeType,
) {
  try {
    await MedicalReport.updateOne(
      { userId, [`data.${slug}.status`]: "pending" },
      { $set: { [`data.${slug}.status`]: "processing" } },
    );

    // Use the buffer we already have from the upload (no need to re-download)
    const form = new FormData();
    form.append("file", fileBuffer, {
      filename: fileType === "pdf" ? "report.pdf" : "report.jpg",
      contentType: mimeType,
    });
    form.append("file_type", fileType);

    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/analyze`,
      form,
      { headers: form.getHeaders(), timeout: 120000 },
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

// ── DELETE /api/reports/:slug ─────────────────────────────────────────────────

router.delete("/:slug", protect, async (req, res) => {
  try {
    const doc = await MedicalReport.findOne({ userId: req.user._id });
    if (!doc || !doc.data.has(req.params.slug))
      return res.status(404).json({ message: "Report not found" });

    const report = doc.data.get(req.params.slug);

    // Delete from Cloudinary
    if (report.cloudinaryPublicId) {
      const resourceType = report.fileType === "pdf" ? "raw" : "image";
      await cloudinary.uploader.destroy(report.cloudinaryPublicId, {
        resource_type: resourceType,
      });
    }

    doc.data.delete(req.params.slug);
    await doc.save();
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
