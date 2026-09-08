import { Link } from "react-router-dom";
import { imageUrl } from "../api/client";

export default function ProductCard({ product }) {
  const hasSimilarity = typeof product.similarity === "number";

  return (
    <Link className="product-card" to={`/product/${product.id}`}>
      <img className="product-thumb" src={imageUrl(product.imageUrl)} alt={product.name} loading="lazy" />
      <div className="product-info">
        {hasSimilarity && (
          <span className="similarity-badge">{Math.round(product.similarity * 100)}% match</span>
        )}
        <p className="product-name">{product.name}</p>
        <div className="product-meta">
          <span>฿ {product.price.toLocaleString()}</span>
          <span>{product.category}</span>
        </div>
      </div>
    </Link>
  );
}
