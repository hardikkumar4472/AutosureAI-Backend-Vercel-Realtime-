import Claim from "../models/Claim.js";
import Settlement from "../models/Settlement.js";
import User from "../models/User.js";
import { io } from "../server.js";
import { sendClaimUpdateEmail } from "../utils/sendClaimEmail.js";

export const settleClaim = async (req, res) => {
  try {
    const claimId = req.params.id;
    const { amount, method, reference, notes } = req.body;

    const claim = await Claim.findById(claimId)
      .populate("driverId", "name email phone vehicleNumber")
      .populate("assignedAgent", "name email phone")
      .populate({
        path: "reportId",
        select: "imageUrl prediction repair_cost status createdAt reportUrl location verification trafficVerification",
      });

    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.status === "settled")
      return res.status(400).json({ message: "Claim already settled" });

    const settlement = await Settlement.create({
      claimId,
      settledBy: req.user.id, 
      amount,
      method,
      reference,
      notes,
    });

    claim.status = "settled";
    claim.settlementInfo = {
      settlementId: settlement._id,
      amount,
      method,
      reference,
      notes,
      settledAt: new Date(),
    };

    await claim.save();

    if (claim.assignedAgent) {
      await User.findByIdAndUpdate(claim.assignedAgent._id, {
        $inc: { currentLoad: -1 },
      });
    }

    io.to(`user_${claim.driverId._id}`).emit("claim_settled", {
      claimId,
      settlement,
    });

    if (claim.assignedAgent)
      io.to(`user_${claim.assignedAgent._id}`).emit("claim_settled", {
        claimId,
        settlement,
      });

    await sendClaimUpdateEmail(
      claim.driverId.email,
      "Your insurance claim has been settled",
      claim
    );

    res.json({
      success: true,
      message: "Claim settled successfully",
      settlement,
      claim,
    });
  } catch (err) {
    console.error("❌ settleClaim error:", err);
    res.status(500).json({ message: err.message });
  }
};