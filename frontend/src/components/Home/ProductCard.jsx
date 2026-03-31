// src/components/ProductCard.jsx
import React from 'react';

const ProductCard = ({ produit, onComment, onFavorite }) => {
    return (
        <div
            style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 16,
                margin: 10,
                width: 250,
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
        >
            {/* Image du produit */}
            {produit.image && (
                <img
                    src={produit.image}
                    alt={produit.nom}
                    style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 4 }}
                />
            )}

            {/* Nom et description */}
            <h3 style={{ margin: '10px 0 5px 0' }}>{produit.nom}</h3>
            <p style={{ fontSize: 14, color: '#555' }}>{produit.description}</p>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <button
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#ff6b6b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                    }}
                    onClick={() => onFavorite(produit)}
                >
                    ❤️ Favoris
                </button>

                <button
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#4dabf7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                    }}
                    onClick={() => onComment(produit)}
                >
                    💬 Avis
                </button>
            </div>
        </div>
    );
};

export default ProductCard;