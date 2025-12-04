import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { getAdminAnalytics } from "../controllers/adminAnalyticsController.js";

const router = express.Router();

router.get("/", adminAuth, getAdminAnalytics);

export default router;
