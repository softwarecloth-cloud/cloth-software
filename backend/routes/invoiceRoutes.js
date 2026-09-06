import { Router } from "express";
import protect from "../middleware/auth.js";
import {
  listInvoices,
  getInvoice,
  createInvoice,
  deleteInvoice,
} from "../controllers/invoiceController.js";

const router = Router();

router.use(protect);

router.get("/", listInvoices);
router.post("/", createInvoice);
router.get("/:id", getInvoice);
router.delete("/:id", deleteInvoice);

export default router;
