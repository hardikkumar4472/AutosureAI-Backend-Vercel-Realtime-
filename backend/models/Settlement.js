import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", required: true },
  settledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["bank_transfer", "cheque", "cash", "other"], default: "bank_transfer" },
  reference: { type: String },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model("Settlement", settlementSchema);
