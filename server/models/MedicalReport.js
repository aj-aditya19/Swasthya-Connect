const mongoose = require('mongoose');

const reportDataSchema = new mongoose.Schema({
  reportName:  { type: String, required: true },
  fileType:    { type: String, enum: ['pdf', 'image'] },
  link:        { type: String, required: true }, // local path or cloudinary URL
  // cloudinaryPublicId: { type: String }, // uncomment when using cloudinary
  uploadedAt:  { type: Date, default: Date.now },
  status:      { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
  extractedData: {
    summary:      { type: String, default: '' },
    doctorName:   { type: String, default: '' },
    hospitalName: { type: String, default: '' },
    reportDate:   { type: String, default: '' },
    diagnosis:    { type: String, default: '' },
    medicines: [{
      name: String, dosage: String, frequency: String, duration: String,
    }],
    testResults: [{
      testName: String, value: String, unit: String,
      normalRange: String,
      status: { type: String, enum: ['normal', 'high', 'low', 'unknown'], default: 'unknown' },
    }],
    advice:       { type: String, default: '' },
    followUpDate: { type: String, default: '' },
    rawText:      { type: String, default: '' },
  },
}, { _id: true, timestamps: true });

const medicalReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data:   { type: Map, of: reportDataSchema, default: {} },
}, { timestamps: true });

medicalReportSchema.index({ userId: 1 });
module.exports = mongoose.model('MedicalReport', medicalReportSchema);
