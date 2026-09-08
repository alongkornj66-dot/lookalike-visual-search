import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProduct, fetchProducts, imageUrl } from "../api/client";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import ProductCard from "../components/ProductCard";

const SIZES = {
  tshirt: ["XS", "S", "M", "L", "XL", "XXL"],
  dress:  ["XS", "S", "M", "L", "XL"],
  shoe:   ["36", "37", "38", "39", "40", "41", "42", "43"],
  bag:    ["One Size"],
  hat:    ["S / M", "L / XL"],
};

function IconHeart({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { show } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [findingSimilar, setFindingSimilar] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    setRelated([]);
    setError(null);
    setSelectedSize(null);
    setSizeError(false);

    fetchProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        const sizes = SIZES[data.category] || ["One Size"];
        if (sizes.length === 1) setSelectedSize(sizes[0]);

        fetchProducts({ category: data.category })
          .then((res) => {
            if (!cancelled)
              setRelated(res.items.filter((p) => p.id !== data.id).slice(0, 4));
          });
      })
      .catch((err) => { if (!cancelled) setError(err); });

    return () => { cancelled = true; };
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      size: selectedSize,
    });
    show(`Added to bag — ${product.name} (${selectedSize})`, "success");
  };

  const handleWishlist = () => {
    const added = toggle(product.id);
    show(added ? "Saved to wishlist" : "Removed from wishlist", added ? "success" : "default");
  };

  const handleFindSimilar = async () => {
    if (!product) return;
    setFindingSimilar(true);
    try {
      const res = await fetch(imageUrl(product.imageUrl));
      const blob = await res.blob();
      const file = new File([blob], `${product.name}.jpg`, { type: blob.type || "image/jpeg" });
      navigate("/search", { state: { seedFile: file } });
    } finally {
      setFindingSimilar(false);
    }
  };

  if (error) {
    return (
      <div className="detail-container">
        <div className="status-banner error">Could not load this product.</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="detail-container">
        <div className="loading-row"><span className="spinner" /> Loading…</div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const sizes = SIZES[product.category] || ["One Size"];

  return (
    <div className="detail-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span style={{ textTransform: "capitalize" }}>{product.category}</span>
        <span>/</span>
        <span style={{ color: "var(--black)" }}>{product.name}</span>
      </div>

      <div className="detail-layout">
        {/* Image */}
        <div className="detail-images">
          <img className="detail-main-image" src={imageUrl(product.imageUrl)} alt={product.name} />
        </div>

        {/* Info */}
        <div className="detail-info">
          <p className="detail-category-label">{product.category}</p>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-price">฿{product.price.toLocaleString()}</p>

          <div className="detail-attrs">
            <div className="detail-attr-row">
              <span className="detail-attr-label">Color</span>
              <span className="detail-attr-val">{product.color}</span>
            </div>
            <div className="detail-attr-row">
              <span className="detail-attr-label">Pattern</span>
              <span className="detail-attr-val">{product.pattern}</span>
            </div>
          </div>

          {/* Size selector */}
          <div className="size-section">
            <div className="size-header">
              <span className="size-label">Size</span>
              {selectedSize && <span className="size-selected">{selectedSize}</span>}
            </div>
            <div className="size-grid">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`size-btn ${selectedSize === s ? "active" : ""}`}
                  onClick={() => { setSelectedSize(s); setSizeError(false); }}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && <p className="size-error">Please select a size</p>}
          </div>

          {/* CTAs */}
          <button className="cta-btn" type="button" onClick={handleAddToCart}>
            Add to Bag
          </button>
          <button
            className="cta-btn outline"
            type="button"
            onClick={handleWishlist}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <IconHeart filled={wishlisted} />
            {wishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
          </button>
          <button
            className="cta-btn outline"
            type="button"
            onClick={handleFindSimilar}
            disabled={findingSimilar}
            style={{ marginTop: 8 }}
          >
            {findingSimilar ? "Loading…" : "Find Similar Styles"}
          </button>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="related-section">
          <h2 className="related-title">You May Also Like</h2>
          <div className="product-grid">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
