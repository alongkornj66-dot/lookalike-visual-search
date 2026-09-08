import { useEffect, useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { fetchProducts } from "../api/client";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({})
      .then((data) => {
        setProducts(data.items.filter((p) => ids.has(p.id)));
      })
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="catalog-container">
      <div className="catalog-header" style={{ paddingBottom: 24, marginBottom: 0, borderBottom: "1px solid var(--grey-200)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Saved Items</h1>
        <p style={{ fontSize: 13, color: "var(--grey-600)" }}>{ids.size} {ids.size === 1 ? "item" : "items"}</p>
      </div>

      {loading ? (
        <div className="loading-row" style={{ marginTop: 32 }}><span className="spinner" /> Loading…</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>You have not saved any items yet.</p>
          <p style={{ marginTop: 8, fontSize: 12 }}>Click the heart icon on any product to save it here.</p>
        </div>
      ) : (
        <div className="product-grid" style={{ marginTop: 32 }}>
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
