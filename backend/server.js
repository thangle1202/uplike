import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { loadSessions } from "./lib/auth.js";
import servicesRouter from "./routes/services.js";
import ordersRouter from "./routes/orders.js";
import authRouter from "./routes/auth.js";
import walletRouter from "./routes/wallet.js";
import paymentsRouter from "./routes/payments.js";
import adminRouter from "./routes/admin.js";
import statsRouter from "./routes/stats.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const port = process.env.PORT || 3000;

await loadSessions();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use(express.static(path.join(__dirname, "..", "dist")));

app.use("/api/auth", authRouter);
app.use("/api/services", servicesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/stats", statsRouter);

app.get("/api/test", (_req, res) => {
  res.json({ message: "UpLike backend is running!" });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`UpLike server running on port ${port}`);
});
