import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["unverified", "verified", "fraudulent"],
    default: "unverified",
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  evidence: [{ type: String }], 
  remarks: { type: String, default: "" },
  verifiedAt: { type: Date }
}, { _id: false });

const accidentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number },
      lon: { type: Number },
      address: { type: String },
    },
    prediction: {
      severity: {
        type: String,
        enum: ["minor", "moderate", "severe"],
        required: true,
      },
      confidence: {
        type: Number,
        required: true,
      },
      class_probabilities: {
        minor: { type: Number, default: 0 },
        moderate: { type: Number, default: 0 },
        severe: { type: Number, default: 0 },
      },
    },
    repair_cost: {
      estimated_cost: { type: Number, required: true },
      min_cost: { type: Number, required: true },
      max_cost: { type: Number, required: true },
      currency: { type: String, default: "USD" },
      confidence: { type: Number },
    },

    status: {
      type: String,
      enum: ["Pending", "Analyzed", "Reviewed", "Closed"],
      default: "Analyzed",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    verification: {
      type: verificationSchema,
      default: () => ({})
    },
    trafficVerification: {
      firNumber: { type: String },
      policeStation: { type: String },
      firDocumentUrl: { type: String }, 
      officerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      verifiedAt: { type: Date }
  },

    claimId: { type: mongoose.Schema.Types.ObjectId, ref: "Claim" },
    reportUrl: { type: String } // PDF report URL stored in Supabase
  },
  { timestamps: true }
);

export default mongoose.model("Accident", accidentSchema);