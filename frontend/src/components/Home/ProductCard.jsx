// src/components/Home/ProductCard.jsx
import React from 'react';

const ProductCard = ({
    produit,
    onComment,
    onFavorite,
    isFavorite,
    averageRating,
    commentCount,
    localisation,
    user
}) => {
    // ✅ Utilise _id (champ réel MongoDB)
    const productId = produit?._id || produit?.id_produit || produit?.id;

    const mapsUrl = localisation?.lat && localisation?.lng
        ? `https://www.google.com/maps?q=${localisation.lat},${localisation.lng}`
        : null;

    const isConsommateur = user?.role === 'consommateur';

    const handleFavorite = () => {
        console.log('=== FAVORIS CLIQUÉ ===');
        console.log('produit:', produit);
        console.log('productId:', productId);
        console.log('user:', user);

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
            {produit.image && (
                <img
                    src={produit.image}
                    alt={produit.nom}
                    style={styles.image}
                />
            )}

            <h3 style={styles.name}>{produit.nom}</h3>
            <p style={styles.description}>{produit.description}</p>

            {averageRating > 0 && (
                <div style={styles.rating}>
                    {'★'.repeat(Math.round(averageRating))}
                    {'☆'.repeat(5 - Math.round(averageRating))}
                    <span style={{ marginLeft: 4, fontSize: 12, color: '#888' }}>
                        ({commentCount} avis)
                    </span>
                </div>
            )}

            {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noreferrer" style={styles.mapsLink}>
                    🗺️ Voir le point de vente
                </a>
            )}

            <div style={styles.actions}>
                <button
                    style={{
                        ...styles.btnFavorite,
                        backgroundColor: isFavorite ? '#e11d48' : '#ff6b6b',
                        opacity: (!user || !isConsommateur) ? 0.6 : 1,
                    }}
                    onClick={handleFavorite}
                    title={
                        !user ? 'Connectez-vous pour ajouter aux favoris'
                        : !isConsommateur ? 'Réservé aux consommateurs'
                        : isFavorite ? 'Déjà dans vos favoris' : 'Ajouter aux favoris'
                    }
                >
                    {isFavorite ? '❤️ Favori' : '🤍 Favoris'}
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
        border: '1px solid #e5e7eb', borderRadius: 10, padding: 16,
        backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', gap: 8
    },
    image: { width: '100%', height: 150, objectFit: 'cover', borderRadius: 6 },
    name: { margin: '8px 0 4px 0', fontSize: '1rem', fontWeight: 700, color: '#1f2937' },
    description: { fontSize: 13, color: '#6b7280', margin: 0 },
    rating: { color: '#fbbf24', fontSize: 16 },
    mapsLink: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        color: '#1976D2', fontSize: 13, fontWeight: 600, textDecoration: 'none'
    },
    actions: { display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 8 },
    btnFavorite: {
        flex: 1, padding: '7px 12px', color: '#fff',
        border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13
    },
    btnComment: {
        flex: 1, padding: '7px 12px', backgroundColor: '#4dabf7',
        color: '#fff', border: 'none', borderRadius: 6,
        cursor: 'pointer', fontWeight: 600, fontSize: 13
    }
};

export default ProductCard;
