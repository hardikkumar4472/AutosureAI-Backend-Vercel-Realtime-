import axios from "axios";

export const sendBroadcastEmail = async (emails, subject, htmlContent) => {
  try {
    const payload = {
      sender: {
        name: "AutoSureAI",
        email: process.env.BREVO_SMTP_USER
      },
      to: emails.map(email => ({ email })),
      subject,
      htmlContent: `<div style="font-size:16px;">${htmlContent}</div>`
    };

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return true;

  } catch (err) {
    console.error("🔥 REAL BREVO ERROR →", err.response?.data || err.message);
    return false;
  }
};
