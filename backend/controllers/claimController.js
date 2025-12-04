import Claim from "../models/Claim.js";

export const getDriverClaim = async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await Claim.findById(id)
      .populate("driverId", "name email phone vehicleNumber")
      .populate("assignedAgent", "name email phone")
      .populate({
        path: "reportId",
        select: "imageUrl prediction repair_cost status createdAt reportUrl location verification trafficVerification timestamp",
        populate: [
          { path: "verification.verifiedBy", select: "name email" },
        ],
      });

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (claim.driverId?._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized to view this claim" });
    }

    res.json({ success: true, claim });
  } catch (err) {
    console.error("getDriverClaim error:", err);
    res.status(500).json({ message: err.message });
  }
};


