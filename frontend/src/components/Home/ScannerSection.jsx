// src/components/Home/ScannerSection.jsx
import React, { useState } from 'react';

const ScannerSection = ({ barcode, setBarcode, handleBarcodeScan }) => {
    const [focused, setFocused] = useState(false);

    return (
        <section id="scanner" style={styles.section}>
            {/* Décoration background */}
            <div style={styles.bgDecor1} />
            <div style={styles.bgDecor2} />

            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <span style={styles.badge}>🔬 Analyse rapide</span>
                    <h2 style={styles.title}>Scanner un produit</h2>
                    <p style={styles.subtitle}>
                        Entrez le code-barre d'un produit pour obtenir instantanément
                        sa composition et son score santé.
                    </p>
                </div>

                {/* Card principale */}
                <div style={styles.card}>
                    {/* Côté gauche — illustration */}
                    <div style={styles.cardLeft}>
                        <div style={styles.iconWrapper}>
                            <span style={styles.iconMain}>📱</span>
                            <div style={styles.iconRing1} />
                            <div style={styles.iconRing2} />
                        </div>
                        <h3 style={styles.cardLeftTitle}>Scan Code-barre</h3>
                        <p style={styles.cardLeftText}>
                            Identifiez n'importe quel produit alimentaire en quelques secondes.
                        </p>
                        <div style={styles.featureList}>
                            {['✅ Base de données mondiale', '✅ Résultat instantané', '✅ Score Nutri-Score inclus'].map((f, i) => (
                                <span key={i} style={styles.featureItem}>{f}</span>
                            ))}
                        </div>
                    </div>

                    {/* Séparateur */}
                    <div style={styles.divider} />

                    {/* Côté droit — formulaire */}
                    <div style={styles.cardRight}>
                        <label style={styles.label}>Code-barre du produit</label>
                        <div style={{ ...styles.inputWrapper, ...(focused ? styles.inputWrapperFocused : {}) }}>
                            <span style={styles.inputIcon}>🔢</span>
                            <input
                                type="text"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                placeholder="ex : 3012345678901"
                                style={styles.input}
                                maxLength={13}
                            />
                            {barcode && (
                                <button
                                    type="button"
                                    onClick={() => setBarcode('')}
                                    style={styles.clearBtn}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <p style={styles.hint}>13 chiffres — visible sous le code-barre du produit</p>

                        <button
                            onClick={handleBarcodeScan}
                            style={{
                                ...styles.btnScan,
                                ...(barcode.length >= 8 ? styles.btnScanActive : styles.btnScanDisabled),
                            }}
                            disabled={barcode.length < 8}
                        >
                            🔍 Analyser le produit
                        </button>

                        <div style={styles.exampleRow}>
                            <span style={styles.exampleLabel}>Essayer :</span>
                            {['3017620422003', '5449000000996', '3155250349793'].map((code) => (
                                <button
                                    key={code}
                                    onClick={() => setBarcode(code)}
                                    style={styles.exampleBtn}
                                >
                                    {code}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const styles = {
    section: {
        position: 'relative',
        padding: '5rem 1.5rem',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    container: {
        position: 'relative',
        maxWidth: '960px',
        margin: '0 auto',
    },

    /* Header */
    header: { textAlign: 'center', marginBottom: '3rem' },
    badge: {
        display: 'inline-block',
        padding: '0.35rem 1rem',
        backgroundColor: '#dcfce7',
        color: '#16a34a',
        borderRadius: '2rem',
        fontSize: '0.85rem',
        fontWeight: '600',
        marginBottom: '1rem',
    },
    title: {
        fontSize: '2.25rem',
        fontWeight: '800',
        color: '#1f2937',
        margin: '0.5rem 0',
    },
    subtitle: {
        fontSize: '1rem',
        color: '#6b7280',
        maxWidth: '520px',
        margin: '0 auto',
        lineHeight: 1.7,
    },

    /* Card */
    card: {
        display: 'flex',
        flexWrap: 'wrap',
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
    },

    /* Gauche */
    cardLeft: {
        flex: '1 1 280px',
        padding: '2.5rem',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    iconWrapper: {
        position: 'relative',
        width: '80px',
        height: '80px',
        marginBottom: '0.5rem',
    },
    iconMain: { fontSize: '3rem', position: 'relative', zIndex: 1 },
    iconRing1: {
        position: 'absolute',
        inset: '-8px',
        borderRadius: '50%',
        border: '2px solid rgba(22,163,74,0.2)',
    },
    iconRing2: {
        position: 'absolute',
        inset: '-18px',
        borderRadius: '50%',
        border: '2px solid rgba(22,163,74,0.1)',
    },
    cardLeftTitle: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#1f2937',
        margin: 0,
    },
    cardLeftText: {
        fontSize: '0.95rem',
        color: '#6b7280',
        lineHeight: 1.6,
        margin: 0,
    },
    featureList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    featureItem: {
        fontSize: '0.88rem',
        color: '#374151',
        fontWeight: '500',
    },

    /* Séparateur */
    divider: {
        width: '1px',
        backgroundColor: '#e5e7eb',
        margin: '1.5rem 0',
    },

    /* Droite */
    cardRight: {
        flex: '1 1 320px',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#374151',
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: '2px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '0.6rem 0.75rem',
        transition: 'border-color 0.2s',
        backgroundColor: '#fafafa',
    },
    inputWrapperFocused: {
        borderColor: '#16a34a',
        backgroundColor: 'white',
    },
    inputIcon: { fontSize: '1rem', flexShrink: 0 },
    input: {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: '1rem',
        color: '#1f2937',
        backgroundColor: 'transparent',
        letterSpacing: '0.05em',
    },
    clearBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#9ca3af',
        fontSize: '0.9rem',
        padding: '0',
        flexShrink: 0,
    },
    hint: {
        fontSize: '0.8rem',
        color: '#9ca3af',
        margin: '-0.5rem 0 0',
    },
    btnScan: {
        width: '100%',
        padding: '0.9rem',
        border: 'none',
        borderRadius: '0.75rem',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '1rem',
        transition: 'all 0.2s',
    },
    btnScanActive: {
        backgroundColor: '#16a34a',
        color: 'white',
        boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
    },
    btnScanDisabled: {
        backgroundColor: '#e5e7eb',
        color: '#9ca3af',
        cursor: 'not-allowed',
    },

    /* Exemples */
    exampleRow: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.4rem',
        marginTop: '0.25rem',
    },
    exampleLabel: {
        fontSize: '0.8rem',
        color: '#6b7280',
        fontWeight: '500',
    },
    exampleBtn: {
        padding: '0.25rem 0.6rem',
        fontSize: '0.75rem',
        backgroundColor: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        color: '#374151',
        fontFamily: 'monospace',
    },
};

export default ScannerSection;