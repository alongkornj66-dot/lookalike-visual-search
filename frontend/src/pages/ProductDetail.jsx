import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProduct, imageUrl } from "../api/client";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [findingSimilar, setFindingSimilar] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    setError(null);
    fetchProduct(id)
      .then((data) => { if (!cancelled) setProduct(data); })
      .catch((err) => { if (!cancelled) setError(err); });
    return () => { cancelled = true; };
  }, [id]);

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

  return (
    <div className="detail-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/?cat=${product.category}`}>{product.category}</Link>
        <span>/</span>
        <span style={{ color: "var(--black)" }}>{product.name}</span>
      </div>

      <div className="detail-layout">
        <div className="detail-images">
          <img
            className="detail-main-image"
            src={imageUrl(product.imageUrl)}
            alt={product.name}
          />
        </div>

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
            <div className="detail-attr-row">
              <span className="detail-attr-label">Category</span>
              <span className="detail-attr-val">{product.category}</span>
            </div>
          </div>

          <button className="cta-btn" type="button">Add to Cart</button>
          <button
            className="cta-btn outline"
            type="button"
            onClick={handleFindSimilar}
            disabled={findingSimilar}
          >
            {findingSimilar ? "Loading…" : "Find Similar Styles"}
          </button>
        </div>
      </div>
    </div>
  );
}
