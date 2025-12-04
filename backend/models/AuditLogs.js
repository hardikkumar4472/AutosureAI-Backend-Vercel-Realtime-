import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "agent", "traffic", "driver", "unknown"] },

    actionType: { type: String, required: true },

    description: { type: String, required: true },

    statusCode: Number,

    ipAddress: String,

    userAgent: String
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditSchema);
