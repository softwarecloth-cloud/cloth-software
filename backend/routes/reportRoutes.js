import { Router } from "express";
import protect from "../middleware/auth.js";
import { dashboard, profitSnapshot } from "../controllers/reportController.js";

const router = Router();

router.use(protect);

router.get("/dashboard", dashboard);
router.get("/profit", profitSnapshot);

export default router;
