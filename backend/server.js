import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import accidentRoutes from "./routes/accidentRoutes.js";
import http from "http";
import { Server as IOServer } from "socket.io";
import agentRoutes from "./routes/agentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoute.js"
import auditRoutes from "./routes/auditRoutes.js";
import broadcastRoutes from "./routes/brodcastRoutes.js"
// import trafficEvidenceRoutes from "./routes/trafficFIRroutes.js";
import adminTrafficRoutes from "./routes/adminTrafficRoutes.js";
import claimSettlementRoutes from "./routes/settlementRoutes.js";
import hotspotRoutes from "./routes/hotspotRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import { authLimiter ,uploadLimiter} from "./middleware/rateLimiter.js";
import trafficRoutes from "./routes/trafficRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import helmet from "helmet";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use(helmet());

app.use("/api/auth", authRoutes);
app.use("/api/accidents", accidentRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/audit-logs", auditRoutes);
app.use("/api/admin/broadcast", broadcastRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
// app.use("/api/traffic-evidence", uploadLimiter,trafficEvidenceRoutes); 
app.use("/api/admin", adminTrafficRoutes); 
app.use("/api/settlement", claimSettlementRoutes);
app.use("/api/admin/hotspots", hotspotRoutes); 
app.use("/api/admin/export", exportRoutes);
app.use("/api/traffic",trafficRoutes);
app.use("/api/claims", claimRoutes);

app.get("/", (req, res) => res.send("AutoSureAI Backend Running 🚗"));

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

export const io = new IOServer(server, {
  cors: { origin: "*" },
});

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

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
