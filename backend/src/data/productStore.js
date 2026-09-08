import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { embedImage, embeddingProviderName } from "../services/embeddings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(__dirname, "products.json");
const CACHE_PATH = path.join(__dirname, "embeddings.cache.json");
const PUBLIC_DIR = path.join(__dirname, "..", "..", "public");

let cachedEmbeddings = null;  // { provider, byId: { [id]: Float32Array } }
let cachedCatalog    = null;  // kept only for the boot warm-up path

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
async function ensureEmbeddings(products) {
  const provider = embeddingProviderName();

  if (cachedEmbeddings && cachedEmbeddings.provider === provider) {
    // Check if any new products are missing embeddings
    const missing = products.filter((p) => !cachedEmbeddings.byId[p.id] && !p.imageUrl.startsWith("http"));
    if (missing.length === 0) return cachedEmbeddings.byId;
  }

  const diskCache = await loadEmbeddingCache();
  const diskValid =
    diskCache &&
    diskCache.provider === provider &&
    diskCache.embeddings &&
    products.every((p) => p.imageUrl.startsWith("http") || Array.isArray(diskCache.embeddings[p.id]));

  const byId = {};

  if (diskValid) {
    Object.assign(byId, diskCache.embeddings);
    console.log(`[productStore] Loaded ${products.length} cached embeddings (provider=${provider})`);
  } else {
    console.log(`[productStore] Computing embeddings for ${products.length} products (provider=${provider})...`);
    for (const product of products) {
      if (product.imageUrl.startsWith("http")) continue; // skip remote URLs
      const imagePath = path.join(PUBLIC_DIR, product.imageUrl.replace(/^\//, ""));
      const buffer = await fs.readFile(imagePath);
      byId[product.id] = await embedImage(buffer, "image/png");
    }
    await saveEmbeddingCache({ provider, embeddings: byId });
    console.log("[productStore] Embeddings computed and cached to disk.");
  }

  cachedEmbeddings = { provider, byId };
  return byId;
}

export async function getCatalog() {
  // Always read fresh product metadata from disk so edits take effect immediately.
  const products = await loadProducts();
  const embeddingsById = await ensureEmbeddings(products);
  cachedCatalog = products.map((p) => ({ ...p, embedding: embeddingsById[p.id] || null }));
  return cachedCatalog;
}

export async function getProductById(id) {
  const catalog = await getCatalog();
  return catalog.find((p) => p.id === Number(id)) || null;
}
