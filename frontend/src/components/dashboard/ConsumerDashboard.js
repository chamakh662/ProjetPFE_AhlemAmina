import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Home from '../../pages/Home';

const ConsumerDashboard = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 ConsumerDashboard: Vérification de l\'accès...');
    
    // Vérifier si l'utilisateur est connecté
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      console.log('❌ ConsumerDashboard: Pas d\'utilisateur connecté');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      console.log('👤 ConsumerDashboard: Utilisateur trouvé:', userData);
      console.log('🔑 ConsumerDashboard: Rôle:', userData.role);

      // Vérifier que le rôle est bien "consommateur"
      if (userData.role.toLowerCase() !== 'consommateur') {
        console.log('❌ ConsumerDashboard: Rôle incorrect:', userData.role);
        navigate('/login', { replace: true });
        return;
      }

      console.log('✅ ConsumerDashboard: Accès autorisé pour consommateur');
      setIsAuthorized(true);
    } catch (error) {
      console.error('❌ ConsumerDashboard: Erreur lors de la lecture des données:', error);
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // 🔴 Affiche un loader pendant la vérification
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Chargement de votre espace consommateur...</p>
      </div>
    );
  }

  // 🔴 Si non autorisé, ne rien afficher (la redirection est déjà faite)
  if (!isAuthorized) {
    return null;
  }

  // 🔴 RENDU PRINCIPAL : affiche Home avec les fonctionnalités consommateur activées
  console.log('✅ ConsumerDashboard: Rendu de la page Home');
  return <Home />;
};

// 🎨 Styles pour le loading
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    gap: '1rem'
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #16a34a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '1.125rem',
    color: '#16a34a',
    fontWeight: '500'
  }
};

// 🔴 Ajouter l'animation de spin dans le style global
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleElement);

export default ConsumerDashboard;