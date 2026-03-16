import React from 'react';

const FavoritesModal = ({ 
  show, 
  onClose, 
  favorites, 
  user, 
  onRemove, 
  onClearAll,
  onViewProduct,
  onOpenComments,
  getAverageRating,
  renderStars,
  getScoreColor,
  getRiskColor
}) => {
  if (!show || !user) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.favoritesModalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>❤️ Mes Favoris</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        
        {favorites.length === 0 ? (
          <div style={styles.noFavorites}>
            <span style={styles.noFavoritesIcon}>🤍</span>
            <h3 style={styles.noFavoritesTitle}>Aucun favori</h3>
            <p style={styles.noFavoritesText}>
              Ajoutez des produits à vos favoris pour les retrouver facilement !
            </p>
            <button
              onClick={onClose}
              style={styles.btnBrowseProducts}
            >
              🛒 Parcourir les produits
            </button>
          </div>
        ) : (
          <>
            <div style={styles.favoritesHeader}>
              <span style={styles.favoritesCount}>{favorites.length} produit(s)</span>
              <button onClick={onClearAll} style={styles.btnClearAll}>
                🗑️ Tout supprimer
              </button>
            </div>
            
            <div style={styles.favoritesList}>
              {favorites.map((product) => (
                <div key={product.id_produit} style={styles.favoriteCard}>
                  <div style={styles.favoriteHeader}>
                    <span style={styles.favoriteEmoji}>{product.image}</span>
                    <div style={styles.favoriteInfo}>
                      <h3 style={styles.favoriteName}>{product.nom}</h3>
                      <p style={styles.favoriteOrigin}>📍 {product.origine}</p>
                    </div>
                    <button
                      onClick={() => onRemove(product.id_produit)}
                      style={styles.btnRemoveFavorite}
                      title="Retirer des favoris"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div style={styles.favoriteStats}>
                    <div style={styles.favoriteStat}>
                      <span style={styles.favoriteStatLabel}>Score Bio</span>
                      <span style={{
                        ...styles.favoriteStatValue,
                        backgroundColor: getScoreColor(product.scoreBio)
                      }}>
                        {product.scoreBio}
                      </span>
                    </div>
                    <div style={styles.favoriteStat}>
                      <span style={styles.favoriteStatLabel}>Risque</span>
                      <span style={{
                        ...styles.favoriteStatValue,
                        color: getRiskColor(product.risque)
                      }}>
                        {product.risque}
                      </span>
                    </div>
                    <div style={styles.favoriteStat}>
                      <span style={styles.favoriteStatLabel}>Note</span>
                      <div style={styles.favoriteRating}>
                        <span style={styles.favoriteRatingScore}>
                          {getAverageRating(product.id_produit)}
                        </span>
                        {renderStars(Math.round(getAverageRating(product.id_produit)))}
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.favoriteActions}>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenComments(product);
                      }}
                      style={styles.btnFavoriteComments}
                    >
                      💬 Voir les avis
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onViewProduct(product);
                      }}
                      style={styles.btnFavoriteView}
                    >
                      👁️ Voir le produit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 🎨 CSS STYLES
const styles = {
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 1000 
  },
  favoritesModalContent: { 
    backgroundColor: 'white', 
    borderRadius: '1rem', 
    padding: '2rem', 
    width: '90%', 
    maxWidth: '800px', 
    maxHeight: '85vh', 
    overflowY: 'auto' 
  },
  modalHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '1.5rem' 
  },
  modalTitle: { 
    fontSize: '1.5rem', 
    fontWeight: '700', 
    color: '#1f2937', 
    margin: 0 
  },
  closeBtn: { 
    background: 'none', 
    border: 'none', 
    fontSize: '1.5rem', 
    cursor: 'pointer', 
    color: '#6b7280' 
  },
  noFavorites: {
    textAlign: 'center',
    padding: '3rem 2rem',
    backgroundColor: '#f9fafb',
    borderRadius: '1rem',
    border: '2px dashed #e5e7eb',
    marginTop: '1rem'
  },
  noFavoritesIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem'
  },
  noFavoritesTitle: {
    fontSize: '1.5rem',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  noFavoritesText: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '1.5rem'
  },
  btnBrowseProducts: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem'
  },
  favoritesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '0.5rem'
  },
  favoritesCount: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#16a34a'
  },
  btnClearAll: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.875rem'
  },
  favoritesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  favoriteCard: {
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  favoriteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  favoriteEmoji: {
    fontSize: '2.5rem',
    marginRight: '1rem'
  },
  favoriteInfo: {
    flex: 1
  },
  favoriteName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem'
  },
  favoriteOrigin: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  btnRemoveFavorite: {
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.25rem',
    opacity: 0.7,
    transition: 'opacity 0.2s'
  },
  favoriteStats: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem'
  },
  favoriteStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  favoriteStatLabel: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  favoriteStatValue: {
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontWeight: '600',
    fontSize: '0.875rem',
    backgroundColor: '#22c55e',
    color: 'white',
    display: 'inline-block'
  },
  favoriteRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  favoriteRatingScore: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#fbbf24'
  },
  favoriteActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  btnFavoriteComments: {
    flex: 1,
    padding: '0.625rem',
    backgroundColor: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  btnFavoriteView: {
    flex: 1,
    padding: '0.625rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem'
  }
};

export default FavoritesModal;