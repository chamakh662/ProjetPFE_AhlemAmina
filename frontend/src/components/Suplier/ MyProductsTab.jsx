import React, { useEffect, useState } from 'react';

const MyProductsTab = ({ user }) => {
    const [myProducts, setMyProducts] = useState([]); // initialisé par défaut à un tableau vide

    useEffect(() => {
        if (!user?.id) return;
        const fetchProducts = async () => {
            try {
                const res = await fetch(`/api/produits?createdBy=${encodeURIComponent(user.id)}`);
                if (!res.ok) throw new Error('Erreur lors du chargement des produits');
                const data = await res.json();
                setMyProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setMyProducts([]);
            }
        };
        fetchProducts();
    }, [user?.id]);

    return (
        <div>
            <h2>Mes Produits</h2>
            {myProducts.length === 0 ? (
                <p>Vous n'avez pas encore de produits.</p>
            ) : (
                <div style={styles.productsList}>
                    {myProducts.map((p) => (
                        <div key={p._id} style={styles.productCard}>
                            <div style={styles.productRow}>
                                <div>
                                    <div style={styles.productName}>{p.nom}</div>
                                    <div style={styles.productMeta}>
                                        Code-barre: {p.code_barre || '—'} • Origine: {p.origine || '—'}
                                    </div>
                                </div>
                                <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor:
                                        p.status === 'approved' ? '#d1fae5' :
                                            p.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                    color:
                                        p.status === 'approved' ? '#059669' :
                                            p.status === 'rejected' ? '#dc2626' : '#92400e'
                                }}>
                                    {p.status === 'approved' ? '✅ Accepté' :
                                        p.status === 'rejected' ? '❌ Rejeté' : '⏳ En attente'}
                                </span>
                            </div>
                            {p.description && <p style={styles.productDesc}>{p.description}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    productsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    productCard: { backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' },
    productRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
    productName: { fontSize: '16px', fontWeight: 'bold' },
    productMeta: { color: '#666', fontSize: '13px', marginTop: '4px' },
    productDesc: { marginTop: '10px', color: '#444' },
    statusBadge: { padding: '6px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }
};

export default MyProductsTab;