import { Router } from "express";
import multer from "multer";
import { embedImage, embeddingProviderName } from "../services/embeddings.js";
import { getCatalog } from "../data/productStore.js";
import { rankBySimilarity } from "../services/similarity.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are supported"));
    }
    cb(null, true);
  },
});

const router = Router();

// POST /api/search  (multipart/form-data, field name: "image")
router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded. Send it as multipart field 'image'." });
    }

    const { category, limit } = req.query;
    const queryEmbedding = await embedImage(req.file.buffer, req.file.mimetype);

    const catalog = await getCatalog();
    const candidates = category ? catalog.filter((p) => p.category === category) : catalog;

    const ranked = rankBySimilarity(queryEmbedding, candidates, {
      limit: limit ? Number(limit) : 12,
    }).map(({ embedding, ...rest }) => rest);

    res.json({
      provider: embeddingProviderName(),
      resultCount: ranked.length,
      results: ranked,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
