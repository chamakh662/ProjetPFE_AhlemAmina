// src/components/SearchSection.jsx
import React from 'react';

const SearchSection = ({ searchQuery, setSearchQuery, displayProducts, handleSearch }) => (
    <section id="search" style={styles.section}>
        <div style={styles.container}>
            <h2 style={styles.sectionTitle}>Rechercher un produit</h2>
            <form onSubmit={handleSearch} style={styles.searchBox}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nom du produit (ex: Lait, Pommes, Pain...)"
                    style={styles.searchInput}
                />
                <button type="submit" style={styles.searchBtn}>🔍 Rechercher</button>
            </form>
            {searchQuery.trim() && (
                <div style={styles.searchMeta}>
                    <span style={{ color: displayProducts.length ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                        {displayProducts.length
                            ? `✅ ${displayProducts.length} produit(s) trouvé(s)`
                            : '❌ Aucun produit trouvé'}
                    </span>
                    <button onClick={() => setSearchQuery('')} style={styles.clearBtn}>✕ Effacer</button>
                </div>
            )}
        </div>
    </section>
);

const styles = {
    section: { padding: '4rem 1.5rem', backgroundColor: '#fff' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' },
    sectionTitle: { fontSize: '2rem', fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: '2.5rem' },
    searchBox: {
        maxWidth: '680px',
        margin: '0 auto',
        display: 'flex',
        gap: '0.75rem',
        padding: '0.5rem',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
    },
    searchInput: { flex: 1, padding: '0.875rem 1rem', border: 'none', outline: 'none', fontSize: '1rem', borderRadius: '0.5rem' },
    searchBtn: { padding: '0.875rem 1.75rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' },
    searchMeta: { maxWidth: '680px', margin: '0.75rem auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    clearBtn: { padding: '0.35rem 0.7rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem' },
};

export default SearchSection;