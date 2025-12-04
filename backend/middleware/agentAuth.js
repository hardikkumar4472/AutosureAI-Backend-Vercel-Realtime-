import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const agentAuth = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Invalid token format" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ message: "User not found" });

    if (user.role !== "agent")
      return res.status(403).json({ message: "Access denied. Agents only." });

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error("Agent Auth Error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};