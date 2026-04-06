// src/components/modals/CommentsModal.jsx
import React, { useState } from 'react';

const CommentsModal = ({ product, comments, user, onClose, onAddComment, onEditComment, onDeleteComment }) => {
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [editRating, setEditRating] = useState(5);

    // ✅ Logs pour déboguer
    console.log('=== CommentsModal rendu ===');
    console.log('product reçu:', product);
    console.log('user reçu:', user);
    console.log('comments reçus:', comments);

    const renderStars = (rating, interactive = false, onRate = null) => {
        return (
            <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onClick={() => interactive && onRate && onRate(star)}
                        style={{
                            cursor: interactive ? 'pointer' : 'default',
                            color: star <= rating ? '#fbbf24' : '#d1d5db',
                            fontSize: 22
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    // ✅ Filtre robuste : compare les deux côtés en string
    const productId = product?.id_produit || product?._id || product?.id;
    const productComments = comments.filter(c => {
        const cProdId = c.id_produit || c.produit;
        return String(cProdId) === String(productId);
    });

    const handleAddComment = () => {
        // ✅ Logs de débogage
        console.log('=== PUBLIER CLIQUÉ ===');
        console.log('product:', product);
        console.log('productId:', productId);
        console.log('texte:', newComment);
        console.log('note:', newRating);
        console.log('user:', user);
        console.log('onAddComment:', onAddComment);

        if (!newComment || !newComment.trim()) {
            console.error('Commentaire vide !');
            return;
        }

        if (!product) {
            console.error('Produit manquant !');
            return;
        }

        onAddComment(product, newComment.trim(), newRating);
        setNewComment('');
        setNewRating(5);
    };

    const handleStartEdit = (c) => {
        setEditingComment(c.id);
        setEditText(c.texte);
        setEditRating(c.note);
    };

    const handleSaveEdit = (c) => {
        onEditComment({ ...c, texte: editText, note: editRating });
        setEditingComment(null);
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={{ margin: 0 }}>💬 Commentaires — {product?.nom || 'Produit'}</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Formulaire ajout commentaire */}
                {user ? (
                    <div style={styles.addForm}>
                        <h4 style={{ marginBottom: 8 }}>Ajouter un commentaire</h4>
                        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>Votre note :</span>
                            {renderStars(newRating, true, setNewRating)}
                        </div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Écrivez votre commentaire..."
                            rows={3}
                            style={styles.textarea}
                        />
                        <button
                            style={{
                                ...styles.submitBtn,
                                opacity: !newComment.trim() ? 0.5 : 1,
                                cursor: !newComment.trim() ? 'not-allowed' : 'pointer'
                            }}
                            onClick={handleAddComment}
                        >
                            Publier
                        </button>
                    </div>
                ) : (
                    <p style={{ color: '#888', fontStyle: 'italic' }}>
                        Connectez-vous pour laisser un commentaire.
                    </p>
                )}

                {/* Liste des commentaires */}
                <div style={{ marginTop: 20 }}>
                    <h4 style={{ marginBottom: 10 }}>
                        {productComments.length} commentaire{productComments.length !== 1 ? 's' : ''}
                    </h4>

                    {productComments.length === 0 ? (
                        <p style={{ color: '#888' }}>Aucun commentaire pour le moment. Soyez le premier !</p>
                    ) : (
                        productComments.map((c) => (
                            <div key={c.id || c._id} style={styles.commentCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong>{c.nom_utilisateur || 'Anonyme'}</strong>
                                    {renderStars(c.note)}
                                </div>

                                {editingComment === c.id ? (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span>Note :</span>
                                            {renderStars(editRating, true, setEditRating)}
                                        </div>
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            rows={3}
                                            style={styles.textarea}
                                        />
                                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                            <button style={styles.submitBtn} onClick={() => handleSaveEdit(c)}>
                                                ✅ Enregistrer
                                            </button>
                                            <button style={styles.cancelBtn} onClick={() => setEditingComment(null)}>
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ margin: '6px 0' }}>{c.texte}</p>
                                )}

                                {user && (String(user.id) === String(c.id_utilisateur) || user.role === 'administrateur') && editingComment !== c.id && (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                        <button style={styles.actionBtn} onClick={() => handleStartEdit(c)}>
                                            ✏️ Modifier
                                        </button>
                                        <button style={{ ...styles.actionBtn, color: '#ef4444' }} onClick={() => onDeleteComment(c.id)}>
                                            🗑️ Supprimer
                                        </button>
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
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000
    },
    modal: {
        backgroundColor: '#fff', padding: 24, borderRadius: 10,
        width: '90%', maxWidth: 620, maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    },
    header: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20
    },
    closeBtn: {
        border: 'none', background: 'none', fontSize: 22,
        cursor: 'pointer', color: '#666'
    },
    addForm: {
        backgroundColor: '#f9fafb', borderRadius: 8,
        padding: 16, marginBottom: 10
    },
    textarea: {
        width: '100%', padding: 8, borderRadius: 6,
        border: '1px solid #d1d5db', fontSize: 14,
        resize: 'vertical', boxSizing: 'border-box'
    },
    submitBtn: {
        marginTop: 8, padding: '8px 16px', borderRadius: 6,
        border: 'none', backgroundColor: '#4dabf7',
        color: '#fff', fontWeight: 600
    },
    cancelBtn: {
        marginTop: 8, padding: '8px 16px', borderRadius: 6,
        border: '1px solid #d1d5db', backgroundColor: '#fff',
        cursor: 'pointer'
    },
    commentCard: {
        border: '1px solid #e5e7eb', borderRadius: 8,
        padding: 12, marginBottom: 10, backgroundColor: '#fafafa'
    },
    actionBtn: {
        border: 'none', background: 'none',
        cursor: 'pointer', fontSize: 13, padding: '2px 6px'
    }
};

export default CommentsModal;
