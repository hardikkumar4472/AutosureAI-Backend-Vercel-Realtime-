import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { agentAuth } from "../middleware/agentAuth.js";
import { refreshAssignedClaims } from "../controllers/agentController.js";


const router = express.Router();

router.get("/", adminAuth, getAuditLogs);
router.get("/claims/refresh", agentAuth, refreshAssignedClaims);
export default router;
