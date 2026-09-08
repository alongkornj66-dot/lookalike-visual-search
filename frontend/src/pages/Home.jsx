import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api/client";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProducts({ category })
      .then((data) => {
        if (!cancelled) setProducts(data.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <>
      <section className="hero">
        <div>
          <h1>Find it by how it looks, not what it's called</h1>
          <p>
            Upload a photo of something you like and we'll match it to items in the
            catalog by color and silhouette — no need to know the right search terms.
          </p>
          <Link to="/search">
            <button className="btn" type="button">
              🔍 Try visual search
            </button>
          </Link>
        </div>
        <div className="hero-visual">🛍️</div>
      </section>

      <div className="page-header">
        <h1>Browse the catalog</h1>
        <p>{products.length} items{category ? ` in ${category}` : ""}</p>
      </div>

      <CategoryFilter value={category} onChange={setCategory} />

      {error && <div className="status-banner error">Couldn't load products: {error}</div>}

      {loading ? (
        <div className="loading-row">
          <span className="spinner" /> Loading catalog…
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">No products in this category yet.</div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
