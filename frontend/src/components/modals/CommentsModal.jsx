// src/components/CommentsModal.jsx
import React, { useState } from 'react';
import ProductCard from '../Home/ProductCard';

const CommentsModal = ({ product, comments, user, onClose, onAddComment, onEditComment, onDeleteComment }) => {
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);

    const renderStars = (rating, interactive = false, onRate = null) => {
        return (
            <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onClick={() => interactive && onRate && onRate(star)}
                        style={{ cursor: interactive ? 'pointer' : 'default', color: star <= rating ? '#fbbf24' : '#d1d5db' }}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const productComments = comments.filter(c => c.id_produit === product.id_produit);

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2>💬 Commentaires - {product.nom}</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Formulaire ajout */}
                {user && (
                    <div style={styles.addForm}>
                        <h4>Ajouter un commentaire</h4>
                        <div>Votre note: {renderStars(newRating, true, setNewRating)}</div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Votre commentaire..."
                            rows={3}
                            style={{ width: '100%', marginTop: 5 }}
                        />
                        <button
                            style={styles.submitBtn}
                            onClick={() => { onAddComment(product, newComment, newRating); setNewComment(''); setNewRating(5); }}
                        >
                            Publier
                        </button>
                    </div>
                )}

                {/* Liste des commentaires */}
                <div style={{ marginTop: 20 }}>
                    {productComments.length === 0 ? (
                        <p>Aucun commentaire pour le moment.</p>
                    ) : (
                        productComments.map((c) => (
                            <div key={c.id} style={styles.commentCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>{c.nom_utilisateur}</strong>
                                    <span>{renderStars(c.note)}</span>
                                </div>
                                <p>{c.texte}</p>
                                {user && (user.id === c.id_utilisateur || user.role === 'administrateur') && (
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <button onClick={() => onEditComment(c)}>✏️ Modifier</button>
                                        <button onClick={() => onDeleteComment(c.id)}>🗑️ Supprimer</button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
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
    modal: { backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '90%', maxWidth: 600, maxHeight: '80%', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    closeBtn: { border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' },
    addForm: { marginBottom: 20 },
    submitBtn: { marginTop: 5, padding: '6px 12px', borderRadius: 4, border: 'none', backgroundColor: '#4dabf7', color: '#fff', cursor: 'pointer' },
    commentCard: { border: '1px solid #ccc', borderRadius: 4, padding: 8, marginBottom: 8 }
};

export default CommentsModal;