import { Link } from "react-router-dom";
import { imageUrl } from "../api/client";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";

function IconHeart({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export default function ProductCard({ product }) {
  const { toggle, isWishlisted } = useWishlist();
  const { show } = useToast();
  const wishlisted = isWishlisted(product.id);
  const hasSimilarity = typeof product.similarity === "number";

  const handleWishlist = (e) => {
    e.preventDefault();
    const added = toggle(product.id);
    show(added ? "Saved to wishlist" : "Removed from wishlist", added ? "success" : "default");
  };

  return (
    <Link className="product-card" to={`/product/${product.id}`}>
      <div className="product-thumb-wrap">
        <img
          className="product-thumb"
          src={imageUrl(product.imageUrl)}
          alt={product.name}
          loading="lazy"
        />
        <button
          className={`wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
          type="button"
          onClick={handleWishlist}
          title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
        >
          <IconHeart filled={wishlisted} />
        </button>
        {hasSimilarity && (
          <div className="similarity-badge">
            {Math.round(product.similarity * 100)}% match
          </div>
        )}
      </div>
      <div className="product-info">
        <p className="product-category-label">{product.category}</p>
        <p className="product-name">{product.name}</p>
        <p className="product-price">฿{product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
