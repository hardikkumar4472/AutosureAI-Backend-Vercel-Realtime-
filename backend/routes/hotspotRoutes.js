
import express from "express";
import { getPublicHotspots } from "../controllers/hotspotController.js";
const router = express.Router();

router.get("/hotspots", getPublicHotspots);

export default router;
