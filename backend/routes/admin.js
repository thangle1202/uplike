import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readJson, writeJson, vietnamNow } from "../lib/store.js";
import {
  requireAdmin,
  getUsersData,
  saveUsers,
  sanitizeUser,
} from "../lib/auth.js";
import { isPaidOrder, normalizeOrderStatus } from "../lib/orderStatus.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const servicesPath = path.join(__dirname, "../data/services.json");

router.get("/me", requireAdmin, (req, res) => {
  res.json({ ok: true, user: sanitizeUser(req.user) });
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

router.patch("/users/:id/role", requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Role must be user or admin" });
    }
    const users = await getUsersData();
    const index = users.findIndex((u) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "User not found" });

    const adminCount = users.filter((u) => u.role === "admin").length;
    if (users[index].role === "admin" && role === "user" && adminCount <= 1) {
      return res.status(400).json({ error: "Cannot remove the last admin" });
    }

    users[index].role = role;
    await saveUsers(users);
    res.json(sanitizeUser(users[index]));
  } catch (error) {
    res.status(500).json({ error: "Failed to update role" });
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

function isPaidOrderForStats(order) {
  return isPaidOrder(order);
}

function countByStatus(orders, status) {
  return orders.filter((o) => normalizeOrderStatus(o.status) === status).length;
}

function startOfDayVN(date) {
  const d = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  d.setHours(0, 0, 0, 0);
  return d;
}

router.get("/stats", requireAdmin, async (_req, res) => {
  const orders = await readJson("orders.json", []);
  const users = await getUsersData();
  const deposits = await readJson("deposits.json", []);

  const paidOrders = orders.filter(isPaidOrderForStats);
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const now = vietnamNow();
  const todayStart = startOfDayVN(now);
  const monthStart = new Date(todayStart);
  monthStart.setDate(1);

  const revenueToday = paidOrders
    .filter((o) => new Date(o.paidAt || o.createdAt) >= todayStart)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const revenueMonth = paidOrders
    .filter((o) => new Date(o.paidAt || o.createdAt) >= monthStart)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const walletRevenue = paidOrders
    .filter((o) => o.paymentMethod === "wallet")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const guestRevenue = paidOrders
    .filter((o) => o.paymentMethod === "guest_qr")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const approvedDeposits = deposits.filter((d) => d.status === "approved");
  const pendingDeposits = deposits.filter((d) => d.status === "pending");

  res.json({
    orders: {
      total: orders.length,
      pending: countByStatus(orders, "pending"),
      processing: countByStatus(orders, "processing"),
      completed: countByStatus(orders, "completed"),
      cancelled: countByStatus(orders, "cancelled"),
    },
    revenue: {
      total: totalRevenue,
      today: revenueToday,
      month: revenueMonth,
      wallet: walletRevenue,
      guest: guestRevenue,
    },
    users: {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
    },
    deposits: {
      pending: pendingDeposits.length,
      pendingAmount: pendingDeposits.reduce((sum, d) => sum + (d.amount || 0), 0),
      approvedTotal: approvedDeposits.reduce((sum, d) => sum + (d.amount || 0), 0),
    },
  });
});

export default router;
