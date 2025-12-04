import express from "express";
import { fetchMessages, sendMessage } from "../controllers/chatController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/:claimId", protect, fetchMessages);
router.post("/:claimId", protect, sendMessage);

export default router;
