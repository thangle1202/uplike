import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const dataDir = path.join(__dirname, "..", "data");

export async function readJson(fileName, fallback = null) {
  const filePath = path.join(dataDir, fileName);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

export async function writeJson(fileName, data) {
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export function vietnamNow() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
}

export function calcOrderTotal(items) {
  return items.reduce((sum, item) => sum + item.pricePerUnit * (item.quantity || 1), 0);
}
