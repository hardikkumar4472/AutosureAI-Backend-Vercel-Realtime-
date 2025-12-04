import Accident from "../models/Accident.js";
import { uploadToSupabase } from "../utils/uploadSupabase.js";
import { io } from "../server.js";
import { logAction } from "../middleware/logAction.js";

export const uploadEvidence = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const url = await uploadToSupabase(req.file);

    const acc = await Accident.findById(req.params.id);
    if (!acc) return res.status(404).json({ message: "Accident not found" });

    acc.verification = acc.verification || {};
    acc.verification.evidence = acc.verification.evidence || [];
    acc.verification.evidence.push(url);
    await acc.save();

    io.to(`user_${acc.userId}`).emit("evidence_uploaded", { reportId: acc._id, url });
    io.to("role_admin").emit("evidence_uploaded", { reportId: acc._id, url });

    res.json({ success: true, url });
  } catch (err) {
    console.error("uploadEvidence error:", err);
    res.status(500).json({ message: err.message });
  }
};