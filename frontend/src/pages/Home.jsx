import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, imageUrl } from "../api/client";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";

const DEPARTMENTS = [
  { label: "Clothing", category: "dress", image: "/images/dress_006.jpg" },
  { label: "Shoes", category: "shoe", image: "/images/shoe_012.jpg" },
  { label: "Bags", category: "bag", image: "/images/bag_014.jpg" },
];

export default function Home({ defaultCategory = "" }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(defaultCategory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProducts({ category })
      .then((data) => { if (!cancelled) setProducts(data.items); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category]);

  const handleDeptClick = (cat) => {
    setCategory(cat);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Department tiles */}
      <div className="departments">
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept.label}
            className="dept-tile"
            onClick={() => handleDeptClick(dept.category)}
            type="button"
          >
            <img src={imageUrl(dept.image)} alt={dept.label} />
            <div className="dept-label">{dept.label}</div>
          </button>
        ))}
      </div>

      {/* Catalog */}
      <div className="catalog-container" id="catalog">
        <div className="catalog-header" style={{ marginBottom: 0 }}>
          <h2>{loading ? "" : `${products.length} items`}</h2>
        </div>

        <CategoryFilter value={category} onChange={setCategory} />

        {error && <div className="status-banner error">{error}</div>}

        {loading ? (
          <div className="loading-row"><span className="spinner" /> Loading…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products found.</div>
        ) : (
          <div className="product-grid">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
