import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "./auth.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORDERS_FILE = path.join(__dirname, "../data/orders.json");

function readOrders() {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8")); } catch { return []; }
}
function writeOrders(o) { fs.writeFileSync(ORDERS_FILE, JSON.stringify(o, null, 2)); }

// GET /api/orders — my orders
router.get("/", requireAuth, (req, res) => {
  const orders = readOrders().filter((o) => o.userId === req.user.id);
  res.json(orders.slice().reverse());
});

// GET /api/orders/:id
router.get("/:id", requireAuth, (req, res) => {
  const order = readOrders().find((o) => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

// POST /api/orders — place order
router.post("/", requireAuth, (req, res) => {
  const { items, shippingAddress, note } = req.body;
  if (!items?.length) return res.status(400).json({ error: "Cart is empty." });
  if (!shippingAddress) return res.status(400).json({ error: "Shipping address is required." });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + shipping;

  const order = {
    id: `ORD-${Date.now()}`,
    userId: req.user.id,
    userName: req.user.name,
    items,
    shippingAddress,
    note: note || "",
    subtotal,
    shipping,
    total,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);
  res.status(201).json(order);
});

export default router;
