import { Router } from "express";
import protect from "../middleware/auth.js";
import {
  listReceipts,
  createReceipt,
  deleteReceipt,
} from "../controllers/stockController.js";

const router = Router();

router.use(protect);

router.get("/", listReceipts);
router.post("/", createReceipt);
router.delete("/:id", deleteReceipt);

export default router;
