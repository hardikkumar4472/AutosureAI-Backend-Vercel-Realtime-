import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String },
  attachments: [{ type: String }], 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChatMessage", messageSchema);