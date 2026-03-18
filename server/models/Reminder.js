const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineName: { type: String, required: true },
  dosage:       { type: String, default: '' },
  scheduleTimes:[{ type: String }], // ["08:00", "20:00"]
  frequency:    { type: String, enum: ['daily', 'alternate', 'weekly'], default: 'daily' },
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, default: null },
  isActive:     { type: Boolean, default: true },
  takenLog: [{
    date:       { type: String }, // "YYYY-MM-DD"
    time:       { type: String }, // "08:00"
    takenOrNot: { type: Boolean, default: false },
  }],
}, { timestamps: true });

reminderSchema.index({ userId: 1, isActive: 1 });
module.exports = mongoose.model('Reminder', reminderSchema);
