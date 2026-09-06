import Product from "../models/Product.js";
import Invoice from "../models/Invoice.js";
import StockReceipt from "../models/StockReceipt.js";

const validationMessage = (error) =>
  Object.values(error.errors || {})[0]?.message || "Invalid data";

/**
 * Keep only well-formed { url, publicId } entries from whatever the client sent.
 * Images are uploaded to Cloudinary in the browser, so the request body is the
 * only place they come from — never trust its shape.
 */
export const sanitizeImages = (input) => {
  if (!Array.isArray(input)) return [];
  return input
    .map((img) => ({
      url: typeof img?.url === "string" ? img.url.trim() : "",
      publicId: typeof img?.publicId === "string" ? img.publicId.trim() : "",
    }))
    .filter((img) => /^https?:\/\//i.test(img.url))
    .slice(0, 12);
};

// GET /products?search=&lowStock=1&sort=brand
export const listProducts = async (req, res) => {
  try {
    const { search, lowStock, sort } = req.query;
    const filter = {};

    if (search) {
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ brand: rx }, { volumeNo: rx }, { description: rx }];
    }

    let products = await Product.find(filter)
      .sort(sort || "brand volumeNo")
      .lean();

    if (lowStock === "1" || lowStock === "true") {
      products = products.filter((p) => p.quantity <= (p.lowStockThreshold ?? 3));
    }

    const totals = products.reduce(
      (acc, p) => {
        acc.quantity += p.quantity;
        acc.stockValue += p.quantity * p.costPrice;
        acc.retailValue += p.quantity * p.salePrice;
        return acc;
      },
      { quantity: 0, stockValue: 0, retailValue: 0 }
    );

    res.json({ success: true, count: products.length, totals, products });
  } catch (error) {
    console.error("listProducts error:", error);
    res.status(500).json({ success: false, message: "Could not load products" });
  }
};

// GET /products/:id
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid product id" });
  }
};

// POST /products  — create an inventory line without receiving stock yet
export const createProduct = async (req, res) => {
  try {
    const { brand, volumeNo, description, costPrice, salePrice, quantity, lowStockThreshold } =
      req.body;
    const images = sanitizeImages(req.body.images);

    const exists = await Product.findOne({
      brand: brand?.trim(),
      volumeNo: volumeNo?.trim(),
    });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: `${brand} — volume ${volumeNo} already exists`,
      });
    }

    const product = await Product.create({
      brand,
      volumeNo,
      description,
      costPrice,
      salePrice,
      quantity: quantity || 0,
      lowStockThreshold,
      images,
    });
    res.status(201).json({ success: true, product });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: validationMessage(error) });
    }
    console.error("createProduct error:", error);
    res.status(500).json({ success: false, message: "Could not create product" });
  }
};

// PATCH /products/:id  — edit details / prices / threshold (not stock: use receipts)
export const updateProduct = async (req, res) => {
  try {
    const allowed = ["brand", "volumeNo", "description", "costPrice", "salePrice", "lowStockThreshold", "quantity"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    // `images` is the full replacement list the client wants to keep — removed
    // photos simply aren't sent back. Allow an explicit empty array to clear all.
    if (req.body.images !== undefined) {
      updates.images = sanitizeImages(req.body.images);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: validationMessage(error) });
    }
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Another product already uses that brand + volume" });
    }
    res.status(500).json({ success: false, message: "Could not update product" });
  }
};

// DELETE /products/:id  — blocked if it has history
export const deleteProduct = async (req, res) => {
  try {
    const [invoiceCount, receiptCount] = await Promise.all([
      Invoice.countDocuments({ "items.product": req.params.id }),
      StockReceipt.countDocuments({ product: req.params.id }),
    ]);
    if (invoiceCount || receiptCount) {
      return res.status(409).json({
        success: false,
        message: "This product has sales or receipt history and cannot be deleted",
      });
    }
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not delete product" });
  }
};
