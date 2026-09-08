import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchByImage } from "../api/client";
import ImageUploader from "../components/ImageUploader";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";

export default function Search() {
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [category, setCategory] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const ranOnceForSeedFile = useRef(false);

  const runSearch = async (selectedFile, cat) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setLoading(true);
    setError(null);
    try {
      const data = await searchByImage(selectedFile, { category: cat });
      setResults(data.results);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const seedFile = location.state?.seedFile;
    if (seedFile && !ranOnceForSeedFile.current) {
      ranOnceForSeedFile.current = true;
      runSearch(seedFile, category);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (file) runSearch(file, cat);
  };

  return (
    <div className="page-inner">
      <div className="search-header">
        <h1>Shop by Photo</h1>
        <p>Upload an image and we will find visually similar products in our catalog.</p>
      </div>

      <ImageUploader onFileSelected={(f) => runSearch(f, category)} />

      {previewUrl && (
        <div className="preview-row">
          <img src={previewUrl} alt="Uploaded" />
          <div className="preview-meta">
            <p>Showing results for your photo</p>
            <CategoryFilter value={category} onChange={handleCategoryChange} />
          </div>
        </div>
      )}

      {error && <div className="status-banner error">{error}</div>}

      {loading && (
        <div className="loading-row"><span className="spinner" /> Searching catalog…</div>
      )}

      {!loading && results && (
        results.length === 0
          ? <div className="empty-state">No matches found. Try a different photo or category.</div>
          : <div className="product-grid" style={{ marginTop: 32 }}>
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
      )}
    </div>
  );
}
