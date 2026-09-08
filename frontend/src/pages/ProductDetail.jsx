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
    return <div className="status-banner error">Couldn't load this product: {String(error.message || error)}</div>;
  }

  if (!product) {
    return (
      <div className="loading-row">
        <span className="spinner" /> Loading product…
      </div>
    );
  }

  return (
    <>
      <Link className="back-link" to="/">← Back to catalog</Link>
      <div className="detail-layout">
        <div className="detail-image-wrap">
          <img className="detail-image" src={imageUrl(product.imageUrl)} alt={product.name} />
        </div>
        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-name">{product.name}</h1>
          <div className="detail-price">฿{product.price.toLocaleString()}</div>
          <div className="detail-attrs">
            <div className="detail-attr">
              Color: <strong>{product.color}</strong>
            </div>
            <div className="detail-attr">
              Pattern: <strong>{product.pattern}</strong>
            </div>
          </div>
          <button className="btn" type="button" onClick={handleFindSimilar} disabled={findingSimilar}>
            {findingSimilar ? "Loading…" : "🔍 Find similar styles"}
          </button>
        </div>
      </div>
    </>
  );
}
