import Accident from "../models/Accident.js";
import Claim from "../models/Claim.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

export const exportAccidentsCSV = async (req, res) => {
  try {
    const accidents = await Accident.find().populate("userId", "name email vehicleNumber").lean();
    const fields = ["_id", "userId.name", "userId.email", "userId.vehicleNumber", "prediction.severity", "repair_cost.estimated_cost", "location.address", "createdAt"];
    const parser = new Parser({ fields });
    const csv = parser.parse(accidents);
    res.header("Content-Type", "text/csv");
    res.attachment("accidents.csv");
    return res.send(csv);
  } catch (err) {
    console.error("exportAccidentsCSV error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const exportClaimsCSV = async (req, res) => {
  try {
    const claims = await Claim.find().populate("driverId", "name email").populate("reportId").lean();
    const fields = ["_id", "driverId.name", "driverId.email", "severity", "estimatedCost", "status", "createdAt"];
    const parser = new Parser({ fields });
    const csv = parser.parse(claims);
    res.header("Content-Type", "text/csv");
    res.attachment("claims.csv");
    return res.send(csv);
  } catch (err) {
    console.error("exportClaimsCSV error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const exportAccidentSummaryPDF = async (req, res) => {
  try {

    const totalAccidents = await Accident.countDocuments();
    const severityAgg = await Accident.aggregate([{ $group: { _id: "$prediction.severity", count: { $sum: 1 } } }]);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=accident_summary.pdf");
    doc.text("AutoSureAI — Accident Summary Report", { align: "center", underline: true });
    doc.moveDown();
    doc.text(`Total Accidents: ${totalAccidents}`);
    doc.moveDown();
    doc.text("By Severity:");
    severityAgg.forEach(s => doc.text(`${s._id}: ${s.count}`));
    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error("exportAccidentSummaryPDF error:", err);
    res.status(500).json({ message: err.message });
  }
};