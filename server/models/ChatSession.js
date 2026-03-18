const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true, unique: true },
  messages: [{
    role:      { type: String, enum: ['user', 'assistant'], required: true },
    content:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  language:  { type: String, default: 'en' },
  isActive:  { type: Boolean, default: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
}, { timestamps: true });

chatSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
chatSessionSchema.index({ userId: 1, sessionId: 1 });
module.exports = mongoose.model('ChatSession', chatSessionSchema);
