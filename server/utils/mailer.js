const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendOtpEmail(to, otp, name = '') {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f0f4f8;border-radius:16px;">
      <div style="background:#2b6cb0;padding:20px;border-radius:12px;text-align:center;margin-bottom:24px;">
        <h1 style="color:white;margin:0;font-size:22px;">MediSetu</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Your Health Companion</p>
      </div>
      <div style="background:white;padding:28px;border-radius:12px;">
        <h2 style="margin:0 0 8px;font-size:18px;color:#1a202c;">Hello${name ? ', ' + name : ''}!</h2>
        <p style="color:#4a5568;font-size:14px;margin:0 0 20px;">Your one-time verification code is:</p>
        <div style="background:#ebf4ff;border:2px dashed #2b6cb0;border-radius:10px;padding:20px;text-align:center;margin-bottom:20px;">
          <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#2b6cb0;font-family:monospace;">${otp}</span>
        </div>
        <p style="color:#718096;font-size:13px;margin:0;">This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
      </div>
      <p style="color:#a0aec0;font-size:12px;text-align:center;margin-top:16px;">If you did not request this, please ignore this email.</p>
    </div>
  `;
  await transporter.sendMail({
    from: `"MediSetu" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${otp} is your MediSetu verification code`,
    html,
  });
}

async function sendReminderEmail(to, name, medicines) {
  const medList = medicines.map(m =>
    `<li style="margin:6px 0;color:#2d3748;"><strong>${m.medicineName}</strong> ${m.dosage} — ${m.time}</li>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f0f4f8;border-radius:16px;">
      <div style="background:#2b6cb0;padding:20px;border-radius:12px;text-align:center;margin-bottom:24px;">
        <h1 style="color:white;margin:0;font-size:22px;">MediSetu</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Medicine Reminder</p>
      </div>
      <div style="background:white;padding:28px;border-radius:12px;">
        <h2 style="margin:0 0 8px;font-size:18px;color:#1a202c;">Time to take your medicine, ${name}!</h2>
        <p style="color:#4a5568;font-size:14px;margin:0 0 16px;">Here are your scheduled medicines:</p>
        <ul style="padding-left:20px;margin:0 0 16px;">${medList}</ul>
        <div style="background:#f0fff4;border:1px solid #9ae6b4;border-radius:8px;padding:12px;font-size:13px;color:#276749;">
          Stay consistent with your medicines for the best results. Take care!
        </div>
      </div>
    </div>
  `;
  await transporter.sendMail({
    from: `"MediSetu" <${process.env.GMAIL_USER}>`,
    to,
    subject: `MediSetu Reminder: Time to take your medicine`,
    html,
  });
}

module.exports = { sendOtpEmail, sendReminderEmail };
