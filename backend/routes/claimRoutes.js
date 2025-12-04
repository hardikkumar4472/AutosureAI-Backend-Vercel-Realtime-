import express from "express";
import auth from "../middleware/auth.js";
import { getDriverClaim } from "../controllers/claimController.js";

const router = express.Router();

router.get("/:id", auth, getDriverClaim);

export default router;


