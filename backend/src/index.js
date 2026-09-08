import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/products.js";
import searchRouter from "./routes/search.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import ordersRouter from "./routes/orders.js";
import { embeddingProviderName } from "./services/embeddings.js";
import { getCatalog } from "./data/productStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "..", "public", "images")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, embeddingProvider: embeddingProviderName() });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/products", productsRouter);
app.use("/api/search", searchRouter);

// Centralized error handler (covers multer errors, embedding failures, etc.)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// Warm the embedding cache on boot so the first real request is fast.
getCatalog()
  .then((catalog) => {
    app.listen(PORT, () => {
      console.log(`Visual & Style Search API listening on http://localhost:${PORT}`);
      console.log(`Embedding provider: ${embeddingProviderName()}`);
      console.log(`Catalog size: ${catalog.length} products`);
    });
  })
  .catch((err) => {
    console.error("Failed to warm product catalog on startup:", err);
    process.exit(1);
  });
