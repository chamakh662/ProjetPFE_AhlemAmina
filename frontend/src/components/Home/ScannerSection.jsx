// src/components/Home/ScannerSection.jsx
import React, { useState } from 'react';

const ScannerSection = ({ barcode, setBarcode, handleBarcodeScan, scannedProduct, scanError }) => {
    const [focused, setFocused] = useState(false);

    // Fonction utilitaire pour résoudre l'URL de l'image (comme dans ProductCard)
    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('data:image')) return img;
        const normalized = img.replace(/\\/g, '/');
        let path = normalized;
        if (!path.startsWith('http') && !path.startsWith('/')) path = `/${path}`;
        return `http://localhost:5000${path}`;
    };

    const imageUrl = getImageUrl(scannedProduct?.image);
    const origin = scannedProduct?.origine || 'Inconnue';
    const marque = scannedProduct?.marque || scannedProduct?.brand || 'Non spécifiée';

    return (
        <section id="scanner" style={styles.section}>
            {/* Décoration de fond moderne */}
            <div style={styles.bgBlobs}>
                <div style={styles.blob1} />
                <div style={styles.blob2} />
            </div>

            <div style={styles.container}>
                {/* Header épuré */}
                <div style={styles.header}>
                    <span style={styles.badge}>DÉCOUVERTE</span>
                    <h2 style={styles.title}>L'Analyseur</h2>
                    <p style={styles.subtitle}>
                        Tapez le code-barre d'un produit pour révéler instantanément sa composition détaillée, son origine et son impact santé.
                    </p>
                </div>

                {/* Le Scanner Principal */}
                <div style={styles.scannerInterface}>
                    <div style={{ ...styles.inputBox, boxShadow: focused ? '0 0 0 4px rgba(22, 163, 74, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <span style={styles.iconScan}>📟</span>
                        <input
                            type="text"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            placeholder="Entrez les 13 chiffres (ex: 3012293734402)"
                            style={styles.input}
                            maxLength={13}
                        />
                        <button
                            onClick={handleBarcodeScan}
                            style={{
                                ...styles.btnAnalyze,
                                opacity: barcode.length >= 8 ? 1 : 0.6,
                                cursor: barcode.length >= 8 ? 'pointer' : 'not-allowed'
                            }}
                            disabled={barcode.length < 8}
                        >
                            Analyser ⚡
                        </button>
                    </div>



                    {/* État : Erreur */}
                    {scanError && (
                        <div style={styles.errorBox}>
                            <span style={styles.errorIcon}>⚠️</span>
                            <div>
                                <h4 style={styles.errorTitle}>Produit Introuvable</h4>
                                <p style={styles.errorText}>Aucun produit correspondant n'a été trouvé dans notre base approuvée. Veuillez vérifier le code tapé.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* État : Résultat de l'Analyse */}
                {scannedProduct && (
                    <div style={{ ...styles.analysisReport, animation: 'fadeInUp 0.5s ease forwards' }}>

                        {/* Section Visuelle */}
                        <div style={styles.reportImageCol}>
                            {imageUrl ? (
                                <img src={imageUrl} alt={scannedProduct.nom} style={styles.productImage} onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Pas+d%27image'; }} />
                            ) : (
                                <div style={styles.noImagePlaceholder}>📷<br />Aucune image</div>
                            )}

                            <div style={styles.healthScoreCard}>
                                <div style={styles.healthScoreRing}>
                                    <span style={styles.healthScoreValue}>{scannedProduct.scoreBio || 0}</span>
                                    <span style={styles.healthScoreLabel}>/100</span>
                                </div>
                                <span style={styles.healthScoreDesc}>Score Santé</span>
                            </div>
                        </div>

                        {/* Section Infos */}
                        <div style={styles.reportInfoCol}>
                            <div style={styles.reportHeader}>
                                <div style={styles.brandTag}>{marque}</div>
                                <h3 style={styles.reportTitle}>{scannedProduct.nom}</h3>
                                <p style={styles.reportOrigin}>📍 Origine : <strong>{origin}</strong></p>
                            </div>

                            <p style={styles.reportDesc}>{scannedProduct.description || "Aucune description détaillée n'est disponible pour ce produit."}</p>

                            <div style={styles.ingredientsSection}>
                                <h4 style={styles.sectionHeading}>🧪 Composition ({scannedProduct.ingredients?.length || 0})</h4>
                                <div style={styles.ingredientsList}>
                                    {scannedProduct.ingredients && scannedProduct.ingredients.length > 0 ? (
                                        scannedProduct.ingredients.map(ing => (
                                            <div key={ing._id} style={{ ...styles.ingredientPill, borderColor: ing.estBio ? '#4ade80' : '#e5e7eb', backgroundColor: ing.estBio ? '#f0fdf4' : '#f9fafb' }}>
                                                {ing.estBio ? '🌱 ' : ''}{ing.nom}
                                            </div>
                                        ))
                                    ) : (
                                        <span style={styles.emptyText}>Aucun ingrédient répertorié.</span>
                                    )}
                                </div>
                            </div>

                            {scannedProduct.pointsDeVente && scannedProduct.pointsDeVente.length > 0 && (
                                <div style={{ ...styles.ingredientsSection, marginTop: '1.5rem' }}>
                                    <h4 style={styles.sectionHeading}>🛒 Disponible chez</h4>
                                    <div style={styles.shopsList}>
                                        {scannedProduct.pointsDeVente.map(pdv => (
                                            <span key={pdv._id} style={styles.shopItem}>🏪 {pdv.nom}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>

            {/* Ajout des animations CSS globales */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </section>
    );
};

const styles = {
    section: {
        position: 'relative',
        padding: '6rem 1.5rem',
        backgroundColor: '#f8fafc', // Gris très très clair, premium
        overflow: 'hidden',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center'
    },
    bgBlobs: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none'
    },
    blob1: {
        position: 'absolute',
        top: '-10%', left: '-5%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%'
    },
    blob2: {
        position: 'absolute',
        bottom: '-10%', right: '-5%',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%'
    },
    container: {
        position: 'relative',
        zIndex: 1,
        maxWidth: '960px',
        margin: '0 auto',
        width: '100%'
    },

    /* Header */
    header: { textAlign: 'center', marginBottom: '3rem' },
    badge: {
        display: 'inline-block',
        padding: '0.4rem 1.2rem',
        backgroundColor: '#1f2937',
        color: '#fff',
        borderRadius: '2rem',
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        fontWeight: '700',
        marginBottom: '1rem',
    },
    title: {
        fontSize: '3rem',
        fontWeight: '800',
        color: '#0f172a',
        margin: '0 0 1rem 0',
        letterSpacing: '-1px'
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#64748b',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: 1.6,
    },

    /* Scanner Interface */
    scannerInterface: {
        maxWidth: '640px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    inputBox: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '0.5rem 0.5rem 0.5rem 1.25rem',
        borderRadius: '100px', // Ovale parfait
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
    },
    iconScan: {
        fontSize: '1.5rem',
        marginRight: '0.75rem',
        opacity: 0.7
    },
    input: {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: '1.1rem',
        color: '#1e293b',
        fontFamily: 'inherit',
        letterSpacing: '0.05em'
    },
    btnAnalyze: {
        backgroundColor: '#16a34a',
        color: 'white',
        border: 'none',
        padding: '0.85rem 1.75rem',
        borderRadius: '100px',
        fontWeight: '700',
        fontSize: '1.05rem',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
        transition: 'all 0.2s',
    },
    hints: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginTop: '0.5rem'
    },
    hintText: {
        fontSize: '0.85rem',
        color: '#94a3b8',
        fontWeight: '500'
    },
    hintShortcut: {
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid #e2e8f0',
        padding: '0.2rem 0.6rem',
        borderRadius: '0.5rem',
        fontSize: '0.8rem',
        color: '#475569',
        cursor: 'pointer',
        fontFamily: 'monospace',
        transition: 'all 0.2s'
    },

    /* Error */
    errorBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#fef2f2',
        borderLeft: '4px solid #ef4444',
        padding: '1.25rem',
        borderRadius: '0.75rem',
        marginTop: '1rem'
    },
    errorIcon: { fontSize: '1.5rem' },
    errorTitle: { margin: '0 0 0.25rem 0', color: '#991b1b', fontSize: '1rem', fontWeight: '700' },
    errorText: { margin: 0, color: '#b91c1c', fontSize: '0.9rem' },

    /* Rapport d'analyse Glassmorphism */
    analysisReport: {
        marginTop: '4rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '3rem',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '1.5rem',
        padding: '3rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)'
    },
    reportImageCol: {
        flex: '1 1 250px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
    },
    productImage: {
        width: '100%',
        maxWidth: '280px',
        aspectRatio: '3/4',
        objectFit: 'cover',
        borderRadius: '1rem',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
        backgroundColor: '#fff'
    },
    noImagePlaceholder: {
        width: '100%',
        maxWidth: '280px',
        aspectRatio: '3/4',
        backgroundColor: '#f1f5f9',
        borderRadius: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '1rem',
        textAlign: 'center',
        border: '2px dashed #cbd5e1'
    },
    healthScoreCard: {
        backgroundColor: '#fff',
        padding: '1.25rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '280px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        border: '1px solid #f1f5f9'
    },
    healthScoreRing: {
        width: '80px', height: '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'conic-gradient(#16a34a 75%, #dcfce7 0)', // Fixé pour le style (pourrait être dynamique)
        border: '4px solid #fff',
        boxShadow: '0 0 0 1px #e2e8f0'
    },
    healthScoreValue: {
        fontSize: '1.75rem', fontWeight: '800', color: '#16a34a', backgroundColor: '#fff',
        width: '64px', height: '64px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    healthScoreLabel: { position: 'absolute', visibility: 'hidden' },
    healthScoreDesc: { fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },

    reportInfoCol: {
        flex: '2 1 400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    reportHeader: { borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' },
    brandTag: {
        fontSize: '0.85rem',
        fontWeight: '700',
        color: '#2563eb',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.5rem'
    },
    reportTitle: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#0f172a',
        margin: '0 0 0.5rem 0',
        lineHeight: 1.1
    },
    reportOrigin: { fontSize: '1rem', color: '#475569', margin: 0 },
    reportDesc: { fontSize: '1.05rem', color: '#334155', lineHeight: 1.6, margin: 0 },

    ingredientsSection: { marginTop: '1rem' },
    sectionHeading: { fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    ingredientsList: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' },
    ingredientPill: {
        padding: '0.6rem 1rem',
        borderRadius: '0.75rem',
        border: '1px solid',
        fontSize: '0.95rem',
        fontWeight: '500',
        color: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
    },
    emptyText: { color: '#94a3b8', fontStyle: 'italic', fontSize: '0.95rem' },

    shopsList: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' },
    shopItem: {
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        color: '#475569',
        fontWeight: '500'
    }
};

export default ScannerSection;