import express from "express";
import {
  registerUser,
  verifyRegisterOtp,
  initiateLogin,
  getUserProfile,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyRegisterOtp);
router.post("/login", initiateLogin);
router.get("/profile", auth, getUserProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
