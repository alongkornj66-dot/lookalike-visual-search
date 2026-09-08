import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, imageUrl } from "../api/client";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";

const DEPARTMENTS = [
  { label: "Clothing", category: "tshirt", image: "/images/dress_006.jpg" },
  { label: "Shoes",    category: "shoe",   image: "/images/shoe_012.jpg"  },
  { label: "Bags",     category: "bag",    image: "/images/bag_014.jpg"   },
];

export default function Home({ defaultCategory = "" }) {
  const [searchParams] = useSearchParams();
  const queryTerm = searchParams.get("q") || "";

  const [allProducts, setAllProducts] = useState([]);
  const [category, setCategory] = useState(defaultCategory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { setCategory(defaultCategory); }, [defaultCategory]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProducts({ category })
      .then((data) => { if (!cancelled) setAllProducts(data.items); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category]);

  const products = useMemo(() => {
    if (!queryTerm) return allProducts;
    const q = queryTerm.toLowerCase();
    return allProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.color.toLowerCase().includes(q)
    );
  }, [allProducts, queryTerm]);

  const handleDeptClick = (cat) => {
    setCategory(cat);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Department tiles — hide when searching */}
      {!queryTerm && !defaultCategory && (
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
      )}

      <div className="catalog-container" id="catalog">
        <div className="catalog-header">
          {queryTerm ? (
            <h2>Search results for &ldquo;{queryTerm}&rdquo;</h2>
          ) : (
            <h2>{loading ? "" : `${products.length} items`}</h2>
          )}
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
