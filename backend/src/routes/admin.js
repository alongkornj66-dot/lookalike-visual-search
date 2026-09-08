import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { requireAdmin } from "./auth.js";

const router = express.Router();
router.use(requireAdmin);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE   = path.join(__dirname, "../data/users.json");
const ORDERS_FILE  = path.join(__dirname, "../data/orders.json");
const PRODUCTS_FILE= path.join(__dirname, "../data/products.json");

const read  = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf-8")); } catch { return []; } };
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

/* ── DASHBOARD STATS ── */
router.get("/stats", (req, res) => {
  const users    = read(USERS_FILE);
  const orders   = read(ORDERS_FILE);
  const products = read(PRODUCTS_FILE);
  const revenue  = orders.reduce((s, o) => s + (o.total || 0), 0);
  const byStatus = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
  const recent   = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  const lowStock = products.filter((p) => (p.stock ?? 0) <= 5).sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
  const totalStock = products.reduce((s, p) => s + (p.stock ?? 0), 0);
  res.json({ users: users.length, orders: orders.length, revenue, products: products.length, byStatus, recentOrders: recent, lowStock, totalStock });
});

/* ── ORDERS ── */
router.get("/orders", (req, res) => {
  const orders = read(ORDERS_FILE).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

router.patch("/orders/:id/status", (req, res) => {
  const { status } = req.body;
  const VALID = ["confirmed", "shipped", "delivered", "cancelled"];
  if (!VALID.includes(status)) return res.status(400).json({ error: "Invalid status" });
  const orders = read(ORDERS_FILE);
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Order not found" });
  orders[idx].status = status;
  write(ORDERS_FILE, orders);
  res.json(orders[idx]);
});

/* ── USERS ── */
router.get("/users", (req, res) => {
  const users  = read(USERS_FILE);
  const orders = read(ORDERS_FILE);
  const safe   = users.map(({ password, ...u }) => ({
    ...u,
    orderCount: orders.filter((o) => o.userId === u.id).length,
    isAdmin: (process.env.ADMIN_EMAIL || "").split(",").map((e) => e.trim().toLowerCase()).includes(u.email.toLowerCase()),
  }));
  res.json(safe);
});

router.patch("/users/:id/toggle-active", (req, res) => {
  const id = Number(req.params.id);
  const users = read(USERS_FILE);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  users[idx].disabled = !users[idx].disabled;
  write(USERS_FILE, users);
  const { password, ...safe } = users[idx];
  res.json(safe);
});

/* ── PRODUCTS ── */
router.get("/products", (req, res) => {
  res.json(read(PRODUCTS_FILE));
});

router.post("/products", (req, res) => {
  const { name, category, color, pattern, price, imageUrl, description, stock } = req.body;
  if (!name || !category || !price) return res.status(400).json({ error: "Name, category and price are required." });
  const products = read(PRODUCTS_FILE);
  const newProduct = {
    id: Math.max(0, ...products.map((p) => p.id)) + 1,
    name, category, color: color || "", pattern: pattern || "solid",
    price: Number(price),
    imageUrl: imageUrl || `/images/${category}_${String(Date.now()).slice(-6)}.jpg`,
    description: description || "",
    stock: stock != null ? Number(stock) : 0,
  };
  products.push(newProduct);
  write(PRODUCTS_FILE, products);
  res.status(201).json(newProduct);
});

router.put("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const products = read(PRODUCTS_FILE);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });
  products[idx] = { ...products[idx], ...req.body, id };
  write(PRODUCTS_FILE, products);
  res.json(products[idx]);
});

/* receive stock — adds qty to current stock */
router.patch("/products/:id/receive-stock", (req, res) => {
  const id = Number(req.params.id);
  const qty = Number(req.body.qty);
  if (!qty || qty < 1) return res.status(400).json({ error: "qty must be a positive number." });
  const products = read(PRODUCTS_FILE);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });
  products[idx].stock = (products[idx].stock ?? 0) + qty;
  products[idx].lastRestocked = new Date().toISOString();
  write(PRODUCTS_FILE, products);
  res.json(products[idx]);
});

router.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const products = read(PRODUCTS_FILE);
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return res.status(404).json({ error: "Product not found" });
  write(PRODUCTS_FILE, filtered);
  res.json({ ok: true });
});

export default router;
