// src/hooks/useFavorites.js
import { useState, useEffect } from 'react';

const useFavorites = (userId) => {
  const storageKey = userId ? `favorites_${userId}` : null;

  const [favorites, setFavorites] = useState(() => {
    if (!storageKey) return [];
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Recharge les favoris si l'utilisateur change (connexion/déconnexion)
  useEffect(() => {
    if (!storageKey) { setFavorites([]); return; }
    const saved = localStorage.getItem(storageKey);
    setFavorites(saved ? JSON.parse(saved) : []);
  }, [storageKey]);

  // Persiste automatiquement
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, storageKey]);

  const isFavorite = (productId) =>
    favorites.some((f) => f.id_produit === productId);

  const addFavorite = (product) => {
    if (isFavorite(product.id_produit)) return;
    setFavorites((prev) => [...prev, product]);
    alert(`${product.nom} ajouté aux favoris !`);
  };

  const removeFavorite = (productId) => {
    setFavorites((prev) => prev.filter((f) => f.id_produit !== productId));
    alert('Produit retiré des favoris.');
  };

  const clearFavorites = () => {
    if (window.confirm('Supprimer tous vos favoris ?')) {
      setFavorites([]);
      if (storageKey) localStorage.removeItem(storageKey);
    }
  };

  return { favorites, isFavorite, addFavorite, removeFavorite, clearFavorites };
};

export default useFavorites;
