import { Router } from "express";
import { getCatalog, getProductById } from "../data/productStore.js";

const router = Router();

// GET /api/products?category=shoe
router.get("/", async (req, res, next) => {
  try {
    const catalog = await getCatalog();
    const { category } = req.query;
    const items = catalog
      .filter((p) => !category || p.category === category)
      .map(({ embedding, ...rest }) => rest); // never leak raw vectors to the client
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const { embedding, ...rest } = product;
    res.json(rest);
  } catch (err) {
    next(err);
  }
});

export default router;
