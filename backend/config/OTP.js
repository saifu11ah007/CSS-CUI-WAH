const nodemailer = require('nodemailer');

const sendEmailOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,   // ✅ enable logs
      debug: true     // ✅ show SMTP conversation
    });

    const mailOptions = {
      from: `"Comsats Sports Society 🚀" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Use this code to verify your account.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent to:', email);
    console.log('MessageId:', info.messageId);
    console.log('SMTP Response:', info.response);

  } catch (err) {
    console.error('❌ Error sending OTP email:', err);
    throw err;
  }
};

module.exports = { sendEmailOTP };
