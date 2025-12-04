import Claim from "../models/Claim.js";
import User from "../models/User.js";
import Accident from "../models/Accident.js";
import { io } from "../server.js";
import { sendClaimUpdateEmail } from "../utils/sendClaimEmail.js";

export const getAssignedClaims = async (req, res) => {
  try {
    const agentId = req.user.id;
    const claims = await Claim.find({ assignedAgent: agentId })
      .populate("driverId", "name email phone")
      .populate({
        path: "reportId",
        select: "imageUrl prediction repair_cost status createdAt reportUrl location verification trafficVerification",
      });
    res.json({ success: true, claims });
  } catch (err) {
    console.error("getAssignedClaims error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getClaimDetails = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate("driverId", "name email phone vehicleNumber")
      .populate({
        path: "reportId",
        select: "imageUrl prediction repair_cost status createdAt reportUrl location verification trafficVerification",
      });
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    res.json({ success: true, claim });
  } catch (err) {
    console.error("getClaimDetails error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const approveClaim = async (req, res) => {
  try {
    const claimId = req.params.id;
    const claim = await Claim.findByIdAndUpdate(
      claimId,
      { status: "approved", remarks: req.body.remarks || "" },
      { new: true }
    ).populate("driverId", "name email").populate("reportId");

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    io.to(`user_${claim.driverId._id}`).emit("claim_updated", { claimId, status: "approved" });

    await sendClaimUpdateEmail(claim.driverId.email, "Claim Approved", claim);

    res.json({ success: true, claim });
  } catch (err) {
    console.error("approveClaim error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const rejectClaim = async (req, res) => {
  try {
    const claimId = req.params.id;
    const { remarks } = req.body;
    const claim = await Claim.findByIdAndUpdate(
      claimId,
      { status: "rejected", remarks: remarks || "" },
      { new: true }
    ).populate("driverId", "name email").populate("reportId");

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    io.to(`user_${claim.driverId._id}`).emit("claim_updated", { claimId, status: "rejected", remarks });

    await sendClaimUpdateEmail(claim.driverId.email, "Claim Rejected", claim);

    res.json({ success: true, claim });
  } catch (err) {
    console.error("rejectClaim error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const refreshAssignedClaims = async (req, res) => {
  try {
    const agentId = req.user.id;

    const claims = await Claim.find({ assignedAgent: agentId })
      .populate("driverId", "name email phone vehicleNumber")
      .populate({
        path: "reportId",
        select: "imageUrl prediction repair_cost status createdAt reportUrl location verification trafficVerification",
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      message: "Assigned claims refreshed successfully",
      claims
    });

  } catch (err) {
    console.error("refreshAssignedClaims error:", err);
    res.status(500).json({ message: err.message });
  }
};