// src/components/ScannerSection.jsx
import React from 'react';

const ScannerSection = ({ barcode, setBarcode, handleBarcodeScan }) => (
    <section style={styles.sectionAlt}>
        <div style={styles.container}>
            <h2 style={styles.sectionTitle}>Scanner un produit</h2>
            <div style={styles.scannerGrid}>
                <div style={styles.scannerCard}>
                    <div style={styles.scannerIcon}>📱</div>
                    <h3>Code-barre</h3>
                    <p style={styles.scannerText}>Entrez ou scannez le code-barre</p>
                    <input
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="3012345678901"
                        style={styles.scannerInput}
                    />
                    <button onClick={handleBarcodeScan} style={styles.btnBlue}>Scanner</button>
                </div>
                <div style={styles.scannerCard}>
                    <div style={styles.scannerIcon}>📷</div>
                    <h3>Photo Ingrédients</h3>
                    <p style={styles.scannerText}>Photographiez la liste d'ingrédients</p>
                    <input
                        type="file" accept="image/*" style={{ display: 'none' }}
                        id="imgUpload"
                        onChange={(e) => e.target.files[0] && alert(`Image : ${e.target.files[0].name}`)}
                    />
                    <button onClick={() => document.getElementById('imgUpload').click()} style={styles.btnPurple}>
                        📸 Prendre une photo
                    </button>
                </div>
            </div>
        </div>
    </section>
);

const styles = {
    sectionAlt: { padding: '4rem 1.5rem', backgroundColor: '#f9fafb' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' },
    sectionTitle: { fontSize: '2rem', fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: '2.5rem' },
    scannerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '800px', margin: '0 auto' },
    scannerCard: { backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' },
    scannerIcon: { fontSize: '3.5rem', marginBottom: '0.75rem' },
    scannerText: { color: '#6b7280', marginBottom: '1.25rem' },
    scannerInput: { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', marginBottom: '0.875rem', fontSize: '1rem' },
    btnBlue: { width: '100%', padding: '0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' },
    btnPurple: { width: '100%', padding: '0.75rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' },
};

export default ScannerSection;