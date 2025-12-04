import express from "express";
import protect  from "../middleware/auth.js"; 
import { settleClaim } from "../controllers/claimSettlementController.js";
import { logAction } from "../middleware/logAction.js";

const router = express.Router();

router.post("/claim/:id/settle", protect, logAction("CLAIM_SETTLED", (req) => `User ${req.user.id} settled claim ${req.params.id}`), settleClaim);

export default router;