import nodemailer from "nodemailer";

export const sendClaimUpdateEmail = async (to, subject, claim) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_HOST || "smtp-relay.brevo.com",
      port: parseInt(process.env.BREVO_PORT || "587", 10),
      secure: false,
      auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_API_KEY,
      },
    });

    const html = `
      <h2>${subject}</h2>
      <p>Your claim has been updated.</p>
      <ul>
        <li><strong>Claim ID:</strong> ${claim._id}</li>
        <li><strong>Status:</strong> ${claim.status}</li>
        <li><strong>Severity:</strong> ${claim.severity || "N/A"}</li>
        <li><strong>Estimated Repair Cost:</strong> ${claim.estimatedCost || "N/A"}</li>
        <li><strong>Remarks:</strong> ${claim.remarks || "None"}</li>
      </ul>
      <p>Regards,<br/>AutoSureAI Team</p>
    `;

    await transporter.sendMail({
      from: process.env.BREVO_EMAIL,
      to,
      subject,
      html,
    });

    console.log("Claim update email sent to", to);
  } catch (err) {
    console.error("sendClaimUpdateEmail error:", err);
  }
};
