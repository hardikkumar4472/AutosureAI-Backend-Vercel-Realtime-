import express from "express";
import multer from "multer";
import { trafficAuth } from "../middleware/trafficAuth.js";
import { updateFIR } from "../controllers/trafficController.js";

// Use memory storage for Vercel (read-only filesystem)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = express.Router();

router.post(
  "/accident/:id/fir",
  trafficAuth,
  upload.single("firDocument"),
  updateFIR
);

export default router;
