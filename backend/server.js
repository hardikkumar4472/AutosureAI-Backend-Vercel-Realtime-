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

// ========== BULLETPROOF CORS SETUP ==========
// 1. Configure CORS with explicit options
const allowedOrigins = [
  'https://autosureml.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://autosure-ai-backend-vercel-realtime-vmfs-mm0z9tlcy.vercel.app' // Allow self
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Temporarily allow all for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Forwarded-For', 'X-Forwarded-Host', 'X-Forwarded-Proto'],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 204
};

// 2. Apply CORS middleware
app.use(cors(corsOptions));

// 3. MANUALLY handle OPTIONS (preflight) requests
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  
  res.sendStatus(204);
});

// 4. Add manual CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ========== OTHER MIDDLEWARE ==========
// Disable helmet for now to test
// app.use(helmet());
app.use(express.json());

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

// ========== DEBUG ENDPOINTS ==========
app.get("/", (req, res) => {
  res.json({ 
    message: "AutoSureAI Backend Running 🚗",
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins,
      requestOrigin: req.headers.origin,
      headersSent: res.getHeaders()
    }
  });
});

app.get("/debug-cors", (req, res) => {
  res.json({
    headers: req.headers,
    origin: req.headers.origin,
    method: req.method,
    url: req.url
  });
});

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// ========== CONNECT TO DATABASE ==========
connectDB().catch(console.error);

// ========== EXPORT FOR VERCEL ==========
export default app;
