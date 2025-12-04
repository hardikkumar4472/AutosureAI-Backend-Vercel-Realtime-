import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
import { io } from "../server.js";
import { sendPasswordResetEmail } from "../utils/sendPasswordResetEmail.js";
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, vehicleNumber, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" })
    };
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, vehicleNumber, password: hashed});
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendOtpEmail(email, otp);
    res.json({ success: true, message: "OTP sent to email" });
  } 
  catch (err) {
    console.error("registerUser error:", err);
    res.status(500).json({ message: err.message });
  }
};
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select("+otp +otpExpires");
    if (!user) {
      return res.status(400).json({ message: "User did not exists" });
    };
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Kindly recheck the mail and try again" });
    }
    if (user.otpExpires < Date.now()){
      return res.status(400).json({ message: "OTP is expired. Generate new one" });
    };
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ success: true, message: "Account verified successfully" });
  } 
  catch (err) {
    console.error("verifyRegisterOtp error:", err);
    res.status(500).json({ message: err.message });
  }
};
export const initiateLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user){
      return res.status(400).json({ message: "Either the user with this mail does not exist or the password is incorrect" });
    };
    if (!user.isVerified){
      return res.status(401).json({ message: "You are not verified yet. Kindly verify your email first" });
    };
    const match = await bcrypt.compare(password, user.password);
    if (!match){
      return res.status(400).json({ message: "Either the user with this mail does not exist or the password is incorrect" });
    };
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("There is some server error, kindly retry", err);
    res.status(500).json({ message: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user){
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email){
      return res.status(400).json({ message: "Email is required" });
    };
    const user = await User.findOne({ email });
    if (!user){
      return res.status(404).json({ message: "User not found" });
    };
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();
    await sendPasswordResetEmail(email, otp);
    res.json({
      success: true,
      message: "OTP sent to email for password reset"
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword){
      return res.status(400).json({ message: "Missing fields" });
    };
    const user = await User.findOne({ email }).select("+otp +otpExpires");
    if (!user){
      return res.status(404).json({ message: "User not found" });
    };
    if (user.otp !== otp){
      return res.status(400).json({ message: "Invalid OTP" });
    };
    if (user.otpExpires < Date.now()){
      return res.status(400).json({ message: "OTP expired" });
    };
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({
      success: true,
      message: "Password reset successful"
    });
  }
  catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: err.message });
  }
};
