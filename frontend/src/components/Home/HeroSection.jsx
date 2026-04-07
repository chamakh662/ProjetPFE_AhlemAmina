// src/components/Home/HeroSection.jsx
import React from 'react';

const HeroSection = ({ searchQuery, setSearchQuery, handleSearch, displayProducts }) => (
    <section style={styles.hero}>
        {/* Overlay sombre pour lisibilité */}
        <div style={styles.overlay} />

        <div style={styles.heroContent}>
            {/* ── Barre de recherche EN HAUT ── */}
            <div style={styles.searchWrapper}>
                <form onSubmit={handleSearch} style={styles.searchBox}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Nom du produit (ex: Lait, Pommes, Pain...)"
                        style={styles.searchInput}
                    />
                    {searchQuery.trim() && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            style={styles.clearBtn}
                        >
                            ✕
                        </button>
                    )}
                    <button type="submit" style={styles.searchBtn}>
                        Rechercher
                    </button>
                </form>

                {/* Feedback résultats */}
                {searchQuery.trim() && (
                    <div style={styles.searchMeta}>
                        <span style={{ color: displayProducts.length ? '#86efac' : '#fca5a5', fontWeight: 600 }}>
                            {displayProducts.length
                                ? `✅ ${displayProducts.length} produit(s) trouvé(s)`
                                : '❌ Aucun produit trouvé'}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Titre & sous-titre ── */}
            <h1 style={styles.heroTitle}>
                Analysez vos produits{' '}
                <span style={styles.highlight}>en un scan</span>
            </h1>
            <p style={styles.heroSubtitle}>
                Découvrez la composition de vos aliments et faites des choix éclairés
                pour votre santé et l'environnement.
            </p>

            <div style={styles.heroButtons}>
                <button
                    style={styles.btnPrimary}
                    onClick={() =>
                        document.getElementById('scanner')?.scrollIntoView({ behavior: 'smooth' })
                    }
                >
                    Commencer
                </button>
            </div>
        </div>
    </section>
);

const styles = {
    hero: {
        position: 'relative',
        height: '85vh',
        backgroundImage: "url('/back.jpg')",
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
    },
    overlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    heroContent: {
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: '800px',
        padding: '0 1.5rem',
        gap: '1.25rem',
    },

    /* ── Search bar ── */
    searchWrapper: {
        width: '100%',
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'white',
        borderRadius: '3rem',
        padding: '0.5rem 0.5rem 0.5rem 1.25rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        width: '100%',
    },
    searchIcon: {
        fontSize: '1.1rem',
        flexShrink: 0,
    },
    searchInput: {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: '1rem',
        color: '#1f2937',
        backgroundColor: 'transparent',
        minWidth: 0,
    },
    clearBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#9ca3af',
        fontSize: '1rem',
        padding: '0 0.25rem',
        flexShrink: 0,
    },
    searchBtn: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#16a34a',
        color: 'white',
        border: 'none',
        borderRadius: '2rem',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.95rem',
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    searchMeta: {
        marginTop: '0.6rem',
        textAlign: 'center',
        fontSize: '0.9rem',
    },

    /* ── Texte ── */
    heroTitle: {
        fontSize: '2.75rem',
        fontWeight: '800',
        color: 'white',
        lineHeight: 1.2,
        margin: 0,
    },
    highlight: { color: '#4ade80' },
    heroSubtitle: {
        fontSize: '1.1rem',
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 1.7,
        margin: 0,
    },
    heroButtons: { display: 'flex', gap: '1rem' },
    btnPrimary: {
        padding: '0.875rem 2rem',
        borderRadius: '0.5rem',
        border: 'none',
        backgroundColor: '#16a34a',
        color: 'white',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '1rem',
    },
};

export default HeroSection;