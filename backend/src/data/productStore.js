import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { embedImage, embeddingProviderName } from "../services/embeddings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(__dirname, "products.json");
const CACHE_PATH = path.join(__dirname, "embeddings.cache.json");
const PUBLIC_DIR = path.join(__dirname, "..", "..", "public");

let cachedCatalog = null; // in-memory: [{ ...product, embedding }]

async function loadProducts() {
  const raw = await fs.readFile(PRODUCTS_PATH, "utf-8");
  return JSON.parse(raw);
}

async function loadEmbeddingCache() {
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveEmbeddingCache(cache) {
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
}

/**
 * Load the product catalog with embeddings attached, computing (and
 * disk-caching) embeddings on first run. If the active embedding provider
 * changes (e.g. a Replicate API token gets added/removed between runs),
 * the cache is invalidated and recomputed so query and catalog vectors are
 * always comparable.
 */
export async function getCatalog() {
  if (cachedCatalog) return cachedCatalog;

  const products = await loadProducts();
  const provider = embeddingProviderName();
  const cache = await loadEmbeddingCache();

  const cacheIsValid =
    cache &&
    cache.provider === provider &&
    cache.embeddings &&
    products.every((p) => Array.isArray(cache.embeddings[p.id]));

  const embeddingsById = {};

  if (cacheIsValid) {
    Object.assign(embeddingsById, cache.embeddings);
    console.log(`[productStore] Loaded ${products.length} cached embeddings (provider=${provider})`);
  } else {
    console.log(`[productStore] Computing embeddings for ${products.length} products (provider=${provider})...`);
    for (const product of products) {
      const imagePath = path.join(PUBLIC_DIR, product.imageUrl.replace(/^\//, ""));
      const buffer = await fs.readFile(imagePath);
      embeddingsById[product.id] = await embedImage(buffer, "image/png");
    }
    await saveEmbeddingCache({ provider, embeddings: embeddingsById });
    console.log("[productStore] Embeddings computed and cached to disk.");
  }

  cachedCatalog = products.map((p) => ({ ...p, embedding: embeddingsById[p.id] }));
  return cachedCatalog;
}

export async function getProductById(id) {
  const catalog = await getCatalog();
  return catalog.find((p) => p.id === Number(id)) || null;
}
