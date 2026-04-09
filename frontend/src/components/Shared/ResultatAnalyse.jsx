import React from 'react';

const ResultatAnalyse = ({ product }) => {
    if (!product) return null;

    // Fonction utilitaire pour résoudre l'URL de l'image
    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('data:image')) return img;
        const normalized = img.replace(/\\/g, '/');
        let path = normalized;
        if (!path.startsWith('http') && !path.startsWith('/')) path = `/${path}`;
        return `http://localhost:5000${path}`;
    };

    const imageUrl = getImageUrl(product.image);
    const origin = product.origine || 'Inconnue';
    const marque = product.marque || product.brand || 'Non spécifiée';

    return (
        <div style={{ ...styles.analysisReport, animation: 'fadeInUp 0.5s ease forwards' }}>
            {/* Section Visuelle */}
            <div style={styles.reportImageCol}>
                {imageUrl ? (
                    <img src={imageUrl} alt={product.nom} style={styles.productImage} onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Pas+d%27image'; }} />
                ) : (
                    <div style={styles.noImagePlaceholder}>📷<br />Aucune image</div>
                )}

                <div style={styles.healthScoreCard}>
                    <div style={styles.healthScoreRing}>
                        <span style={styles.healthScoreValue}>{product.scoreBio || 0}</span>
                        <span style={styles.healthScoreLabel}>/100</span>
                    </div>
                    <span style={styles.healthScoreDesc}>Score Santé</span>
                </div>
            </div>

            {/* Section Infos */}
            <div style={styles.reportInfoCol}>
                <div style={styles.reportHeader}>
                    <div style={styles.brandTag}>{marque}</div>
                    <h3 style={styles.reportTitle}>{product.nom}</h3>
                    <p style={styles.reportOrigin}>📍 Origine : <strong>{origin}</strong></p>
                </div>

                <p style={styles.reportDesc}>{product.description || "Aucune description détaillée n'est disponible."}</p>

                <div style={styles.ingredientsSection}>
                    <h4 style={styles.sectionHeading}>🧪 Composition</h4>
                    <div style={styles.ingredientsList}>
                        {product.ingredients && product.ingredients.length > 0 ? (
                            product.ingredients.map((ing, idx) => (
                                <div key={ing._id || idx} style={{ ...styles.ingredientPill, borderColor: ing.estBio ? '#4ade80' : '#e5e7eb', backgroundColor: ing.estBio ? '#f0fdf4' : '#f9fafb' }}>
                                    {ing.estBio ? '🌱 ' : ''}{ing.nom}
                                </div>
                            ))
                        ) : (
                            <span style={styles.emptyText}>Aucun ingrédient répertorié.</span>
                        )}
                    </div>
                </div>
            </div>
            {/* Animation CSS requise pour le fade in */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

const styles = {
    analysisReport: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '1.5rem',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
        width: '100%'
    },
    reportImageCol: { flex: '1 1 180px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
    productImage: { width: '100%', maxWidth: '200px', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', backgroundColor: '#fff' },
    noImagePlaceholder: { width: '100%', maxWidth: '200px', aspectRatio: '3/4', backgroundColor: '#f1f5f9', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1rem', textAlign: 'center', border: '2px dashed #cbd5e1' },
    healthScoreCard: { backgroundColor: '#fff', padding: '1rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%', maxWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: '1px solid #f1f5f9' },
    healthScoreRing: { width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'conic-gradient(#16a34a 75%, #dcfce7 0)', border: '3px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' },
    healthScoreValue: { fontSize: '1.25rem', fontWeight: '800', color: '#16a34a', backgroundColor: '#fff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    healthScoreLabel: { position: 'absolute', visibility: 'hidden' },
    healthScoreDesc: { fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },

    reportInfoCol: { flex: '2 1 250px', display: 'flex', flexDirection: 'column', gap: '1rem' },
    reportHeader: { borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' },
    brandTag: { fontSize: '0.8rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' },
    reportTitle: { fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: 1.1 },
    reportOrigin: { fontSize: '0.9rem', color: '#475569', margin: 0 },
    reportDesc: { fontSize: '0.95rem', color: '#334155', lineHeight: 1.5, margin: 0 },

    ingredientsSection: { marginTop: '0.5rem' },
    sectionHeading: { fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    ingredientsList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
    ingredientPill: { padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid', fontSize: '0.85rem', fontWeight: '500', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.25rem' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' },
};

export default ResultatAnalyse;
