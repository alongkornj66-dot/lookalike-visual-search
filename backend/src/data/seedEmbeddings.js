// Standalone script: `npm run seed`
// Pre-computes and caches embeddings for the whole catalog so the first
// API request after a fresh checkout doesn't have to pay that cost.
import "dotenv/config";
import { getCatalog } from "./productStore.js";

const catalog = await getCatalog();
console.log(`Seeded embeddings for ${catalog.length} products.`);
