// routes/adminRoutes.js
import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { registerAgent, listAgents, updateAgent, deleteAgent, getAllClaims } from "../controllers/adminController.js";
import { reassignClaim } from "../controllers/adminController.js";
import { adminLogin } from "../controllers/adminController.js";
import { registerTraffic } from "../controllers/adminController.js";


const router = express.Router();

router.put("/claim/:id/reassign", adminAuth, reassignClaim);
router.post("/create-agent", adminAuth, registerAgent);
router.get("/agents", adminAuth, listAgents);
router.put("/agent/:id", adminAuth, updateAgent);
router.delete("/agent/:id", adminAuth, deleteAgent);
router.get("/claims", adminAuth, getAllClaims);
router.post("/login", adminLogin);
router.post("/create-traffic",registerTraffic,adminAuth);

export default router;
