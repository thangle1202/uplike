import express from "express";
import {
  hashPassword,
  createToken,
  setSession,
  removeSession,
  findUserByEmail,
  findUserById,
  sanitizeUser,
  requireAuth,
  getUsersData,
  saveUsers,
} from "../lib/auth.js";
import { vietnamNow } from "../lib/store.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "Email and password (min 6 chars) required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const users = await getUsersData();
    const user = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      name: name || email.split("@")[0],
      walletBalance: 0,
      role: "user",
      createdAt: vietnamNow().toISOString(),
    };
    users.push(user);
    await saveUsers(users);

    const token = createToken();
    setSession(token, user.id);

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Register failed:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createToken();
    setSession(token, user.id);

    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", requireAuth, (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) removeSession(token);
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await findUserById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: sanitizeUser(user) });
});

export default router;
