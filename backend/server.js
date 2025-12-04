import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";

// Import routes
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
import trafficRoutes from "./routes/trafficRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import { uploadLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Connect to DB (only for local/dev)
if (!process.env.VERCEL) {
  connectDB();
}

// Routes
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

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "AutoSureAI Backend Running 🚗",
    status: "active",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK",
    environment: process.env.NODE_ENV || "development"
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start server only if NOT on Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 8000;
  
  import("http").then((http) => {
    import("socket.io").then(({ Server }) => {
      const server = http.createServer(app);
      const io = new Server(server, {
        cors: { origin: "*" }
      });
      
      // Socket.io logic here
      io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);
        
        socket.on("join", (userId) => {
          if (userId) socket.join(`user_${userId}`);
        });
        
        socket.on("join_claim", (claimId) => {
          if (claimId) socket.join(`claim_${claimId}`);
        });
        
        socket.on("send_chat", (msg) => {
          if (msg && msg.claimId) {
            io.to(`claim_${msg.claimId}`).emit("receive_chat", msg);
          }
        });
        
        socket.on("disconnect", () => {
          console.log("Socket disconnected:", socket.id);
        });
      });
      
      server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    });
  });
}

// Export for Vercel
export default app;
