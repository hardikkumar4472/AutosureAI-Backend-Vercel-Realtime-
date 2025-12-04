
import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { exportAccidentsCSV, exportClaimsCSV, exportAccidentSummaryPDF } from "../controllers/exportController.js";

const router = express.Router();

router.get("/accidents/csv", adminAuth, exportAccidentsCSV);
router.get("/claims/csv", adminAuth, exportClaimsCSV);
router.get("/accidents/summary/pdf", adminAuth, exportAccidentSummaryPDF);

export default router;
