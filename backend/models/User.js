import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    phone: String,
    vehicleNumber: { type: String, unique: true, sparse: true },
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },

    role: {
      type: String,
      enum: ["driver", "agent", "traffic", "admin"],
      default: "driver",
    },

    assignedClaims: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Claim" }
    ],

    currentLoad: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);