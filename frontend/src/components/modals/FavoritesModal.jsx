// src/components/modals/FavoritesModal.jsx
import React from 'react';

const FavoritesModal = ({ favorites, onClose, onRemoveFavorite }) => {

  // ✅ Récupère l'id réel du produit (_id MongoDB)
  const getProductId = (product) =>
    product?._id || product?.id_produit || product?.id;

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
            {favorites.map((product) => {
              const productId = getProductId(product);
              return (
                <div key={productId} style={styles.card}>
                  {/* Image */}
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.nom}
                      style={styles.image}
                    />
                  )}

                  {/* Infos produit */}
                  <div style={styles.info}>
                    <h4 style={styles.productName}>{product.nom}</h4>
                    {product.description && (
                      <p style={styles.productDesc}>{product.description}</p>
                    )}
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    style={styles.removeBtn}
                    onClick={() => onRemoveFavorite(productId)}
                  >
                    🗑️ Retirer
                  </button>
                </div>
              );
            })}
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
  card: {
    display: 'flex', alignItems: 'center', gap: 12,
    border: '1px solid #e5e7eb', borderRadius: 8, padding: 12,
    backgroundColor: '#fafafa'
  },
  image: { width: 60, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 },
  info: { flex: 1 },
  productName: { margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1f2937' },
  productDesc: { margin: '4px 0 0 0', fontSize: 12, color: '#6b7280' },
  removeBtn: {
    padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626',
    border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer',
    fontWeight: 600, fontSize: 13, flexShrink: 0
  },
};

export default FavoritesModal;
