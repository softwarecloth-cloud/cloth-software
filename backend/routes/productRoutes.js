import { Router } from "express";
import protect from "../middleware/auth.js";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = Router();

router.use(protect); // every inventory route requires a logged-in shop owner

router.get("/", listProducts);
router.post("/", createProduct);
router.get("/:id", getProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
