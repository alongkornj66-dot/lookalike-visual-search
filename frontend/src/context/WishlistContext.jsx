import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("wishlist") || "[]"));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify([...ids]));
  }, [ids]);

  const toggle = (id) => {
    setIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    return !ids.has(id);
  };

  const isWishlisted = (id) => ids.has(id);

  return (
    <WishlistContext.Provider value={{ ids, toggle, isWishlisted, count: ids.size }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
