const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  eligibility: { type: String, default: '' },
  state:       { type: String, default: 'central' },
  category:    { type: String, enum: ['insurance', 'medicine', 'maternal', 'disability', 'general'], default: 'general' },
  sourceUrl:   { type: String, default: '' },
  launchedAt:  { type: Date, default: null },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

governmentSchemeSchema.index({ state: 1, category: 1 });
module.exports = mongoose.model('GovernmentScheme', governmentSchemeSchema);
