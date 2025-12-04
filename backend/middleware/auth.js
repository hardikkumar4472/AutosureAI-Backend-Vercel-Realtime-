import jwt from "jsonwebtoken";
import User from "../models/User.js";

 async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      vehicleNumber: user.vehicleNumber,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
export default protect;
