import express from "express";
import { readJson, writeJson, vietnamNow, calcOrderTotal } from "../lib/store.js";
import { optionalAuth, requireAuth, requireAdmin } from "../lib/auth.js";

const router = express.Router();

const ORDER_STATUSES = ["ordered", "processing", "done", "cancelled"];

function validateOrderItem(item) {
  if (!item.platformId || !item.serviceId || !item.url) {
    return "Missing platformId, serviceId, or url";
  }
  if (!item.quantity || item.quantity < 1) {
    return "Invalid quantity";
  }
  if (item.requiresComments && (!item.comments || item.comments.length === 0)) {
    return "Comments are required for this service";
  }
  return null;
}

router.post("/", optionalAuth, async (req, res) => {
  try {
    const { items, contact, note } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    const contactValue = req.user?.email || (typeof contact === "string" && contact.trim()) || "Khách";

    for (const item of items) {
      const error = validateOrderItem(item);
      if (error) return res.status(400).json({ error });
    }

    const now = vietnamNow();
    const totalAmount = calcOrderTotal(items);

    const order = {
      id: Date.now().toString(),
      userId: req.user?.id || null,
      items,
      contact: contactValue,
      note: note || "",
      status: "ordered",
      paymentMethod: null,
      totalAmount,
      paidAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      timestamp: now.getTime(),
    };

    const orders = await readJson("orders.json", []);
    orders.push(order);
    await writeJson("orders.json", orders);

    res.status(201).json(order);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/my", requireAuth, async (req, res) => {
  const orders = await readJson("orders.json", []);
  res.json(
    orders
      .filter((o) => o.userId === req.userId)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  );
});

router.get("/:orderId", optionalAuth, async (req, res) => {
  const orders = await readJson("orders.json", []);
  const order = orders.find((o) => o.id === req.params.orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (order.userId && req.user?.id !== order.userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json(order);
});

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const orders = await readJson("orders.json", []);
    res.json(orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.patch("/:orderId/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Use: ${ORDER_STATUSES.join(", ")}` });
    }

    const orders = await readJson("orders.json", []);
    const index = orders.findIndex((o) => o.id === req.params.orderId);
    if (index === -1) return res.status(404).json({ error: "Order not found" });

    orders[index].status = status;
    orders[index].updatedAt = vietnamNow().toISOString();
    await writeJson("orders.json", orders);

    res.json(orders[index]);
  } catch (error) {
    console.error("Failed to update order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
