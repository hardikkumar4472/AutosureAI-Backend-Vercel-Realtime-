import SibApiV3Sdk from "sib-api-v3-sdk";

export const sendOtpEmail = async (email, otp) => {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "AutoSureAI - Verify Your Email";
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2>Your OTP Code</h2>
        <h1 style="color:#007bff;">${otp}</h1>
        <p>This code is valid for 10 minutes.</p>
        <p>Thank you for using AutoSureAI 🚗</p>
      </div>
    `;
    sendSmtpEmail.sender = { name: "AutoSureAI", email: process.env.SMTP_FROM };
    sendSmtpEmail.to = [{ email }];

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ OTP email sent to ${email}. Message ID: ${response.messageId || "N/A"}`);
  } catch (error) {
    console.error("❌ OTP email send error:", error.response?.text || error.message);
    throw new Error("Failed to send OTP email");
  }
};
