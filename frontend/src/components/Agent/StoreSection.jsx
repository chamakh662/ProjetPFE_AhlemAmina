import React from 'react';

const StoreSection = ({
    pointsDeVente,
    newPoint,
    setNewPoint,
    onAddPoint,
    onDeletePoint,
    S
}) => {
    return (
        <div>
            <h3 style={S.sectionTitle}>Ajouter un point de vente</h3>
            <div style={S.pointForm}>
                <input
                    placeholder="Nom du point de vente"
                    value={newPoint.nom}
                    onChange={e => setNewPoint({ ...newPoint, nom: e.target.value })}
                    style={S.input}
                />

                {/* Input simple pour l'adresse (remplace l'Autocomplete temporairement) */}
                <input
                    placeholder="Adresse en Tunisie 📍"
                    value={newPoint.adresse}
                    onChange={e => setNewPoint({ ...newPoint, adresse: e.target.value })}
                    style={S.input}
                />

                <button onClick={onAddPoint} style={S.btnSuccess}>+ Ajouter</button>
            </div>

            <h3 style={{ ...S.sectionTitle, marginTop: 24 }}>Liste des points de vente</h3>

            {pointsDeVente.length === 0 ? (
                <p style={S.empty}>Aucun point de vente enregistré.</p>
            ) : (
                pointsDeVente.map(pv => (
                    <div key={pv._id} style={S.pointCard}>
                        <div>
                            <strong>{pv.nom}</strong>
                            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#666' }}>📍 {pv.adresse}</p>
                            {pv.lat && pv.lng && (
                                <a
                                    href={`https://www.google.com/maps?q=${pv.lat},${pv.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={S.mapsLink}
                                >
                                    🗺️ Voir sur Google Maps
                                </a>
                            )}
                        </div>
                        <button
                            onClick={() => onDeletePoint(pv)}
                            style={S.btnDangerSm}
                        >
                            🗑️
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default StoreSection;