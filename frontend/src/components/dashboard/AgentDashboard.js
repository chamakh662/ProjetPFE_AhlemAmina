import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';  // ✅ Ajout de useNavigate

const MESSAGES_STORAGE_KEY = 'platform_messages';

const AgentDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();  // ✅ Initialisation de navigate
  const [activeTab, setActiveTab] = useState('overview');
  const [inboxMessages, setInboxMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [pointsDeVente, setPointsDeVente] = useState([]);
  const [newPoint, setNewPoint] = useState({ nom: '', adresse: '' });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    nom: '',
    description: '',
    code_barre: '',
    origine: '',
    ingredients: '',
    pointsDeVente: []
  });
  const [profileForm, setProfileForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    adresse: ''
  });

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      adresse: user.adresse || ''
    });
  }, [user]);

  useEffect(() => {
    if (activeTab !== 'notifications') return;
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');
    const inbox = allMessages
      .filter((m) => m.toRole === 'agent')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setInboxMessages(inbox);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'products') return;
    const load = async () => {
      setLoadingProducts(true);
      try {
        const [prodRes, pvRes] = await Promise.all([
          fetch('/api/produits?status=approved'),
          fetch('/api/pointDeVente')
        ]);
        const prodData = await prodRes.json().catch(() => []);
        const pvData = await pvRes.json().catch(() => []);
        if (prodRes.ok) setProducts(Array.isArray(prodData) ? prodData : []);
        if (pvRes.ok) setPointsDeVente(Array.isArray(pvData) ? pvData : []);
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, [activeTab]);

  // ✅ Fonction handleLogout déplacée à l'intérieur du composant
  const handleLogout = () => {
    logout();
    navigate('/');  // Redirige vers la page d'accueil
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateUser(profileForm);
    alert('Profil mis à jour avec succès !');
  };

  const startEditProduct = (p) => {
    setEditingProductId(p._id);
    setProductForm({
      nom: p.nom || '',
      description: p.description || '',
      code_barre: p.code_barre || '',
      origine: p.origine || '',
      ingredients: Array.isArray(p.ingredients) ? p.ingredients.map((i) => i?.nom).filter(Boolean).join(', ') : '',
      pointsDeVente: Array.isArray(p.pointsDeVente)
        ? p.pointsDeVente.map((pv) => (typeof pv === 'string' ? pv : pv?._id)).filter(Boolean)
        : []
    });
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setProductForm({
      nom: '',
      description: '',
      code_barre: '',
      origine: '',
      ingredients: '',
      pointsDeVente: []
    });
  };

  const saveEditProduct = async (productId) => {
    try {
      const res = await fetch(`/api/produits/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: productForm.nom,
          description: productForm.description,
          code_barre: productForm.code_barre,
          origine: productForm.origine,
          ingredients: productForm.ingredients,
          pointsDeVente: productForm.pointsDeVente
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erreur modification produit');

      const refreshed = await fetch('/api/produits?status=approved');
      const refreshedData = await refreshed.json().catch(() => []);
      if (refreshed.ok) setProducts(Array.isArray(refreshedData) ? refreshedData : []);

      cancelEditProduct();
      alert('Produit modifié avec succès ✅');
    } catch (err) {
      alert(err.message || 'Erreur');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Supprimer ce produit ? Il sera rejeté de la plateforme.')) return;
    try {
      const res = await fetch(`/api/produits/${productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validatedBy: user?.id })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erreur suppression produit');
      setProducts(products.filter((p) => p._id !== productId));
      alert('Produit supprimé (rejeté) ❌');
    } catch (err) {
      alert(err.message || 'Erreur');
    }
  };

  const refreshPointsDeVente = async () => {
    const pvRes = await fetch('/api/pointDeVente');
    const pvData = await pvRes.json().catch(() => []);
    if (pvRes.ok) setPointsDeVente(Array.isArray(pvData) ? pvData : []);
  };

  const handleAddPoint = async (e) => {
    e.preventDefault();
    if (!newPoint.nom.trim() || !newPoint.adresse.trim()) {
      alert('Veuillez renseigner le nom et l’adresse.');
      return;
    }
    try {
      const res = await fetch('/api/pointDeVente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: newPoint.nom, adresse: newPoint.adresse })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erreur ajout point de vente');
      await refreshPointsDeVente();
      setNewPoint({ nom: '', adresse: '' });
      alert('Point de vente ajouté ✅');
    } catch (err) {
      alert(err.message || 'Erreur');
    }
  };

  const handleDeletePoint = async (id) => {
    if (!window.confirm('Supprimer ce point de vente ?')) return;
    try {
      const res = await fetch(`/api/pointDeVente/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erreur suppression point de vente');
      setPointsDeVente(pointsDeVente.filter((p) => p._id !== id));
      // si le point supprimé était sélectionné dans le formulaire produit, on le retire
      setProductForm((prev) => ({
        ...prev,
        pointsDeVente: Array.isArray(prev.pointsDeVente) ? prev.pointsDeVente.filter((x) => x !== id) : []
      }));
      alert('Point de vente supprimé ❌');
    } catch (err) {
      alert(err.message || 'Erreur');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2>Espace Agent</h2>
        <button 
          onClick={() => setActiveTab('overview')}
          style={activeTab === 'overview' ? styles.activeButton : styles.menuButton}
        >
          📊 Vue d'ensemble
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          style={activeTab === 'products' ? styles.activeButton : styles.menuButton}
        >
          📦 Gérer Produits
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          style={activeTab === 'notifications' ? styles.activeButton : styles.menuButton}
        >
          🔔 Notifications Admin
        </button>
        <button 
          onClick={() => setActiveTab('aiAnalysis')}
          style={activeTab === 'aiAnalysis' ? styles.activeButton : styles.menuButton}
        >
          🤖 Analyse IA
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          style={activeTab === 'profile' ? styles.activeButton : styles.menuButton}
        >
          👤 Mon Profil
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Déconnexion
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'overview' && (
          <div>
            <h2>Tableau de bord Agent</h2>
            <div style={styles.infoBox}>
              <p>Bienvenue dans votre espace agent.</p>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2>📥 Messages reçus (Fournisseurs)</h2>
            {inboxMessages.length === 0 ? (
              <div style={styles.infoBox}>
                <p>Aucun message reçu pour le moment.</p>
              </div>
            ) : (
              <div style={styles.messagesList}>
                {inboxMessages.map((m) => (
                  <div key={m.id} style={styles.messageCard}>
                    <div style={styles.messageHeader}>
                      <strong>{m.subject}</strong>
                      <span style={styles.messageMeta}>{new Date(m.createdAt).toLocaleString('fr-FR')}</span>
                    </div>
                    <p style={styles.messageText}>{m.content}</p>
                    <small style={styles.messageMeta}>De: {m.fromName || 'Fournisseur'}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <h2>📦 Gérer Produits</h2>
            {loadingProducts ? (
              <div style={styles.infoBox}><p>Chargement des produits...</p></div>
            ) : products.length === 0 ? (
              <div style={styles.infoBox}><p>Aucun produit validé à gérer.</p></div>
            ) : (
              <div style={styles.productsList}>
                {products.map((p) => (
                  <div key={p._id} style={styles.productCard}>
                    {editingProductId === p._id ? (
                      <div>
                        <div style={styles.formGroup}>
                          <label>Nom</label>
                          <input type="text" value={productForm.nom} onChange={(e) => setProductForm({ ...productForm, nom: e.target.value })} style={styles.input} />
                        </div>
                        <div style={styles.formGroup}>
                          <label>Description</label>
                          <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} style={styles.textarea} />
                        </div>
                        <div style={styles.formGroup}>
                          <label>Code-barre</label>
                          <input type="text" value={productForm.code_barre} onChange={(e) => setProductForm({ ...productForm, code_barre: e.target.value })} style={styles.input} />
                        </div>
                        <div style={styles.formGroup}>
                          <label>Origine</label>
                          <input type="text" value={productForm.origine} onChange={(e) => setProductForm({ ...productForm, origine: e.target.value })} style={styles.input} />
                        </div>
                        <div style={styles.formGroup}>
                          <label>Ingrédients (séparés par virgules)</label>
                          <textarea value={productForm.ingredients} onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })} style={styles.textarea} />
                        </div>
                        <div style={styles.formGroup}>
                          <label>Points de vente</label>
                          <select
                            multiple
                            value={productForm.pointsDeVente}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                              setProductForm({ ...productForm, pointsDeVente: selected });
                            }}
                            style={styles.select}
                          >
                            {pointsDeVente.map((pv) => (
                              <option key={pv._id} value={pv._id}>
                                {pv.nom} — {pv.adresse}
                              </option>
                            ))}
                          </select>
                          <div style={{ marginTop: '10px' }}>
                            <div style={styles.inlinePointRow}>
                              <input
                                type="text"
                                placeholder="Nom point de vente"
                                value={newPoint.nom}
                                onChange={(e) => setNewPoint({ ...newPoint, nom: e.target.value })}
                                style={styles.input}
                              />
                              <input
                                type="text"
                                placeholder="Adresse"
                                value={newPoint.adresse}
                                onChange={(e) => setNewPoint({ ...newPoint, adresse: e.target.value })}
                                style={styles.input}
                              />
                              <button onClick={handleAddPoint} style={styles.submitButton} type="button">
                                + Ajouter
                              </button>
                            </div>

                            {pointsDeVente.length > 0 && (
                              <div style={styles.pointsListInline}>
                                {pointsDeVente.map((pv) => (
                                  <div key={pv._id} style={styles.pointItem}>
                                    <div>
                                      <strong>{pv.nom}</strong>
                                      <div style={styles.messageMeta}>{pv.adresse}</div>
                                    </div>
                                    <button type="button" onClick={() => handleDeletePoint(pv._id)} style={styles.deleteButton}>
                                      🗑️
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={styles.inlineActions}>
                          <button onClick={() => saveEditProduct(p._id)} style={styles.submitButton}>💾 Enregistrer</button>
                          <button onClick={cancelEditProduct} style={styles.cancelButton}>Annuler</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 style={{ marginTop: 0 }}>{p.nom}</h3>
                        <p style={styles.messageMeta}>Code-barre: {p.code_barre || '—'} • Origine: {p.origine || '—'}</p>
                        <p style={styles.messageText}>{p.description || 'Sans description'}</p>
                        <p style={styles.messageMeta}>
                          Points de vente: {Array.isArray(p.pointsDeVente) && p.pointsDeVente.length > 0
                            ? p.pointsDeVente.map((pv) => pv.nom || '').filter(Boolean).join(', ')
                            : '—'}
                        </p>
                        <div style={styles.inlineActions}>
                          <button onClick={() => startEditProduct(p)} style={styles.submitButton}>✏️ Modifier</button>
                          <button onClick={() => deleteProduct(p._id)} style={styles.deleteButton}>🗑️ Supprimer</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {activeTab === 'aiAnalysis' && (
          <div>
            <h2>Suivi de l'analyse IA</h2>
            <div style={styles.analysisBox}>
              <h3>Analyse des produits</h3>
              <p>Produits analysés: 150</p>
              <p>Dernière analyse: 05/03/2026</p>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2>👤 Mon Profil</h2>
            <form onSubmit={handleProfileUpdate} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Prénom</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileForm.prenom}
                  onChange={(e) => setProfileForm({ ...profileForm, prenom: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label>Nom</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profileForm.nom}
                  onChange={(e) => setProfileForm({ ...profileForm, nom: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
              </div>
              {/* L'agent doit pouvoir gérer aussi son adresse */}
              {user?.role === 'agent' && (
                <div style={styles.formGroup}>
                  <label>Adresse</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={profileForm.adresse}
                    onChange={(e) => setProfileForm({ ...profileForm, adresse: e.target.value })}
                  />
                </div>
              )}
              <button type="submit" style={styles.submitButton}>
                💾 Enregistrer
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#FF9800',
    color: 'white',
    padding: '20px'
  },
  content: {
    flex: 1,
    padding: '30px'
  },
  menuButton: {
    width: '100%',
    padding: '12px',
    marginBottom: '10px',
    backgroundColor: 'transparent',
    border: '2px solid white',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'left'
  },
  activeButton: {
    width: '100%',
    padding: '12px',
    marginBottom: '10px',
    backgroundColor: 'white',
    border: 'none',
    color: '#FF9800',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'left',
    fontWeight: 'bold'
  },
  logoutButton: {
    width: '100%',
    padding: '12px',
    marginTop: '20px',
    backgroundColor: '#f44336',
    border: 'none',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  infoBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '600px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginTop: '5px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginTop: '5px',
    minHeight: '150px'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginTop: '5px',
    minHeight: '120px',
    backgroundColor: 'white'
  },
  submitButton: {
    backgroundColor: '#FF9800',
    color: 'white',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  inlineActions: { display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' },
  inlinePointRow: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'center' },
  analysisBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  productsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  productCard: { backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.06)' },
  messagesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  messageCard: { backgroundColor: 'white', padding: '14px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.06)' },
  messageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  messageMeta: { color: '#6b7280', fontSize: '12px' },
  messageText: { marginTop: '8px', marginBottom: '8px', color: '#374151', whiteSpace: 'pre-wrap' },
  pointsListInline: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' },
  pointItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white' }
};

export default AgentDashboard;