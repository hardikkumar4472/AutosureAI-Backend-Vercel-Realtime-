import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import accidentRoutes from "./routes/accidentRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoute.js";
import auditRoutes from "./routes/auditRoutes.js";
import broadcastRoutes from "./routes/brodcastRoutes.js";
import trafficEvidenceRoutes from "./routes/trafficFIRroutes.js";
import adminTrafficRoutes from "./routes/adminTrafficRoutes.js";
import claimSettlementRoutes from "./routes/settlementRoutes.js";
import hotspotRoutes from "./routes/hotspotRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import { uploadLimiter } from "./middleware/rateLimiter.js";
import trafficRoutes from "./routes/trafficRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import helmet from "helmet";

dotenv.config();

const app = express();

// ========== CRITICAL: MANUAL CORS HANDLING ==========
// Remove cors() package and handle manually

// Middleware to add CORS headers to EVERY response
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://autosureml.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8000'
  ];
  
  const origin = req.headers.origin;
  
  // Add CORS headers
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    // Allow all in development
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle OPTIONS (preflight) requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// ========== OTHER MIDDLEWARE ==========
app.use(express.json());
// Temporarily disable helmet for CORS testing
// app.use(helmet());

// ========== ROUTES ==========
app.use("/api/auth", authRoutes);
app.use("/api/accidents", accidentRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/audit-logs", auditRoutes);
app.use("/api/admin/broadcast", broadcastRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/traffic-evidence", uploadLimiter, trafficEvidenceRoutes);
app.use("/api/admin", adminTrafficRoutes);
app.use("/api/settlement", claimSettlementRoutes);
app.use("/api/admin/hotspots", hotspotRoutes);
app.use("/api/admin/export", exportRoutes);
app.use("/api/traffic", trafficRoutes);
app.use("/api/claims", claimRoutes);

// ========== TEST ENDPOINTS ==========
app.get("/", (req, res) => {
  res.json({
    message: "AutoSureAI Backend Running 🚗",
    timestamp: new Date().toISOString(),
    cors: "Manual CORS enabled",
    requestOrigin: req.headers.origin,
    allowedOrigins: [
      'https://autosureml.onrender.com',
      'http://localhost:3000'
    ]
  });
});

app.get("/test-cors", (req, res) => {
  res.json({
    success: true,
    message: "CORS test endpoint",
    origin: req.headers.origin,
    method: req.method,
    headers: req.headers
  });
});

app.options("*", (req, res) => {
  res.status(200).end();
});

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// ========== 404 HANDLER ==========
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    origin: req.headers.origin
  });
});

// ========== DATABASE CONNECTION ==========
connectDB().catch(console.error);

// ========== EXPORT ==========
export default app;
