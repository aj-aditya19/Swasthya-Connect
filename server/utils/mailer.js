const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendOtpEmail(to, otp, name = "") {
  await transporter.sendMail({
    from: `"MediSetu" <${process.env.GMAIL_USER}>`,
    to,
    subject: `MediSetu Verification OTP`,
    text: `${otp} is your MediSetu verification code
    Do not share this OTP with another persons`,
  });
}

async function sendReminderEmail(to, name, medicines) {
  const medList = medicines
    .map(
      (m) =>
        `<li style="margin:6px 0;color:#2d3748;"><strong>${m.medicineName}</strong> ${m.dosage} — ${m.time}</li>`,
    )
    .join("");

  await transporter.sendMail({
    from: `"MediSetu" <${process.env.GMAIL_USER}>`,
    to,
    subject: `MediSetu Reminder`,
    text: `Time to take your medicine. Be aware about your health`,
  });
}

module.exports = { sendOtpEmail, sendReminderEmail };
