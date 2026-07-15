import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readJson } from "../lib/store.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const servicesPath = path.join(__dirname, "../data/services.json");

router.get("/", async (_req, res) => {
  try {
    const config = await readJson("config.json", {});
    const servicesRaw = await fs.readFile(servicesPath, "utf-8");
    const { platforms = [] } = JSON.parse(servicesRaw);

    const serviceCount = platforms.reduce((sum, p) => sum + (p.services?.length || 0), 0);
    const landing = config.landing || {};

    res.json({
      customers: landing.customers || "10,000+",
      ordersDelivered: landing.ordersDelivered || "500,000+",
      satisfactionRate: landing.satisfactionRate || "98%",
      supportHours: landing.supportHours || "24/7",
      tagline: landing.tagline || "Tăng tương tác mạng xã hội nhanh chóng, an toàn và uy tín",
      highlights: landing.highlights || [],
      platforms: platforms.length,
      services: serviceCount,
    });
  } catch (error) {
    console.error("Failed to fetch landing stats:", error);
    res.status(500).json({ error: "Failed to fetch landing stats" });
  }
});

export default router;
