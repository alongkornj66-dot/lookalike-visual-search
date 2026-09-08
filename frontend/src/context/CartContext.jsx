import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const exists = state.find(
        (i) => i.id === action.item.id && i.size === action.item.size
      );
      if (exists) {
        return state.map((i) =>
          i.id === action.item.id && i.size === action.item.size
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...state, { ...action.item, qty: 1 }];
    }
    case "REMOVE":
      return state.filter((i) => !(i.id === action.id && i.size === action.size));
    case "UPDATE_QTY":
      return state.map((i) =>
        i.id === action.id && i.size === action.size
          ? { ...i, qty: Math.max(1, action.qty) }
          : i
      );
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], () => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item) => dispatch({ type: "ADD", item });
  const removeItem = (id, size) => dispatch({ type: "REMOVE", id, size });
  const updateQty = (id, size, qty) => dispatch({ type: "UPDATE_QTY", id, size, qty });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
