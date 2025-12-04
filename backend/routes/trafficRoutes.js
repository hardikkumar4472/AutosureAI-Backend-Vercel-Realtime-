import express from "express";
import { listPendingReports, verifyReport, getReport, getAllReports } from "../controllers/trafficController.js";
import { trafficAuth } from "../middleware/trafficAuth.js";
import { trafficLogin } from "../controllers/trafficController.js";

const router = express.Router();

router.get("/reports", trafficAuth, getAllReports);
router.get("/reports/pending", trafficAuth, listPendingReports);
router.get("/reports/:id", trafficAuth, getReport);
router.post("/reports/:id/verify", trafficAuth, verifyReport);
// router.post("/login", trafficLogin);

export default router;
