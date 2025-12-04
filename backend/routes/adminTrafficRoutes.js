
import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { listTraffic, updateTraffic, deleteTraffic } from "../controllers/adminController.js";
import { logAction } from "../middleware/logAction.js";

const router = express.Router();

router.get("/traffic", adminAuth, listTraffic);
router.put("/traffic/:id", adminAuth, logAction("ADMIN_UPDATE_TRAFFIC", (req) => `Updated traffic ${req.params.id}`), updateTraffic);
router.delete("/traffic/:id", adminAuth, logAction("ADMIN_DELETE_TRAFFIC", (req) => `Deleted traffic ${req.params.id}`), deleteTraffic);

export default router;
