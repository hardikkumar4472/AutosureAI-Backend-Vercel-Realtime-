import express from "express";
import multer from "multer";
import { reportAccident, getUserReports } from "../controllers/accidentController.js";
import auth from "../middleware/auth.js";
let upload;
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  });
} else {
  upload = multer({ 
    dest: "uploads/",
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  });
}

const router = express.Router();

router.post("/report", auth, upload.single("image"), reportAccident);
router.get("/", auth, getUserReports);

export default router;
