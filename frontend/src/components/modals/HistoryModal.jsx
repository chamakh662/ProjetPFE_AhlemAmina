// src/components/HistoryModal.jsx
import React from 'react';

const HistoryModal = ({ history, onClose, onRemoveItem, onClearAll, onUseItem }) => {
    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2>📋 Mon Historique</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {history.length === 0 ? (
                    <p>Aucune recherche pour le moment.</p>
                ) : (
                    <>
                        <button style={styles.clearBtn} onClick={onClearAll}>🗑️ Tout supprimer</button>
                        <div style={styles.list}>
                            {history.map((item) => (
                                <div key={item.id} style={styles.item}>
                                    <div>
                                        <div>{item.query}</div>
                                        <small>{new Date(item.date).toLocaleString('fr-FR')}</small>
                                    </div>
                                    <div>
                                        <button style={styles.useBtn} onClick={() => onUseItem(item)}>🔍</button>
                                        <button style={styles.deleteBtn} onClick={() => onRemoveItem(item.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '90%', maxWidth: 500, maxHeight: '80%', overflowY: 'auto'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    closeBtn: { border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' },
    clearBtn: { marginBottom: 10, padding: '6px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
    list: { display: 'flex', flexDirection: 'column', gap: 10 },
    item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, border: '1px solid #ccc', borderRadius: 4 },
    useBtn: { marginRight: 5, backgroundColor: '#4dabf7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '4px 6px' },
    deleteBtn: { backgroundColor: '#ff6b6b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '4px 6px' }
};

export default HistoryModal;