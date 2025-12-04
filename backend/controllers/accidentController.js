import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import Accident from "../models/Accident.js";
import Claim from "../models/Claim.js";
import User from "../models/User.js";
import { uploadToSupabase, uploadPDFToSupabase } from "../utils/uploadSupabase.js";
import { sendAccidentEmail } from "../utils/sendAccidentEmail.js";
import { generateAccidentReportPDF } from "../utils/generateAccidentReportPdf.js";
import { io } from "../server.js";

export const reportAccident = async (req, res) => {
  try {

    const fileUrl = await uploadToSupabase(req.file);
    const { lat, lon, address } = req.body;

    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.file.path));

    const response = await axios.post(process.env.FLASK_API_URL, formData, {
      headers: formData.getHeaders(),
    });

    const data = response.data;

    const accident = await Accident.create({
      userId: req.user.id,
      imageUrl: fileUrl,
      location: { lat, lon, address },
      prediction: data.prediction,
      repair_cost: data.repair_cost,
      status: "Analyzed",
      timestamp: data.timestamp || Date.now(),
    });

    const agent = await User.findOne({ role: "agent" })
      .sort({ currentLoad: 1 })
      .exec();

    let claim = null;

    if (agent) {

      claim = await Claim.create({
        driverId: req.user.id,
        reportId: accident._id,
        assignedAgent: agent._id,
        severity: data.prediction?.severity,
        estimatedCost: data.repair_cost?.estimated_cost,
        status: "in_review",
      });

      agent.currentLoad = (agent.currentLoad || 0) + 1;
      agent.assignedClaims = agent.assignedClaims || [];
      agent.assignedClaims.push(claim._id);
      await agent.save();

      accident.claimId = claim._id;
      await accident.save();

      io.to(`user_${agent._id}`).emit("new_claim_assigned", {
        claimId: claim._id,
        reportId: accident._id,
        severity: claim.severity,
        estimatedCost: claim.estimatedCost,
      });
    }

    const pdfReport = await generateAccidentReportPDF(accident, req.user);

    const pdfUrl = await uploadPDFToSupabase(pdfReport.path, `${pdfReport.reportId}.pdf`);
    accident.reportUrl = pdfUrl;
    await accident.save();

    await sendAccidentEmail(req.user.email, data, pdfReport.path);

    try {
      if (req.file?.path) fs.unlink(req.file.path, () => {});

    } catch (e) {
      console.warn("⚠️ File cleanup failed:", e.message);
    }

    res.json({
      success: true,
      accident,
      claim,
      report: pdfReport.reportId,
      reportUrl: pdfUrl,
    });
  } catch (err) {
    console.error("❌ reportAccident error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getUserReports = async (req, res) => {
  try {
    const reports = await Accident.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: "claimId",
        populate: [
          { path: "assignedAgent", select: "name email phone" },
          { path: "driverId", select: "name email phone vehicleNumber" }
        ]
      })
      .populate("verification.verifiedBy", "name email");

    res.json({ success: true, reports });
  } catch (err) {
    console.error("❌ getUserReports error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const reassignClaim = async (req, res) => {
  try {
    const claimId = req.params.id;
    const { newAgentId } = req.body;

    const claim = await Claim.findById(claimId)
      .populate("assignedAgent")
      .populate("driverId");

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const newAgent = await User.findById(newAgentId);
    if (!newAgent || newAgent.role !== "agent") {
      return res.status(400).json({ message: "Invalid agent ID" });
    }

    const oldAgent = claim.assignedAgent;

    if (oldAgent && oldAgent._id.toString() === newAgentId) {
      return res.status(400).json({ message: "Claim already assigned to this agent" });
    }

    if (oldAgent) {
      await User.findByIdAndUpdate(oldAgent._id, {
        $inc: { currentLoad: -1 },
        $pull: { assignedClaims: claim._id }
      });
    }

    await User.findByIdAndUpdate(newAgentId, {
      $inc: { currentLoad: 1 },
      $addToSet: { assignedClaims: claim._id }
    });

    claim.assignedAgent = newAgentId;

    claim.reassignmentHistory.push({
      fromAgent: oldAgent?._id || null,
      toAgent: newAgentId,
      changedBy: req.user.id,
      changedAt: new Date()
    });

    await claim.save();

    if (oldAgent) {
      io.to(`user_${oldAgent._id}`).emit("claim_unassigned", {
        claimId: claim._id,
        reason: "Reassigned by admin"
      });
    }

    io.to(`user_${newAgentId}`).emit("claim_assigned", {
      claimId: claim._id,
      severity: claim.severity,
      estimatedCost: claim.estimatedCost
    });

    io.to(`user_${claim.driverId._id}`).emit("claim_reassigned", {
      claimId: claim._id,
      newAgent: newAgent.name
    });

    io.to("role_admin").emit("claim_reassignment_update", {
      claimId: claim._id,
      from: oldAgent?._id || null,
      to: newAgentId
    });

    res.json({
      success: true,
      message: "Claim reassigned successfully",
      claim
    });
  } catch (err) {
    console.error("reassignClaim error:", err);
    res.status(500).json({ message: err.message });
  }
};