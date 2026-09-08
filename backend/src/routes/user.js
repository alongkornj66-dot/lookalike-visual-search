import express from "express";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "./auth.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, "../data/users.json");

function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")); } catch { return []; }
}
function writeUsers(u) { fs.writeFileSync(USERS_FILE, JSON.stringify(u, null, 2)); }

// GET /api/user/profile
router.get("/profile", requireAuth, (req, res) => {
  const users = readUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { password, ...safe } = user;
  res.json(safe);
});

// PUT /api/user/profile
router.put("/profile", requireAuth, (req, res) => {
  const { name, phone } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name is required." });
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  users[idx] = { ...users[idx], name: name.trim(), phone: phone || "" };
  writeUsers(users);
  const { password, ...safe } = users[idx];
  res.json(safe);
});

// PUT /api/user/password
router.put("/password", requireAuth, async (req, res, next) => {
  try {
    const { current, newPassword } = req.body;
    if (!current || !newPassword) return res.status(400).json({ error: "Both fields are required." });
    if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters." });
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === req.user.id);
    const match = await bcrypt.compare(current, users[idx].password);
    if (!match) return res.status(401).json({ error: "Current password is incorrect." });
    users[idx].password = await bcrypt.hash(newPassword, 10);
    writeUsers(users);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// GET /api/user/addresses
router.get("/addresses", requireAuth, (req, res) => {
  const users = readUsers();
  const user = users.find((u) => u.id === req.user.id);
  res.json(user?.addresses || []);
});

// POST /api/user/addresses
router.post("/addresses", requireAuth, (req, res) => {
  const { name, recipient, phone, address, city, postalCode, isDefault } = req.body;
  if (!recipient || !address || !city) return res.status(400).json({ error: "Recipient, address and city are required." });
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (!users[idx].addresses) users[idx].addresses = [];
  const newAddr = { id: Date.now(), name: name || "Home", recipient, phone: phone || "", address, city, postalCode: postalCode || "", isDefault: !!isDefault };
  if (isDefault) users[idx].addresses.forEach((a) => (a.isDefault = false));
  if (users[idx].addresses.length === 0) newAddr.isDefault = true;
  users[idx].addresses.push(newAddr);
  writeUsers(users);
  res.status(201).json(newAddr);
});

// PUT /api/user/addresses/:id
router.put("/addresses/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === req.user.id);
  const addrIdx = users[idx].addresses?.findIndex((a) => a.id === id);
  if (addrIdx === -1 || addrIdx === undefined) return res.status(404).json({ error: "Address not found" });
  if (req.body.isDefault) users[idx].addresses.forEach((a) => (a.isDefault = false));
  users[idx].addresses[addrIdx] = { ...users[idx].addresses[addrIdx], ...req.body, id };
  writeUsers(users);
  res.json(users[idx].addresses[addrIdx]);
});

// DELETE /api/user/addresses/:id
router.delete("/addresses/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === req.user.id);
  users[idx].addresses = (users[idx].addresses || []).filter((a) => a.id !== id);
  writeUsers(users);
  res.json({ ok: true });
});

export default router;
