import User from "../models/User.js";
import Broadcast from "../models/Broadcast.js";
import { sendBroadcastEmail } from "../utils/sendBrodcastEmail.js";

export const sendBroadcast = async (req, res) => {
  try {
    const { subject, message, roles } = req.body;

    if (!subject || !message || !roles)
      return res.status(400).json({ message: "Missing fields" });

    const users = await User.find({ role: { $in: roles } });

    if (users.length === 0)
      return res.status(400).json({ message: "No recipients found" });

    const emails = users.map((u) => u.email);

    const emailSuccess = await sendBroadcastEmail(emails, subject, message);

    if (!emailSuccess)
      return res.status(500).json({ message: "Failed to send broadcast" });

    const broadcast = await Broadcast.create({
      adminId: req.user.id,
      subject,
      message,
      recipients: roles.map((role) => ({
        role,
        count: users.filter((u) => u.role === role).length
      }))
    });

    return res.json({
      success: true,
      message: "Broadcast email sent successfully",
      broadcast
    });

  } catch (err) {
    console.error("Broadcast Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};