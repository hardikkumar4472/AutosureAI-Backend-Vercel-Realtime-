import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Accident", required: true },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  severity: { type: String, enum: ["minor", "moderate", "severe"] },
  estimatedCost: { type: Number },

  status: {
    type: String,
    enum: ["pending", "in_review", "approved", "rejected", "settled"],
    default: "pending",
  },

  remarks: { type: String },

  settlementInfo: {
    settlementId: { type: mongoose.Schema.Types.ObjectId, ref: "Settlement" },
    amount: Number,
    method: String,
    reference: String,
    notes: String,
    settledAt: Date,
  },
  reassignmentHistory: [
  {
    fromAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    toAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    changedAt: { type: Date, default: Date.now }
  }
],

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Claim", claimSchema);