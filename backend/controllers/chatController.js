import ChatMessage from "../models/Chat.js";
import Claim from "../models/Claim.js";
import { io } from "../server.js";

export const fetchMessages = async (req, res) => {
  try {
    const claimId = req.params.claimId;
    const messages = await ChatMessage.find({ claimId }).populate("sender", "name role");
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const claimId = req.params.claimId;
    const { message, attachments } = req.body;

    const msg = await ChatMessage.create({
      claimId,
      sender: req.user.id,
      message,
      attachments
    });

    const populated = await msg.populate("sender", "name role").execPopulate?.() || await ChatMessage.findById(msg._id).populate("sender", "name role");

    io.to(`claim_${claimId}`).emit("receive_chat", populated);

    res.json({ success: true, message: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};