import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    subject: { type: String, required: true },

    message: { type: String, required: true }, 

    recipients: [
      {
        role: { type: String, enum: ["driver", "agent", "traffic"] },
        count: Number
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Broadcast", broadcastSchema);