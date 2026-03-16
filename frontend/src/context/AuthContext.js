import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  VISITEUR: 'visiteur',
  CONSOMMATEUR: 'consommateur',
  FOURNISSEUR: 'fournisseur',
  AGENT: 'agent',
  ADMINISTRATEUR: 'administrateur'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔴 1. INITIALISATION : Charger l'utilisateur au démarrage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('✅ AuthContext: Utilisateur restauré:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('ℹ️ AuthContext: Aucun utilisateur en session');
      }
    } catch (error) {
      console.error('❌ AuthContext: Erreur de parsing user:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔴 2. LOGIN : Chercher l'utilisateur dans la "base de données" localStorage
  const login = (email, password, role) => {
    console.log(`🔐 Tentative de connexion: ${email} (${role})`);
    
    try {
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Recherche insensible à la casse
      const foundUser = storedUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.role.toLowerCase() === role.toLowerCase()
      );

      if (!foundUser) {
        console.error('❌ AuthContext: Utilisateur non trouvé');
        throw new Error('Utilisateur non trouvé');
      }

      if (foundUser.password !== password) {
        console.error('❌ AuthContext: Mot de passe incorrect');
        throw new Error('Mot de passe incorrect');
      }

      // Connexion réussie : on crée l'objet user sans le mot de passe
      const { password: _, ...userWithoutPassword } = foundUser;
      
      console.log('✅ AuthContext: Connexion réussie');
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ AuthContext Error:', error);
      throw error;
    }
  };

  // 🔴 3. REGISTER : Sauvegarder dans registeredUsers ET connecter l'utilisateur
  const register = (userData) => {
    console.log('📝 Inscription:', userData.email);
    
    try {
      // Récupérer la liste des utilisateurs
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Vérifier doublon email
      const emailExists = storedUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (emailExists) {
        throw new Error('Email déjà utilisé');
      }

      // Créer le nouvel utilisateur
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      // Sauvegarder dans la "base de données"
      storedUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(storedUsers));
      
      // Connecter automatiquement l'utilisateur (sans le mot de passe)
      const { password: _, ...userWithoutPassword } = newUser;
      
      console.log('✅ AuthContext: Inscription réussie');
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ AuthContext Register Error:', error);
      throw error;
    }
  };

  // 🔴 4. LOGOUT : Nettoyer la session
  const logout = () => {
    console.log('🚪 Déconnexion');
    localStorage.removeItem('user');
    setUser(null);
  };

  // 🔴 5. UPDATEUSER : Mettre à jour le profil
  const updateUser = (updatedData) => {
    if (!user) return null;
    
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Optionnel: mettre à jour aussi dans registeredUsers
    try {
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userIndex = storedUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], ...updatedData };
        localStorage.setItem('registeredUsers', JSON.stringify(storedUsers));
      }
    } catch (e) {
      console.warn('⚠️ Impossible de mettre à jour registeredUsers:', e);
    }
    
    return updatedUser;
  };

  // Helpers de vérification de rôle
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return Array.isArray(allowedRoles) 
      ? allowedRoles.includes(user.role) 
      : user.role === allowedRoles;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isAuthenticated: !!user,
    isVisiteur: user?.role === ROLES.VISITEUR,
    isConsommateur: user?.role === ROLES.CONSOMMATEUR,
    isFournisseur: user?.role === ROLES.FOURNISSEUR,
    isAgent: user?.role === ROLES.AGENT,
    isAdmin: user?.role === ROLES.ADMINISTRATEUR
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;