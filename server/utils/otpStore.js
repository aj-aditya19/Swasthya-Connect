// In-memory OTP store — swap with Redis in production
// Structure: Map<email, { otp, expiry }>
const otpStore = new Map();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function storeOtp(email, otp) {
  otpStore.set(email.toLowerCase(), {
    otp,
    expiry: Date.now() + OTP_TTL_MS,
  });
}

function verifyOtp(email, otp) {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return { valid: false, reason: 'No OTP found. Please request a new one.' };
  if (Date.now() > entry.expiry) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: 'OTP expired. Please request a new one.' };
  }
  if (entry.otp !== otp) return { valid: false, reason: 'Invalid OTP.' };
  otpStore.delete(email.toLowerCase()); // one-time use
  return { valid: true };
}

function clearOtp(email) {
  otpStore.delete(email.toLowerCase());
}

module.exports = { generateOtp, storeOtp, verifyOtp, clearOtp };
