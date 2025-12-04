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

// ========== CRITICAL: CORS MIDDLEWARE MUST COME FIRST ==========
const allowedOrigins = [
  'https://autosureml.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  // Add your Vercel frontend URL if you have one
  // 'https://your-frontend.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
};

// Apply CORS middleware BEFORE other middleware
app.use(cors(corsOptions));

// Handle preflight requests for ALL routes
app.options('*', cors(corsOptions));

// ========== OTHER MIDDLEWARE ==========
app.use(helmet());
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

// ========== HEALTH CHECK ==========
app.get("/", (req, res) => {
  res.json({ 
    message: "AutoSureAI Backend Running 🚗",
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins,
      methods: corsOptions.methods
    }
  });
});

// ========== ERROR HANDLING ==========
// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS Error', 
      message: 'Origin not allowed',
      allowedOrigins: allowedOrigins,
      yourOrigin: req.headers.origin
    });
  }
  
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ========== CONNECT TO DATABASE ==========
connectDB().catch(console.error);

// ========== EXPORT FOR VERCEL ==========
export default app;
