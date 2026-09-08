import { Link } from "react-router-dom";
import { imageUrl } from "../api/client";

export default function ProductCard({ product }) {
  const hasSimilarity = typeof product.similarity === "number";

  return (
    <Link className="product-card" to={`/product/${product.id}`}>
      <div className="product-thumb-wrap">
        <img
          className="product-thumb"
          src={imageUrl(product.imageUrl)}
          alt={product.name}
          loading="lazy"
        />
        <div className="product-overlay" />
        {hasSimilarity && (
          <span className="similarity-badge">
            {Math.round(product.similarity * 100)}% match
          </span>
        )}
      </div>
      <div className="product-info">
        <p className="product-name">{product.name}</p>
        <div className="product-meta">
          <span className="product-price">฿{product.price.toLocaleString()}</span>
          <span className="product-cat-tag">{product.category}</span>
        </div>
      </div>
    </Link>
  );
}
