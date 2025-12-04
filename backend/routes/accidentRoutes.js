import express from "express";
import multer from "multer";
import { reportAccident, getUserReports } from "../controllers/accidentController.js";
import auth from "../middleware/auth.js";
const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/report", auth, upload.single("image"),reportAccident);
router.get("/", auth, getUserReports);

export default router;
