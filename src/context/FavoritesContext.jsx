import { createContext, useState, useEffect, useCallback, useMemo } from "react";

const getProductId = (product) => product?.id ?? product?.product_id ?? null;

export const FavoritesContext = createContext({
  favorites: [],
  favoriteCount: 0,
  addToFavorites: () => {},
  removeFromFavorites: () => {},
  isFavorite: () => {},
});

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("chimera_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("chimera_favorites", JSON.stringify(favorites));
    } catch (error) {
      console.error("Unable to save favorites to localStorage", error);
    }
  }, [favorites]);

  const addToFavorites = useCallback((product) => {
    const productId = getProductId(product);
    if (!productId) return;

    setFavorites((prevFavorites) => {
      const exists = prevFavorites.some((item) => getProductId(item) === productId);
      if (exists) {
        return prevFavorites;
      }
      return [...prevFavorites, product];
    });
  }, []);

  const removeFromFavorites = useCallback((id) => {
    setFavorites((prevFavorites) => prevFavorites.filter((item) => getProductId(item) !== id));
  }, []);

  const isFavorite = useCallback(
    (id) => favorites.some((item) => getProductId(item) === id),
    [favorites]
  );

  const favoriteCount = useMemo(() => favorites.length, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, favoriteCount, addToFavorites, removeFromFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
