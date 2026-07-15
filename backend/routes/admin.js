import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readJson, writeJson } from "../lib/store.js";
import {
  requireAdmin,
  ADMIN_PASSCODE,
  getUsersData,
  saveUsers,
  sanitizeUser,
} from "../lib/auth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const servicesPath = path.join(__dirname, "../data/services.json");

router.post("/verify", (req, res) => {
  const { passcode } = req.body || {};
  if (passcode === ADMIN_PASSCODE) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: "Invalid passcode" });
});

router.get("/orders", requireAdmin, async (_req, res) => {
  const orders = await readJson("orders.json", []);
  res.json(orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
});

router.get("/users", requireAdmin, async (_req, res) => {
  const users = await getUsersData();
  res.json(users.map(sanitizeUser));
});

router.patch("/users/:id/wallet", requireAdmin, async (req, res) => {
  try {
    const { walletBalance } = req.body;
    if (typeof walletBalance !== "number" || walletBalance < 0) {
      return res.status(400).json({ error: "Invalid wallet balance" });
    }
    const users = await getUsersData();
    const index = users.findIndex((u) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "User not found" });
    users[index].walletBalance = walletBalance;
    await saveUsers(users);
    res.json(sanitizeUser(users[index]));
  } catch (error) {
    res.status(500).json({ error: "Failed to update wallet" });
  }
});

router.get("/deposits", requireAdmin, async (_req, res) => {
  const deposits = await readJson("deposits.json", []);
  res.json(deposits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.get("/services", requireAdmin, async (_req, res) => {
  const data = await fs.readFile(servicesPath, "utf-8");
  res.json(JSON.parse(data));
});

router.put("/services", requireAdmin, async (req, res) => {
  try {
    await writeJson("services.json", req.body);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save services" });
  }
});

router.patch("/services/:platformId/:serviceId/servers", requireAdmin, async (req, res) => {
  try {
    const data = await readJson("services.json", { platforms: [] });
    const platform = data.platforms.find((p) => p.id === req.params.platformId);
    if (!platform) return res.status(404).json({ error: "Platform not found" });
    const service = platform.services.find((s) => s.id === req.params.serviceId);
    if (!service) return res.status(404).json({ error: "Service not found" });

    service.servers = req.body.servers;
    await writeJson("services.json", data);
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: "Failed to update servers" });
  }
});

router.get("/stats", requireAdmin, async (_req, res) => {
  const orders = await readJson("orders.json", []);
  const users = await getUsersData();
  const deposits = await readJson("deposits.json", []);

  res.json({
    orders: {
      total: orders.length,
      ordered: orders.filter((o) => o.status === "ordered").length,
      processing: orders.filter((o) => o.status === "processing").length,
      done: orders.filter((o) => o.status === "done").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    },
    users: users.length,
    pendingDeposits: deposits.filter((d) => d.status === "pending").length,
  });
});

export default router;
