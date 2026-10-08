import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shopsphere-cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("shopsphere-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((current) => {
      const found = current.find((x) => x.product === product._id);

      if (found) {
        return current.map((x) =>
          x.product === product._id
            ? { ...x, quantity: Math.min(x.quantity + 1, product.stock) }
            : x
        );
      }

      return [
        ...current,
        {
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCart((current) =>
      current
        .map((x) =>
          x.product === id
            ? { ...x, quantity: Math.min(Math.max(1, quantity), x.stock) }
            : x
        )
        .filter((x) => x.quantity > 0)
    );
  };

  const removeFromCart = (id) =>
    setCart((current) => current.filter((x) => x.product !== id));

  const clearCart = () => setCart([]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const count = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
