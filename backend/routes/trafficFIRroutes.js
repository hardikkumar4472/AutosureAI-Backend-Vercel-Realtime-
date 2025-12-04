import express from "express";
import multer from "multer";
import { trafficAuth } from "../middleware/trafficAuth.js";
import { updateFIR } from "../controllers/trafficController.js";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post(
  "/accident/:id/fir",
  trafficAuth,
  upload.single("firDocument"),
  updateFIR
);

export default router;
