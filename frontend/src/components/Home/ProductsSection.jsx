// src/components/ProductsSection.jsx
import React from 'react';
import ProductCard from './ProductCard';

const ProductsSection = ({
    displayProducts = [],
    searchQuery = '',
    isFavorite = () => false,
    handleAddFavorite = () => { },
    handleOpenComments = () => { },
    getAverageRating = () => 0,
    getProductComments = () => [],
    getScoreColor = () => '#000',
    getRiskColor = () => '#000',
    setSearchQuery = () => { }
}) => {
    // Sécurisation de searchQuery pour éviter l'erreur .trim()
    const safeSearchQuery = searchQuery ? searchQuery.toString() : '';

    return (
        <section id="products-section" style={styles.section}>
            <div style={styles.container}>
                <h2 style={styles.sectionTitle}>
                    {safeSearchQuery.trim() ? '🔍 Résultats' : '🛒 Produits Populaires'}
                </h2>

                {displayProducts.length === 0 ? (
                    <div style={styles.noResults}>
                        <span style={{ fontSize: '4rem' }}>🔍</span>
                        <h3>Aucun produit trouvé</h3>
                        <button onClick={() => setSearchQuery('')} style={styles.btnGreen}>
                            Voir tous les produits
                        </button>
                    </div>
                ) : (
                    <div style={styles.productsGrid}>
                        {displayProducts.map((produit) => (
                            <ProductCard
                                key={produit.id_produit}
                                produit={produit}
                                onFavorite={() => handleAddFavorite(produit)}
                                onComment={() => handleOpenComments(produit)}
                                isFavorite={isFavorite(produit.id_produit)}
                                averageRating={getAverageRating(produit.id_produit)}
                                commentCount={getProductComments(produit.id_produit).length}
                                getScoreColor={getScoreColor}
                                getRiskColor={getRiskColor}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = {
    section: { padding: '4rem 1.5rem', backgroundColor: '#fff' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' },
    sectionTitle: { fontSize: '2rem', fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: '2.5rem' },
    productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' },
    noResults: { textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '1rem', border: '2px dashed #e5e7eb' },
    btnGreen: { padding: '0.75rem 1.5rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', marginTop: '1rem' },
};

export default ProductsSection;