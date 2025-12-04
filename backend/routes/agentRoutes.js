
import express from "express";
import { getAssignedClaims, getClaimDetails, approveClaim, rejectClaim } from "../controllers/agentController.js";
import { agentAuth } from "../middleware/agentAuth.js";

const router = express.Router();

router.get("/claims", agentAuth, getAssignedClaims);
router.get("/claim/:id", agentAuth, getClaimDetails);
router.put("/claim/:id/approve", agentAuth, approveClaim);
router.put("/claim/:id/reject", agentAuth, rejectClaim);

export default router;
