import { useEffect, useState } from "react";
import { fetchProducts } from "../api/client";
import ProductCard from "../components/ProductCard";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Football", value: "football" },
  { label: "Basketball", value: "basketball" },
  { label: "Training", value: "training" },
];

const CLUB_KEYWORDS = {
  football: ["arsenal", "barcelona", "manchester", "man utd", "brazil", "spain", "squad", "club", "match", "european"],
  basketball: ["nba", "bape", "basketball"],
  training: ["training", "athletic", "tank", "running", "track", "performance"],
};

export default function Sports() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [filter, setFilter]       = useState("");

  useEffect(() => {
    setLoading(true);
    fetchProducts({ category: "jersey" })
      .then((data) => setProducts(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? products.filter((p) => {
        const text = (p.name + " " + p.description).toLowerCase();
        return CLUB_KEYWORDS[filter]?.some((kw) => text.includes(kw));
      })
    : products;

  return (
    <>
      {/* Hero */}
      <div className="sports-hero">
        <div className="sports-hero__inner">
          <p className="sports-hero__eyebrow">New Collection</p>
          <h1 className="sports-hero__title">Sports &amp; Jerseys</h1>
          <p className="sports-hero__sub">
            Official-style football, basketball, and athletic jerseys from top clubs worldwide.
          </p>
        </div>
      </div>

      <div className="catalog-container">
        <div className="catalog-header">
          <h2>{loading ? "" : `${filtered.length} items`}</h2>
        </div>

        {/* Filter tabs */}
        <div className="sports-filters">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`sports-filter-btn${filter === f.value ? " active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <div className="status-banner error">{error}</div>}

        {loading ? (
          <div className="loading-row"><span className="spinner" /> Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No jerseys found.</div>
        ) : (
          <div className="product-grid">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
