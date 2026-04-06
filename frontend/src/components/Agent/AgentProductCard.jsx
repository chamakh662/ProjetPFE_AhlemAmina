// src/components/Agent/ProductCard.jsx
import React from 'react';

const ProductCard = ({
    product,
    isEditing = false,
    children,
    onEdit,
    onDelete,
    onAccept,
    onRefuse,
    S
}) => {
    const isPending = !!onAccept && !!onRefuse;

    // Fonction MapsLink intégrée
    const MapsLink = ({ localisation }) => {
        if (!localisation?.lat || !localisation?.lng) return null;
        const url = `https://www.google.com/maps?q=${localisation.lat},${localisation.lng}`;
        return (
            <a href={url} target="_blank" rel="noreferrer" style={S.mapsLink}>
                🗺️ Voir sur Google Maps
            </a>
        );
    };

    return (
        <div style={{
            ...S.card,
            ...(isPending && { borderLeft: '4px solid #FF9800' })
        }}>
            {isEditing ? (
                children
            ) : (
                <div style={S.cardRow}>
                    {product.image && (
                        <img src={product.image} alt={product.nom} style={S.productImg} />
                    )}

                    <div style={{ flex: 1 }}>
                        <div style={S.cardHeader}>
                            <h3 style={S.cardTitle}>{product.nom}</h3>
                            {product.origine && <span style={S.badge}>{product.origine}</span>}
                            {isPending && (
                                <span style={{ ...S.badge, backgroundColor: '#FFF3E0', color: '#E65100' }}>
                                    En attente
                                </span>
                            )}
                        </div>

                        <p style={S.cardDesc}>{product.description}</p>
                        {product.code_barre && <p style={S.meta}>🔖 {product.code_barre}</p>}

                        {product.ingredients && (
                            <p style={S.meta}>
                                🧪 {Array.isArray(product.ingredients)
                                    ? product.ingredients.map(i => typeof i === 'object' ? (i.nom || i) : i).filter(Boolean).join(', ')
                                    : product.ingredients}
                            </p>
                        )}

                        {product.pointsDeVente?.length > 0 && (
                            <p style={S.meta}>
                                📍 {product.pointsDeVente.map(pv =>
                                    typeof pv === 'object' ? (pv.nom || pv.adresse || '') : pv
                                ).filter(Boolean).join(', ')}
                            </p>
                        )}

                        <MapsLink localisation={product.localisation} />

                        {isPending && (
                            <p style={{ ...S.meta, color: '#999' }}>
                                Soumis par : {product.createdByName || product.createdBy?.nom || 'Fournisseur'}
                            </p>
                        )}
                    </div>

                    <div style={S.cardActions}>
                        {isPending ? (
                            <>
                                <button onClick={() => onAccept(product)} style={S.btnSuccess}>✅ Accepter</button>
                                <button onClick={() => onRefuse(product)} style={S.btnDanger}>❌ Refuser</button>
                            </>
                        ) : (
                            <>
                                <button onClick={onEdit} style={S.btnEdit}>✏️ Modifier</button>
                                <button onClick={onDelete} style={S.btnDanger}>🗑️ Supprimer</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCard;