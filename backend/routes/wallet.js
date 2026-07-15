import express from "express";
import { readJson, writeJson, vietnamNow } from "../lib/store.js";
import { requireAuth, requireAdmin, getUsersData, saveUsers } from "../lib/auth.js";

const router = express.Router();

router.get("/deposit-info", async (_req, res) => {
  const config = await readJson("config.json", {});
  res.json({
    bankName: config.bankName,
    accountNumber: config.accountNumber,
    accountName: config.accountName,
    transferNotePrefix: config.transferNotePrefix || "UPLIKE",
    qrPayload: `${config.qrPayloadTemplate || "UPLIKE|DEPOSIT"}|TS:${Date.now()}`,
  });
});

router.post("/deposits", requireAuth, async (req, res) => {
  try {
    const { amount, note } = req.body;
    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount < 10000) {
      return res.status(400).json({ error: "Minimum deposit is 10,000 VND" });
    }

    const config = await readJson("config.json", {});
    const transferCode = `${config.transferNotePrefix || "UPLIKE"}${req.userId.slice(-6).toUpperCase()}${Date.now().toString().slice(-6)}`;

    const deposit = {
      id: `dep-${Date.now()}`,
      userId: req.userId,
      userEmail: req.user.email,
      amount: parsedAmount,
      note: note || "",
      transferCode,
      status: "pending",
      createdAt: vietnamNow().toISOString(),
    };

    const deposits = await readJson("deposits.json", []);
    deposits.push(deposit);
    await writeJson("deposits.json", deposits);

    res.status(201).json({
      deposit,
      qrPayload: `UPLIKE|DEPOSIT|CODE:${transferCode}|AMOUNT:${parsedAmount}|ACC:${config.accountNumber}`,
      bank: {
        bankName: config.bankName,
        accountNumber: config.accountNumber,
        accountName: config.accountName,
      },
    });
  } catch (error) {
    console.error("Deposit request failed:", error);
    res.status(500).json({ error: "Failed to create deposit request" });
  }
});

router.get("/deposits", requireAuth, async (req, res) => {
  const deposits = await readJson("deposits.json", []);
  res.json(deposits.filter((d) => d.userId === req.userId));
});

router.get("/deposits/all", requireAdmin, async (_req, res) => {
  const deposits = await readJson("deposits.json", []);
  res.json(deposits);
});

router.patch("/deposits/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be approved or rejected" });
    }

    const deposits = await readJson("deposits.json", []);
    const index = deposits.findIndex((d) => d.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Deposit not found" });

    const deposit = deposits[index];
    if (deposit.status !== "pending") {
      return res.status(400).json({ error: "Deposit already processed" });
    }

    deposit.status = status;
    deposit.processedAt = vietnamNow().toISOString();

    if (status === "approved") {
      const users = await getUsersData();
      const userIndex = users.findIndex((u) => u.id === deposit.userId);
      if (userIndex !== -1) {
        users[userIndex].walletBalance = (users[userIndex].walletBalance || 0) + deposit.amount;
        await saveUsers(users);
      }
    }

    deposits[index] = deposit;
    await writeJson("deposits.json", deposits);
    res.json(deposit);
  } catch (error) {
    console.error("Update deposit failed:", error);
    res.status(500).json({ error: "Failed to update deposit" });
  }
});

export default router;
