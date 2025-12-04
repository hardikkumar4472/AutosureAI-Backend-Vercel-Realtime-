import axios from "axios";

export const sendPasswordResetEmail = async (email, otp) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "AutoSureAI",
          email: process.env.BREVO_SMTP_USER
        },
        to: [{ email }],
        subject: "AutoSureAI Password Reset OTP",
        htmlContent: `
          <h2>Your Password Reset OTP</h2>
          <p>Your OTP is: <strong>${otp}</strong></p>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        `
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return true;
  } catch (err) {
    console.error("Password Reset Email Error:", err.response?.data || err.message);
    return false;
  }
};
