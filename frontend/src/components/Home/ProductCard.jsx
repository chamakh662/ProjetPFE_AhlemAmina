// src/components/Home/ProductCard.jsx
import React from 'react';

const ProductCard = ({
    produit,
    onComment,
    onFavorite,
    isFavorite = false,
    user
}) => {
    // Extraction des données
    const nom = produit?.nom || 'Produit sans nom';

    // Gestion intelligente de l'image
    const imageUrl = produit?.image
        ? (produit.image.startsWith('http')
            ? produit.image
            : `http://localhost:5000${produit.image.startsWith('/') ? '' : '/'}${produit.image}`)
        : null;

    // Priorité : Marque si elle existe, sinon Origine
    const sousTitre = produit?.marque || produit?.brand || produit?.origine || 'Non spécifié';

    const isConsommateur = user?.role === 'consommateur';

    const handleFavorite = () => {
        if (!user) {
            alert('Vous devez être connecté pour ajouter un favori.');
            return;
        }
        if (!isConsommateur) {
            alert('Seuls les consommateurs peuvent ajouter des favoris.');
            return;
        }
        onFavorite(produit);
    };

    return (
        <div style={styles.card}>
            {/* Image du produit */}
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={nom}
                    style={styles.image}
                    onError={(e) => {
                        console.log("❌ Erreur chargement image pour :", nom);
                        console.log("URL tentée :", imageUrl);
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Pas+d\'image';
                    }}
                />
            ) : (
                <div style={styles.noImage}>📦</div>
            )}
            {/* Nom */}
            <h3 style={styles.name}>{nom}</h3>

            {/* Marque ou Origine */}
            <p style={styles.subtitle}>{sousTitre}</p>

            {/* Actions */}
            <div style={styles.actions}>
                <button
                    style={{
                        ...styles.btnFavorite,
                        backgroundColor: isFavorite ? '#e11d48' : '#ef4444'
                    }}
                    onClick={handleFavorite}
                >
                    {isFavorite ? '❤️ Retirer' : '🤍 Favori'}
                </button>

                <button
                    style={styles.btnComment}
                    onClick={() => onComment(produit)}
                >
                    💬 Avis
                </button>
            </div>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.07)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    image: {
        width: '100%',
        height: '190px',
        objectFit: 'cover',
    },
    noImage: {
        width: '100%',
        height: '190px',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3.5rem',
        color: '#cbd5e1',
    },
    name: {
        fontSize: '1.15rem',
        fontWeight: '700',
        color: '#1f2937',
        margin: '14px 14px 6px 14px',
        lineHeight: 1.3,
    },
    subtitle: {
        fontSize: '0.95rem',
        color: '#6b7280',
        margin: '0 14px 16px 14px',
        fontWeight: '500',
    },
    actions: {
        marginTop: 'auto',
        padding: '12px 14px 16px',
        display: 'flex',
        gap: '10px',
        borderTop: '1px solid #f1f5f9',
    },
    btnFavorite: {
        flex: 1,
        padding: '10px',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: '600',
        fontSize: '0.93rem',
        cursor: 'pointer',
    },
    btnComment: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '0.93rem',
        cursor: 'pointer',
    }
};

export default ProductCard;