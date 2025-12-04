import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { sendBroadcast } from "../controllers/brodcastController.js";
import { logAction } from "../middleware/logAction.js";

const router = express.Router();

router.post(
  "/send",
  adminAuth,
  logAction("BROADCAST_EMAIL", (req) => `Broadcast email sent: ${req.body.subject}`),
  sendBroadcast
);

export default router;
