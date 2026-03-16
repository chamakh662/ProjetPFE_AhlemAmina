import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SupplierDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('addProduct');
  const [productForm, setProductForm] = useState({
    nom: '',
    description: '',
    code_barre: '',
    origine: '',
    ingredients: ''
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    alert('Produit ajouté et en attente de validation par l\'admin');
    setProductForm({ nom: '', description: '', code_barre: '', origine: '', ingredients: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // ou navigate('/login') selon votre structure
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
                />
              </div>

              <button type="submit" style={styles.submitButton}>
                Soumettre pour validation
              </button>
            </form>
          </div>
        )}

        {activeTab === 'myProducts' && (
          <div>
            <h2>Mes Produits</h2>
            <div style={styles.infoBox}>
              <p>Vous n'avez pas encore de produits.</p>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2>Communication avec Admin/Agent</h2>
            <div style={styles.messageBox}>
              <p>Aucun message pour le moment.</p>
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
  infoBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  messageBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    minHeight: '200px'
  }
};

export default SupplierDashboard;