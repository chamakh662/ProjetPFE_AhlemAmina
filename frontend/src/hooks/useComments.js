// src/hooks/useComments.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'allComments';

const useComments = () => {
  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Persiste automatiquement à chaque changement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  }, [comments]);

  const getProductComments = (productId) =>
    comments.filter((c) => c.id_produit === productId);

  const getAverageRating = (productId) => {
    const pc = getProductComments(productId);
    if (pc.length === 0) return 0;
    return (pc.reduce((acc, c) => acc + c.note, 0) / pc.length).toFixed(1);
  };

  const addComment = (productId, productName, user, text, rating) => {
    if (!user) return alert('Veuillez vous connecter pour ajouter un commentaire.');
    if (!text.trim()) return alert('Veuillez écrire un commentaire.');
    const comment = {
      id: Date.now().toString(),
      id_produit: productId,
      nom_produit: productName,
      id_utilisateur: user.id,
      nom_utilisateur: `${user.prenom} ${user.nom}`,
      texte: text,
      note: rating,
      date: new Date().toISOString(),
      dateModification: null,
    };
    setComments((prev) => [...prev, comment]);
  };

  const editComment = (commentId, newText, userId) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment || comment.id_utilisateur !== userId)
      return alert('Vous ne pouvez modifier que vos propres commentaires.');
    if (!newText.trim()) return alert('Le commentaire ne peut pas être vide.');
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, texte: newText, dateModification: new Date().toISOString() }
          : c
      )
    );
  };

  const deleteComment = (commentId, user) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;
    if (comment.id_utilisateur !== user.id && user.role !== 'administrateur')
      return alert('Vous ne pouvez supprimer que vos propres commentaires.');
    if (window.confirm('Supprimer ce commentaire ?'))
      setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return { comments, getProductComments, getAverageRating, addComment, editComment, deleteComment };
};

export default useComments;
