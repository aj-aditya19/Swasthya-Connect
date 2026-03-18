const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  medicalId: { type: String, unique: true },
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone:     { type: String, default: '' },
  age:       { type: Number, default: null },
  gender:    { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  bloodGroup:{ type: String, default: '' },
  address:   { type: String, default: '' },
  preferredLanguage: { type: String, enum: ['en', 'hi', 'ta', 'bn', 'te'], default: 'en' },
  profilePic:{ type: String, default: '' },
  isVerified:{ type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.medicalId) {
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.medicalId = `MED-${year}-${rand}`;
  }
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
