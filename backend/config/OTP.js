const nodemailer = require("nodemailer");

const sendEmailOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"COMSATS Sports Society 🏅" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - COMSATS Sports Society",
      html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Use this code to verify your account for Sports Week registration.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP Email sent to:", email);
    console.log("Response:", info.response);
  } catch (err) {
    console.error("❌ Error sending OTP email:", err.message);
    throw err;
  }
};

module.exports = sendEmailOTP;
