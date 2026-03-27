import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MESSAGES_STORAGE_KEY = 'platform_messages';

const SupplierDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('addProduct');
  const [loading, setLoading] = useState(false);
  const [pointsDeVente, setPointsDeVente] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [newPoint, setNewPoint] = useState({ nom: '', adresse: '' });
  const [messages, setMessages] = useState([]);
  const [messageForm, setMessageForm] = useState({
    toRole: 'administrateur',
    subject: '',
    content: ''
  });
  const [productForm, setProductForm] = useState({
    nom: '',
    description: '',
    code_barre: '',
    origine: '',
    ingredients: '',
    image: '',
    pointsDeVente: []
  });

  const fetchPoints = async () => {
    const res = await fetch('/api/pointDeVente');
    if (!res.ok) throw new Error('Impossible de charger les points de vente');
    const data = await res.json();
    setPointsDeVente(Array.isArray(data) ? data : []);
  };

  const fetchMyProducts = async () => {
    if (!user?.id) return;
    const res = await fetch(`/api/produits?createdBy=${encodeURIComponent(user.id)}`);
    if (!res.ok) throw new Error('Impossible de charger vos produits');
    const data = await res.json();
    setMyProducts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchPoints().catch(() => {});
  }, []);

  useEffect(() => {
    fetchMyProducts().catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');
    const mine = allMessages
      .filter((m) => m.fromId === user?.id && m.fromRole === 'fournisseur')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setMessages(mine);
  }, [user?.id, activeTab]);

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Erreur lecture image'));
      reader.readAsDataURL(file);
    });

  const canSubmit = useMemo(() => {
    return (
      String(productForm.nom).trim() &&
      String(productForm.description).trim() &&
      String(productForm.code_barre).trim() &&
      String(productForm.origine).trim()
    );
  }, [productForm]);

  const handleAddPoint = async (e) => {
    e.preventDefault();
    if (!newPoint.nom.trim() || !newPoint.adresse.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/pointDeVente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: newPoint.nom, adresse: newPoint.adresse })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erreur création point de vente');
      setNewPoint({ nom: '', adresse: '' });
      await fetchPoints();
      alert('Point de vente ajouté !');
    } catch (err) {
      alert(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      alert('Veuillez vous connecter');
      navigate('/login');
      return;
    }
    if (!canSubmit) {
      alert('Veuillez remplir les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nom: productForm.nom,
        description: productForm.description,
        code_barre: productForm.code_barre,
        origine: productForm.origine,
        image: productForm.image,
        ingredients: productForm.ingredients, // string "a,b,c" accepté par backend
        pointsDeVente: productForm.pointsDeVente,
        createdBy: user.id
      };

      const res = await fetch('/api/produits/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la soumission');

      alert('Produit soumis et en attente de validation par l’admin ✅');
      setProductForm({ nom: '', description: '', code_barre: '', origine: '', ingredients: '', image: '', pointsDeVente: [] });
      await fetchMyProducts();
      setActiveTab('myProducts');
    } catch (err) {
      alert(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // ou navigate('/login') selon votre structure
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!messageForm.subject.trim() || !messageForm.content.trim()) {
      alert('Veuillez remplir le sujet et le message.');
      return;
    }

    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');
    const newMessage = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fromId: user.id,
      fromRole: 'fournisseur',
      fromName: `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Fournisseur',
      toRole: messageForm.toRole,
      subject: messageForm.subject.trim(),
      content: messageForm.content.trim(),
      createdAt: new Date().toISOString(),
      read: false
    };

    const updated = [newMessage, ...allMessages];
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updated));
    setMessages([newMessage, ...messages]);
    setMessageForm({ toRole: messageForm.toRole, subject: '', content: '' });
    alert('Message envoyé avec succès.');
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2>Espace Fournisseur</h2>
        <button 
          onClick={() => setActiveTab('addProduct')}
          style={activeTab === 'addProduct' ? styles.activeButton : styles.menuButton}
        >
          ➕ Ajouter Produit
        </button>
        <button 
          onClick={() => setActiveTab('myProducts')}
          style={activeTab === 'myProducts' ? styles.activeButton : styles.menuButton}
        >
          📦 Mes Produits
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          style={activeTab === 'messages' ? styles.activeButton : styles.menuButton}
        >
          💬 Messages (Admin/Agent)
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Déconnexion
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'addProduct' && (
          <div>
            <h2>Ajouter un Nouveau Produit</h2>
            <form onSubmit={handleAddProduct} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Nom du produit *</label>
                <input
                  type="text"
                  value={productForm.nom}
                  onChange={(e) => setProductForm({...productForm, nom: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  style={styles.textarea}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label>Code-barre *</label>
                <input
                  type="text"
                  value={productForm.code_barre}
                  onChange={(e) => setProductForm({...productForm, code_barre: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label>Origine *</label>
                <input
                  type="text"
                  value={productForm.origine}
                  onChange={(e) => setProductForm({...productForm, origine: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label>Ingrédients</label>
                <textarea
                  value={productForm.ingredients}
                  onChange={(e) => setProductForm({...productForm, ingredients: e.target.value})}
                  style={styles.textarea}
                  placeholder="Ex: lait, sucre, cacao..."
                />
              </div>

              <div style={styles.formGroup}>
                <label>Image (optionnel)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const dataUrl = await readFileAsDataUrl(file);
                      setProductForm({ ...productForm, image: dataUrl });
                    } catch {
                      alert('Impossible de lire l’image');
                    }
                  }}
                  style={styles.input}
                />
                {productForm.image ? (
                  <img
                    alt="Aperçu"
                    src={productForm.image}
                    style={{ marginTop: '10px', maxWidth: '220px', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                ) : null}
              </div>

              <div style={styles.formGroup}>
                <label>Points de vente</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pointsDeVente.length === 0 ? (
                    <div style={styles.infoBox}>
                      <p>Aucun point de vente disponible. Ajoutez-en ci-dessous.</p>
                    </div>
                  ) : (
                    <select
                      multiple
                      value={productForm.pointsDeVente}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                        setProductForm({ ...productForm, pointsDeVente: selected });
                      }}
                      style={styles.select}
                    >
                      {pointsDeVente.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.nom} — {p.adresse}
                        </option>
                      ))}
                    </select>
                  )}

                  <div style={styles.inlineBox}>
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
                    <button onClick={handleAddPoint} style={styles.secondaryButton} disabled={loading}>
                      + Ajouter
                    </button>
                  </div>
                  <small style={{ color: '#666' }}>Maintiens Ctrl pour sélectionner plusieurs.</small>
                </div>
              </div>

              <button type="submit" style={styles.submitButton}>
                {loading ? 'Envoi...' : 'Soumettre pour validation'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'myProducts' && (
          <div>
            <h2>Mes Produits</h2>
            {myProducts.length === 0 ? (
              <div style={styles.infoBox}>
                <p>Vous n'avez pas encore de produits.</p>
              </div>
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
                        backgroundColor: p.status === 'approved' ? '#d1fae5' : p.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: p.status === 'approved' ? '#059669' : p.status === 'rejected' ? '#dc2626' : '#92400e'
                      }}>
                        {p.status === 'approved' ? '✅ Accepté' : p.status === 'rejected' ? '❌ Rejeté' : '⏳ En attente'}
                      </span>
                    </div>
                    {p.description ? <p style={styles.productDesc}>{p.description}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2>Communication avec Admin/Agent</h2>
            <form onSubmit={handleSendMessage} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Destinataire *</label>
                <select
                  value={messageForm.toRole}
                  onChange={(e) => setMessageForm({ ...messageForm, toRole: e.target.value })}
                  style={styles.input}
                >
                  <option value="administrateur">Administrateur</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label>Sujet *</label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label>Message *</label>
                <textarea
                  value={messageForm.content}
                  onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                  style={styles.textarea}
                  required
                />
              </div>
              <button type="submit" style={styles.submitButton}>Envoyer</button>
            </form>

            <div style={{ marginTop: '18px' }}>
              <h3>Messages envoyés</h3>
              {messages.length === 0 ? (
                <div style={styles.messageBox}><p>Aucun message envoyé.</p></div>
              ) : (
                <div style={styles.messagesList}>
                  {messages.map((m) => (
                    <div key={m.id} style={styles.messageCard}>
                      <div style={styles.messageHeader}>
                        <strong>{m.subject}</strong>
                        <span style={styles.messageMeta}>
                          Vers: {m.toRole === 'administrateur' ? 'Admin' : 'Agent'} • {new Date(m.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p style={styles.messageText}>{m.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
    backgroundColor: '#1976D2',
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
    color: '#1976D2',
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
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
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
    fontSize: '14px',
    marginTop: '5px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    marginTop: '5px',
    minHeight: '100px'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    marginTop: '5px',
    minHeight: '120px',
    backgroundColor: 'white'
  },
  inlineBox: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: '10px',
    alignItems: 'center'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  secondaryButton: {
    backgroundColor: '#1976D2',
    color: 'white',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    height: '42px',
    marginTop: '5px'
  },
  infoBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  productsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  productCard: { backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' },
  productRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  productName: { fontSize: '16px', fontWeight: 'bold' },
  productMeta: { color: '#666', fontSize: '13px', marginTop: '4px' },
  productDesc: { marginTop: '10px', color: '#444' },
  statusBadge: { padding: '6px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' },
  messageBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    minHeight: '200px'
  },
  messagesList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  messageCard: { backgroundColor: 'white', padding: '14px', borderRadius: '8px', border: '1px solid #e5e7eb' },
  messageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  messageMeta: { color: '#6b7280', fontSize: '12px' },
  messageText: { marginTop: '8px', color: '#374151', whiteSpace: 'pre-wrap' }
};

export default SupplierDashboard;