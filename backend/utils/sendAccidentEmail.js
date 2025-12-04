import SibApiV3Sdk from "sib-api-v3-sdk";
import fs from "fs";

export const sendAccidentEmail = async (to, result, pdfPath) => {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "AutoSureAI - Damage Report Summary";
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial; text-align: left;">
        <h3>🚗 AutoSureAI Damage Report</h3>
        <p><b>Severity:</b> ${result.prediction?.severity}</p>
        <p><b>Confidence:</b> ${result.prediction?.confidence}%</p>
        <p><b>Estimated Cost:</b> $${result.repair_cost?.estimated_cost}</p>
        <p>📄 The full damage report is attached as a PDF.</p>
      </div>
    `;
    sendSmtpEmail.sender = { name: "AutoSureAI", email: process.env.SMTP_FROM };
    sendSmtpEmail.to = [{ email: to }];

    if (pdfPath && fs.existsSync(pdfPath)) {
      const fileData = fs.readFileSync(pdfPath).toString("base64");
      sendSmtpEmail.attachment = [
        {
          content: fileData,
          name: pdfPath.split("/").pop(),
        },
      ];
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Accident report email with PDF sent to ${to}`);
  } catch (error) {
    console.error("❌ Brevo Email Error:", error.response?.text || error.message);
    throw new Error("Failed to send accident email");
  }
};
