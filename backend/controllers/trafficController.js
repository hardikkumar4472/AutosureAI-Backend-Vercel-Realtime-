import Accident from "../models/Accident.js";
import Claim from "../models/Claim.js";
import User from "../models/User.js";
import { io } from "../server.js";
import { uploadToSupabase } from "../utils/uploadSupabase.js";
import fs from "fs";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import jwt from "jsonwebtoken"

export const listPendingReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const skip = (page - 1) * limit;

    const [total, reports] = await Promise.all([
      Accident.countDocuments({ "verification.status": "unverified" }),
      Accident.find({ "verification.status": "unverified" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email phone vehicleNumber")
        .populate("claimId")
        .select("imageUrl prediction repair_cost status createdAt reportUrl location verification trafficVerification claimId userId")
    ]);

    res.json({ success: true, total, page, limit, reports });
  } catch (err) {
    console.error("listPendingReports error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    // Fetch all reports for analytics without pagination
    const reports = await Accident.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .select("verification trafficVerification status createdAt location prediction repair_cost");

    res.json({ success: true, reports });
  } catch (err) {
    console.error("getAllReports error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const verifyReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, remarks, evidence } = req.body;

    if (!["verified", "fraudulent"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const acc = await Accident.findById(reportId).populate(
      "userId",
      "name email"
    );
    if (!acc) return res.status(404).json({ message: "Report not found" });

    acc.verification.status = status;
    acc.verification.verifiedBy = req.user.id;
    acc.verification.remarks = remarks || "";
    acc.verification.evidence =
      evidence || acc.verification.evidence || [];
    acc.verification.verifiedAt = new Date();

    acc.status = status === "verified" ? "Reviewed" : "Closed";

    await acc.save();

    if (acc.claimId) {
      const claim = await Claim.findById(acc.claimId).populate(
        "assignedAgent driverId"
      );

      if (claim && claim.assignedAgent) {
        io.to(`user_${claim.assignedAgent._id}`).emit("report_verified", {
          reportId: acc._id,
          claimId: claim._id,
          verification: acc.verification
        });
      }
    }

    io.to(`user_${acc.userId._id}`).emit("report_verification_update", {
      reportId: acc._id,
      verification: acc.verification
    });

    io.to("role_admin").emit("report_verification_update", {
      reportId: acc._id,
      verification: acc.verification
    });

    res.json({ success: true, report: acc });
  } catch (err) {
    console.error("verifyReport error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateFIR = async (req, res) => {
  try {
    const accidentId = req.params.id;
    const { firNumber, policeStation } = req.body;

    const accident = await Accident.findById(accidentId).populate("userId");

    if (!accident)
      return res.status(404).json({ message: "Accident not found" });

    let firDocumentUrl = null;

    if (req.file) {
      firDocumentUrl = await uploadToSupabase(req.file);
      fs.unlink(req.file.path, () => { });
    }

    accident.trafficVerification = {
      firNumber,
      policeStation,
      firDocumentUrl,
      officerId: req.user.id,
      verifiedAt: new Date()
    };

    await accident.save();

    io.to(`user_${accident.userId._id}`).emit("fir_updated", {
      accidentId,
      firNumber,
      policeStation,
      firDocumentUrl
    });

    if (accident.claimId) {
      const claim = await Claim.findById(accident.claimId).populate(
        "assignedAgent"
      );
      if (claim?.assignedAgent) {
        io.to(`user_${claim.assignedAgent._id}`).emit("fir_updated", {
          accidentId,
          firNumber,
          policeStation,
          firDocumentUrl
        });
      }
    }

    res.json({
      success: true,
      message: "FIR details added successfully",
      accident
    });
  } catch (err) {
    console.error("updateFIR error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    const acc = await Accident.findById(reportId)
      .populate("userId", "name email phone vehicleNumber")
      .populate("claimId")
      .populate("verification.verifiedBy", "name email")
      .populate("trafficVerification.officerId", "name email")
      .select("imageUrl prediction repair_cost status createdAt reportUrl location verification trafficVerification claimId userId timestamp");

    if (!acc) return res.status(404).json({ message: "Report not found" });

    res.json({ success: true, report: acc });
  } catch (err) {
    console.error("getReport error:", err);
    res.status(500).json({ message: err.message });
  }
};
export const trafficLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (user.role !== "traffic") {
      return res.status(403).json({ message: "Access denied. Not a traffic officer." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: "traffic" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Traffic login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("trafficLogin error:", err);
    res.status(500).json({ message: err.message });
  }
};