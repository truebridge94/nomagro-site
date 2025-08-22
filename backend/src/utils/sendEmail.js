// backend/src/utils/email.js
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // 🚨 Check if SMTP is configured
    const isConfigured = process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS;

    if (!isConfigured) {
      console.log("📧 SMTP not configured. Running in debug mode:");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("Body (text):", text || "(no text)");
      console.log("Body (html):", html || "(no HTML)");
      return;
    }

    // ✅ Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Optional: Add logging in development
      // logger: true,
      // debug: true
    });

    // ✅ Send email
    await transporter.sendMail({
      from: `"Nomagro" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text, // Fallback for plain text
      html, // Rendered HTML
    });

    console.log(`✅ Email successfully sent to ${to}`);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message || err);
    throw new Error("Unable to send email. Please try again later.");
  }
};

module.exports = sendEmail;