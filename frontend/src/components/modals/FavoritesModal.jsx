import React from 'react';
import { FiHeart, FiTrash2, FiX } from 'react-icons/fi';

const FavoritesModal = ({ favorites, onClose, onRemoveFavorite }) => {

  // ✅ Récupère l'id réel du produit (_id MongoDB)
  const getProductId = (product) =>
    product?._id || product?.id_produit || product?.id;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div style={styles.header}>
          <h2 style={styles.title}><FiHeart style={{marginRight: '8px', color: '#ef4444'}} /> Mes Favoris</h2>
          <button onClick={onClose} style={styles.closeBtn}><FiX /></button>
        </div>

        {favorites.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}><FiHeart /></span>
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
                    <FiTrash2 size={16} /> Retirer
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
    backdropFilter: 'blur(4px)',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  },
  modal: {
    backgroundColor: 'var(--bg-card)', padding: 24, borderRadius: 16,
    width: '90%', maxWidth: 640, maxHeight: '85vh', overflowY: 'auto',
    boxShadow: 'var(--shadow-light)',
    border: '1px solid var(--border-color)'
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  title: { margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' },
  closeBtn: { border: 'none', background: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-secondary)' },
  empty: { textAlign: 'center', padding: '2rem 1rem' },
  emptyIcon: { fontSize: '3rem', display: 'block', marginBottom: 8, color: 'var(--text-muted)' },
  emptyText: { color: 'var(--text-secondary)', fontSize: '1rem' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    display: 'flex', alignItems: 'center', gap: 12,
    border: '1px solid var(--border-color)', borderRadius: 12, padding: 12,
    backgroundColor: 'var(--bg-main)',
    transition: 'transform 0.2s'
  },
  image: { width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
  info: { flex: 1 },
  productName: { margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' },
  productDesc: { margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-muted)' },
  removeBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', backgroundColor: 'transparent', color: '#ef4444',
    border: '1px solid #ef4444', borderRadius: 8, cursor: 'pointer',
    fontWeight: 600, fontSize: 13, flexShrink: 0, transition: 'all 0.2s'
  },
};

export default FavoritesModal;
