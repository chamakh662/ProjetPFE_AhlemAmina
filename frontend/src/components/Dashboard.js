import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = (role) => {
    const roles = {
      'visiteur': 'Visiteur',
      'consommateur': 'Consommateur',
      'fournisseur': 'Fournisseur',
      'agent': 'Agent',
      'administrateur': 'Administrateur'
    };
    return roles[role] || role;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Tableau de bord</h2>
        
        <div style={styles.userInfo}>
          <p><strong>Nom:</strong> {user.prenom} {user.nom}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rôle:</strong> {getRoleName(user.role)}</p>
        </div>

        <div style={styles.message}>
          <h3>Bienvenue {user.prenom} !</h3>
          <p>Vous êtes connecté en tant que {getRoleName(user.role)}.</p>
        </div>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center'
  },
  title: {
    marginBottom: '30px',
    color: '#333'
  },
  userInfo: {
    textAlign: 'left',
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  message: {
    marginBottom: '30px'
  },
  logoutButton: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  }
};

export default Dashboard;