import sharp from "sharp";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN?.trim();
const REPLICATE_MODEL_VERSION = process.env.REPLICATE_MODEL_VERSION?.trim();
const REPLICATE_ENDPOINT = "https://api.replicate.com/v1/predictions";

const usingReplicate = Boolean(REPLICATE_API_TOKEN && REPLICATE_MODEL_VERSION);

export function embeddingProviderName() {
  return usingReplicate ? "replicate-clip" : "local-color-grid";
}

/**
 * Local, dependency-free fallback embedding.
 *
 * It downsamples the image to an 8x8 grid and takes the average R/G/B of
 * each cell, giving a 192-dim vector that captures coarse color layout and
 * silhouette -- good enough to tell a red t-shirt from a blue dress in our
 * synthetic catalog, without needing any external API or a heavyweight ML
 * model running locally.
 */
async function localColorGridEmbedding(imageBuffer) {
  const GRID = 8;
  const { data } = await sharp(imageBuffer)
    .resize(GRID, GRID, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // data is GRID*GRID*3 bytes (RGB), already in row-major grid order.
  const vector = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    vector[i] = data[i] / 255; // normalize to [0, 1]
  }
  return vector;
}

async function replicateEmbedding(imageBuffer, mimeType) {
  const dataUri = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

  const response = await fetch(REPLICATE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
      // Ask Replicate to hold the connection open and return the finished
      // result synchronously (up to 60s) instead of us having to poll.
      Prefer: "wait=60",
    },
    body: JSON.stringify({
      version: REPLICATE_MODEL_VERSION,
      input: { image: dataUri },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Replicate request failed (${response.status}): ${text}`);
  }

  const prediction = await response.json();

  if (prediction.status === "failed") {
    throw new Error(`Replicate prediction failed: ${prediction.error}`);
  }

  if (prediction.status !== "succeeded") {
    // Prefer:wait timed out before completion -- treat as unavailable for
    // this request rather than hanging the API response.
    throw new Error(`Replicate prediction did not complete in time (status=${prediction.status})`);
  }

  const output = prediction.output;
  const vector = Array.isArray(output) ? output : output?.embedding;

  if (!Array.isArray(vector)) {
    throw new Error("Replicate response did not include a numeric embedding array");
  }

  return vector;
}

/**
 * Compute an embedding vector for an image buffer.
 * Tries Replicate's hosted CLIP model first (if configured), and
 * transparently falls back to the local method on any error so a demo
 * never breaks just because of a network hiccup or an expired API token.
 */
export async function embedImage(imageBuffer, mimeType = "image/png") {
  if (usingReplicate) {
    try {
      return await replicateEmbedding(imageBuffer, mimeType);
    } catch (err) {
      console.warn(`[embeddings] Replicate call failed, falling back to local method: ${err.message}`);
    }
  }
  return localColorGridEmbedding(imageBuffer);
}
