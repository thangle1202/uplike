import crypto from "crypto";
import { readJson, writeJson } from "./store.js";

const SALT = process.env.AUTH_SALT || "uplike-dev-salt";
const sessions = new Map();

export function hashPassword(password) {
  return crypto.createHash("sha256").update(`${password}:${SALT}`).digest("hex");
}

export function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function loadSessions() {
  const stored = await readJson("sessions.json", {});
  Object.entries(stored).forEach(([token, userId]) => sessions.set(token, userId));
}

export async function persistSessions() {
  const obj = Object.fromEntries(sessions);
  await writeJson("sessions.json", obj);
}

export function setSession(token, userId) {
  sessions.set(token, userId);
  persistSessions().catch(console.error);
}

export function removeSession(token) {
  sessions.delete(token);
  persistSessions().catch(console.error);
}

export function getUserIdFromToken(token) {
  if (!token) return null;
  return sessions.get(token) || null;
}

export async function getUsersData() {
  const data = await readJson("users.json", { users: [] });
  return data.users || [];
}

export async function saveUsers(users) {
  await writeJson("users.json", { users });
}

export async function findUserByEmail(email) {
  const users = await getUsersData();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  const users = await getUsersData();
  return users.find((u) => u.id === id) || null;
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  req.userId = getUserIdFromToken(token);
  if (req.userId) {
    req.user = await findUserById(req.userId);
  }
  next();
}

export async function requireAuth(req, res, next) {
  await optionalAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  });
}

export async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userId = getUserIdFromToken(token);

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = await findUserById(userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  req.userId = userId;
  req.user = user;
  next();
}
