// src/components/modals/FavoritesModal.jsx
import React from 'react';
import ProductCard from '../Home/ProductCard';

const FavoritesModal = ({ favorites, onClose, onRemoveFavorite, onViewProduct, onComment }) => {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div style={styles.header}>
          <h2 style={styles.title}>❤️ Mes Favoris</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {favorites.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>🤍</span>
            <p style={styles.emptyText}>Aucun favori pour le moment.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {favorites.map((product) => (
              <div key={product.id_produit} style={styles.card}>
                <ProductCard
                  produit={product}
                  onFavorite={() => onRemoveFavorite(product.id_produit)}
                  onComment={() => onComment(product)}
                />
                <button
                  style={styles.viewBtn}
                  onClick={() => onViewProduct(product)}
                >
                  👁️ Voir le produit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff', padding: 24, borderRadius: 12,
    width: '90%', maxWidth: 640, maxHeight: '85vh', overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  title: { margin: 0, fontSize: '1.4rem', color: '#1f2937' },
  closeBtn: { border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' },
  empty: { textAlign: 'center', padding: '2rem 1rem' },
  emptyIcon: { fontSize: '3rem', display: 'block', marginBottom: 8 },
  emptyText: { color: '#6b7280', fontSize: '1rem' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { display: 'flex', flexDirection: 'column' },
  viewBtn: {
    marginTop: 8, padding: '7px 14px', backgroundColor: '#3b82f6',
    color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
    fontWeight: '600', fontSize: '0.9rem',
  },
};

export default FavoritesModal;
