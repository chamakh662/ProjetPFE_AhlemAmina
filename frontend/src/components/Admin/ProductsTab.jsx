import React, { useState, useEffect } from 'react';

const getStatusStyle = (status) => ({
    approved: { backgroundColor: '#d1fae5', color: '#059669' },
    rejected: { backgroundColor: '#fee2e2', color: '#dc2626' },
    pending: { backgroundColor: '#fef3c7', color: '#92400e' },
}[status] || { backgroundColor: '#fef3c7', color: '#92400e' });

const getStatusLabel = (status) => ({
    approved: '✅ Accepté',
    rejected: '❌ Rejeté',
    pending: '⏳ En attente',
}[status] || '⏳ En attente');

/**
 * Onglet Produits — lecture seule pour l'admin
 * Affiche tous les produits avec fournisseur + agent validateur
 */
const ProductsTab = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/produits');
            const data = await res.json().catch(() => []);
            if (!res.ok) throw new Error(data.message || 'Erreur chargement');
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const filtered = filterStatus === 'all'
        ? products
        : products.filter(p => p.status === filterStatus);

    return (
        <div style={S.wrapper}>
            <div style={S.header}>
                <div>
                    <h2 style={S.title}>📦 Tous les produits</h2>
                    <p style={S.subtitle}>Vue d'ensemble : fournisseur ajouteur et agent validateur.</p>
                </div>
                <div style={S.headerActions}>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={S.select}>
                        <option value="all">Tous les statuts</option>
                        <option value="approved">Acceptés</option>
                        <option value="pending">En attente</option>
                        <option value="rejected">Rejetés</option>
                    </select>
                    <button onClick={fetchProducts} style={S.refreshBtn}>↻ Actualiser</button>
                </div>
            </div>

            {error && <div style={S.errorBox}>{error}</div>}
            {loading && <div style={S.infoBox}>⏳ Chargement…</div>}

            {!loading && filtered.length === 0 && (
                <div style={S.infoBox}>Aucun produit trouvé.</div>
            )}

            {!loading && filtered.length > 0 && (
                <div style={S.tableWrap}>
                    <table style={S.table}>
                        <thead>
                            <tr>
                                {['Produit', 'Statut', 'Fournisseur', 'Agent validateur', 'Date ajout'].map(h => (
                                    <th key={h} style={S.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p._id} style={S.tr}>
                                    <td style={S.td}>
                                        <div style={S.productCell}>
                                            <div style={S.thumb}>
                                                {p.image
                                                    ? <img src={p.image} alt={p.nom} style={S.thumbImg} />
                                                    : <span>📦</span>}
                                            </div>
                                            <div>
                                                <div style={S.productName}>{p.nom}</div>
                                                <div style={S.productMeta}>
                                                    {p.code_barre || '—'} • {p.origine || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={S.td}>
                                        <span style={{ ...S.statusBadge, ...getStatusStyle(p.status) }}>
                                            {getStatusLabel(p.status)}
                                        </span>
                                    </td>
                                    <td style={S.td}>
                                        {p.createdBy
                                            ? `${p.createdBy.prenom || ''} ${p.createdBy.nom || ''}`.trim() || '—'
                                            : '—'}
                                    </td>
                                    <td style={S.td}>
                                        {p.validatedBy
                                            ? `${p.validatedBy.prenom || ''} ${p.validatedBy.nom || ''}`.trim() || '—'
                                            : <span style={S.noAgent}>Non validé</span>}
                                    </td>
                                    <td style={S.td}>
                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const S = {
    wrapper: {},
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    title: { margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' },
    subtitle: { margin: 0, color: '#64748b', fontSize: '0.875rem' },
    headerActions: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
    select: { padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: 'white', color: '#475569', fontSize: '0.875rem', cursor: 'pointer' },
    refreshBtn: { padding: '0.5rem 1.2rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
    infoBox: { padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', color: '#64748b' },
    errorBox: { padding: '1rem 1.25rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.75rem', color: '#991b1b', marginBottom: '1rem' },
    tableWrap: { backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '1rem', fontSize: '0.875rem', color: '#1e293b', verticalAlign: 'middle' },
    productCell: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    thumb: { width: 36, height: 36, borderRadius: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
    thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
    productName: { fontWeight: 700 },
    productMeta: { color: '#64748b', fontSize: '0.8rem' },
    statusBadge: { padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-block' },
    noAgent: { color: '#94a3b8', fontStyle: 'italic' },
};

export default ProductsTab;