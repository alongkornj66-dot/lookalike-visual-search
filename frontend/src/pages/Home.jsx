import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, imageUrl } from "../api/client";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";

const HERO_SLUGS = [
  "/images/dress_005.jpg",
  "/images/shoe_008.jpg",
  "/images/bag_015.jpg",
];

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
      .then((data) => { if (!cancelled) setProducts(data.items); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category]);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">✦ Visual Fashion Search</div>
          <h1>
            Find it by <span>how it looks</span>,<br />not what it's called
          </h1>
          <p>
            Upload a photo of something you love and we'll match it to the closest
            items in our catalog — by color, silhouette, and style.
          </p>
          <Link to="/search">
            <button className="btn" type="button">
              🔍 Try visual search
            </button>
          </Link>
        </div>

        <div className="hero-images">
          {HERO_SLUGS.map((slug, i) => (
            <img
              key={i}
              className="hero-img-stack"
              src={imageUrl(slug)}
              alt=""
              aria-hidden="true"
            />
          ))}
        </div>
      </section>

      <div className="section-header">
        <h2>Browse catalog</h2>
        <p>{products.length} items{category ? ` · ${category}` : ""}</p>
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
