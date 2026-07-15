import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "../data/services.json");

async function readServicesData() {
  const data = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(data);
}

router.get("/", async (_req, res) => {
  try {
    const data = await readServicesData();
    res.json(data.platforms);
  } catch (error) {
    console.error("Failed to fetch platforms:", error);
    res.status(500).json({ error: "Failed to fetch platforms" });
  }
});

router.get("/:platformId", async (req, res) => {
  try {
    const data = await readServicesData();
    const platform = data.platforms.find((p) => p.id === req.params.platformId);

    if (!platform) {
      return res.status(404).json({ error: "Platform not found" });
    }

    res.json(platform);
  } catch (error) {
    console.error("Failed to fetch platform:", error);
    res.status(500).json({ error: "Failed to fetch platform" });
  }
});

router.get("/:platformId/services/:serviceId", async (req, res) => {
  try {
    const data = await readServicesData();
    const platform = data.platforms.find((p) => p.id === req.params.platformId);

    if (!platform) {
      return res.status(404).json({ error: "Platform not found" });
    }

    const service = platform.services.find((s) => s.id === req.params.serviceId);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json({ ...service, platformId: platform.id, platformName: platform.name });
  } catch (error) {
    console.error("Failed to fetch service:", error);
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

export default router;
