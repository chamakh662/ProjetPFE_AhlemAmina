import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';  // ✅ Ajout de useNavigate

const AgentDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();  // ✅ Initialisation de navigate
  const [activeTab, setActiveTab] = useState('overview');
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
            <h2>Envoyer une notification à l'admin</h2>
            <form style={styles.form}>
              <div style={styles.formGroup}>
                <label>Sujet</label>
                <input type="text" style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Message</label>
                <textarea style={styles.textarea}></textarea>
              </div>
              <button style={styles.submitButton}>Envoyer</button>
            </form>
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
  submitButton: {
    backgroundColor: '#FF9800',
    color: 'white',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  analysisBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  }
};

export default AgentDashboard;