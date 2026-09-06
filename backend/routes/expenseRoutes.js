import { Router } from "express";
import protect from "../middleware/auth.js";
import {
  listExpenses,
  createExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = Router();

router.use(protect);

router.get("/", listExpenses);
router.post("/", createExpense);
router.delete("/:id", deleteExpense);

export default router;
