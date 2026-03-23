import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const API_AUTH = '/api/auth';

export const ROLES = {
  VISITEUR: 'visiteur',
  CONSOMMATEUR: 'consommateur',
  FOURNISSEUR: 'fournisseur',
  AGENT: 'agent',
  ADMINISTRATEUR: 'administrateur'
};

const normalizeStoredUser = (u) => (u ? { ...u, id: String(u.id) } : null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(normalizeStoredUser(parsedUser));
      }
    } catch (error) {
      console.error('❌ AuthContext: Erreur de parsing user:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    const res = await fetch(`${API_AUTH}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        password
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        data.message === 'Erreur serveur' && data.error
          ? `${data.message} (${data.error})`
          : data.message || 'Erreur de connexion';
      throw new Error(msg);
    }

    const u = normalizeStoredUser(data.user);
    if (u.role.toLowerCase() !== String(role).toLowerCase()) {
      throw new Error('Le rôle sélectionné ne correspond pas à ce compte');
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    return u;
  };

  const register = async (userData) => {
    const res = await fetch(`${API_AUTH}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: userData.nom,
        prenom: userData.prenom,
        email: String(userData.email).trim().toLowerCase(),
        password: userData.password,
        role: userData.role
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        data.message === 'Erreur serveur' && data.error
          ? `${data.message} (${data.error})`
          : data.message || 'Erreur lors de l’inscription';
      throw new Error(msg);
    }

    const u = normalizeStoredUser(data.user);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    return u;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    if (!user) return null;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

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
