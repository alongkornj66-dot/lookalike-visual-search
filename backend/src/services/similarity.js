/**
 * Cosine similarity between two equal-length numeric vectors.
 * Returns a value in [-1, 1] (in practice [0, 1] for our non-negative
 * feature vectors) where 1 means "identical direction" / maximally similar.
 */
export function cosineSimilarity(a, b) {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Rank a list of { id, embedding, ...rest } items against a query embedding.
 * Returns the same items with a `similarity` field (0-1), sorted descending.
 */
export function rankBySimilarity(queryEmbedding, items, { limit } = {}) {
  const ranked = items
    .map((item) => ({
      ...item,
      similarity: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  return typeof limit === "number" ? ranked.slice(0, limit) : ranked;
}
