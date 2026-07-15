import express from "express";
import { readJson, writeJson, vietnamNow } from "../lib/store.js";
import { requireAuth, findUserById, getUsersData, saveUsers } from "../lib/auth.js";

const router = express.Router();

async function getOrderById(orderId) {
  const orders = await readJson("orders.json", []);
  return orders.find((o) => o.id === orderId) || null;
}

async function updateOrder(order) {
  const orders = await readJson("orders.json", []);
  const index = orders.findIndex((o) => o.id === order.id);
  if (index === -1) return false;
  orders[index] = order;
  await writeJson("orders.json", orders);
  return true;
}

router.get("/order/:orderId/qr", async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "ordered") {
      return res.status(400).json({ error: "Order is not awaiting payment" });
    }

    const config = await readJson("config.json", {});
    const qrPayload = `UPLIKE|ORDER:${order.id}|AMOUNT:${order.totalAmount}|ACC:${config.accountNumber}|NOTE:UPLIKE${order.id.slice(-8)}`;

    res.json({
      orderId: order.id,
      totalAmount: order.totalAmount,
      qrPayload,
      bank: {
        bankName: config.bankName,
        accountNumber: config.accountNumber,
        accountName: config.accountName,
        transferNote: `UPLIKE${order.id.slice(-8)}`,
      },
    });
  } catch (error) {
    console.error("QR generation failed:", error);
    res.status(500).json({ error: "Failed to generate payment QR" });
  }
});

router.post("/order/:orderId/confirm-guest", async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "ordered") {
      return res.status(400).json({ error: "Order is not awaiting payment" });
    }

    order.status = "processing";
    order.paymentMethod = "guest_qr";
    order.paidAt = vietnamNow().toISOString();
    order.updatedAt = order.paidAt;

    await updateOrder(order);
    res.json(order);
  } catch (error) {
    console.error("Guest payment confirm failed:", error);
    res.status(500).json({ error: "Payment confirmation failed" });
  }
});

router.post("/order/:orderId/pay-wallet", requireAuth, async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId && order.userId !== req.userId) {
      return res.status(403).json({ error: "Not your order" });
    }
    if (order.status !== "ordered") {
      return res.status(400).json({ error: "Order is not awaiting payment" });
    }

    const users = await getUsersData();
    const userIndex = users.findIndex((u) => u.id === req.userId);
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });

    const user = users[userIndex];
    if ((user.walletBalance || 0) < order.totalAmount) {
      return res.status(400).json({
        error: "Insufficient wallet balance",
        walletBalance: user.walletBalance,
        required: order.totalAmount,
      });
    }

    users[userIndex].walletBalance -= order.totalAmount;
    await saveUsers(users);

    order.status = "processing";
    order.paymentMethod = "wallet";
    order.userId = req.userId;
    order.paidAt = vietnamNow().toISOString();
    order.updatedAt = order.paidAt;

    await updateOrder(order);

    const updatedUser = await findUserById(req.userId);
    res.json({ order, walletBalance: updatedUser?.walletBalance ?? 0 });
  } catch (error) {
    console.error("Wallet payment failed:", error);
    res.status(500).json({ error: "Wallet payment failed" });
  }
});

export default router;
