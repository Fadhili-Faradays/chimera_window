import { createContext, useState, useEffect, useCallback, useMemo } from "react";

const getProductId = (product) => product?.id ?? product?.product_id ?? null;

export const CartContext = createContext({
  cart: [],
  cartCount: 0,
  cartTotal: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("chimera_cart");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("chimera_cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Unable to save cart to localStorage", error);
    }
  }, [cart]);

  const addToCart = useCallback((product) => {
    const productId = getProductId(product);
    if (!productId) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => getProductId(item) === productId);
      if (existingItem) {
        return prevCart.map((item) =>
          getProductId(item) === productId
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prevCart) => prevCart.filter((item) => getProductId(item) !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((count, item) => count + (item.quantity || 1), 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + parseFloat(item.product_cost || 0) * (item.quantity || 1),
        0
      ),
    [cart]
  );

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
