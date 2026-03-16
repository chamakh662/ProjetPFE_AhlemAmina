import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consommateur');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🔴 ÉTATS POUR LA RÉINITIALISATION DE MOT DE PASSE
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  const navigate = useNavigate();

  // 🔴 FONCTION : Demander la réinitialisation par email
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResetLoading(true);

    if (!resetEmail.trim()) {
      setError('❌ Veuillez entrer votre email');
      setResetLoading(false);
      return;
    }

    try {
      // 🔴 SIMULATION : Générer un token de réinitialisation
      const token = btoa(`${resetEmail}-${Date.now()}-${Math.random().toString(36).substr(2)}`);
      
      // 🔴 SIMULATION : Sauvegarder le token dans localStorage (en prod: envoyer par email)
      const resetData = {
        email: resetEmail,
        token: token,
        expires: Date.now() + 3600000, // 1 heure
        role: role
      };
      localStorage.setItem(`reset_${resetEmail}`, JSON.stringify(resetData));
      
      // 🔴 SIMULATION : Affichage du lien (en prod: envoyé par email via backend)
      const resetLink = `${window.location.origin}/login?reset=${token}`;
      
      setSuccess(`✅ Un lien de réinitialisation a été généré pour ${resetEmail}
      
🔗 Lien de réinitialisation (simulation):
${resetLink}

⚠️ Ce lien expire dans 1 heure.
En production, ce lien serait envoyé à votre adresse email.`);
      
      console.log('🔗 Lien de réinitialisation:', resetLink);
      
      // 🔴 Optionnel: Rediriger vers un formulaire de nouveau mot de passe
      // setResetToken(token);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      setError('❌ Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setResetLoading(false);
    }
  };

  // 🔴 FONCTION : Vérifier le token depuis l'URL
  const checkResetToken = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset');
    
    if (token) {
      // Chercher le token dans localStorage
      for (let key in localStorage) {
        if (key.startsWith('reset_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.token === token && data.expires > Date.now()) {
              setResetToken(token);
              setResetEmail(data.email);
              setShowResetForm(true);
              return true;
            }
          } catch (e) {
            console.error('Token invalide');
          }
        }
      }
      setError('❌ Lien de réinitialisation invalide ou expiré');
    }
    return false;
  };

  // 🔴 FONCTION : Réinitialiser le mot de passe
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResetLoading(true);

    // Validations
    if (!newPassword || !confirmPassword) {
      setError('❌ Veuillez remplir tous les champs');
      setResetLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError('❌ Le mot de passe doit contenir au moins 6 caractères');
      setResetLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('❌ Les mots de passe ne correspondent pas');
      setResetLoading(false);
      return;
    }

    try {
      // 🔴 SIMULATION : Mettre à jour le mot de passe dans localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email === resetEmail && u.role === role);
      
      if (userIndex !== -1) {
        // Mettre à jour le mot de passe (en prod: hacher avec bcrypt)
        users[userIndex].password = newPassword; // ⚠️ À hacher en production!
        localStorage.setItem('users', JSON.stringify(users));
        
        // Nettoyer le token
        localStorage.removeItem(`reset_${resetEmail}`);
        
        setSuccess('✅ Votre mot de passe a été réinitialisé avec succès !');
        
        // Réinitialiser les états
        setTimeout(() => {
          setShowResetForm(false);
          setResetToken(null);
          setNewPassword('');
          setConfirmPassword('');
          // Retour au formulaire de connexion
          navigate('/login');
        }, 2000);
      } else {
        // Créer un nouvel utilisateur si non trouvé (pour la démo)
        const newUser = {
          id: Date.now().toString(),
          email: resetEmail,
          password: newPassword,
          role: role,
          nom: 'Utilisateur',
          prenom: 'Demo'
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        setSuccess('✅ Compte créé et mot de passe défini !');
        
        setTimeout(() => {
          setShowResetForm(false);
          setResetToken(null);
          setNewPassword('');
          setConfirmPassword('');
          navigate('/login');
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      setError('❌ Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setResetLoading(false);
    }
  };

  // 🔴 Vérifier le token au montage du composant
  React.useEffect(() => {
    checkResetToken();
  }, []);

  // 🔴 Soumission de la connexion normale
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('🔐 Tentative de connexion:', { email, role });

    if (!email || !password) {
      setError('❌ Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      const userData = await login(email, password, role);
      
      console.log('✅ Connexion réussie:', userData);
      console.log('🎯 Rôle:', userData.role);
      
      // 🔴 REDIRECTION SELON LE RÔLE
      switch(userData.role.toLowerCase()) {
        case 'administrateur':
          navigate('/dashboard/AdminDashboard', { replace: true });
          break;
        case 'consommateur':
          navigate('/', { replace: true });
          break;
        case 'fournisseur':
          navigate('/dashboard/SupplierDashboard', { replace: true });
          break;
        case 'agent':
          navigate('/dashboard/AgentDashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      setError(error.message || '❌ Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 RENDU : Formulaire de réinitialisation
  if (showResetForm && resetToken) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>🔑 Nouveau mot de passe</h2>
          
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}
          
          <form onSubmit={handleResetPassword} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email:</label>
              <input
                type="email"
                value={resetEmail}
                disabled
                style={{...styles.input, backgroundColor: '#f9fafb', cursor: 'not-allowed'}}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nouveau mot de passe:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                style={styles.input}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <small style={styles.hint}>Minimum 6 caractères</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmer le mot de passe:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                style={styles.input}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              style={{
                ...styles.button,
                opacity: resetLoading ? 0.7 : 1,
                cursor: resetLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={resetLoading}
            >
              {resetLoading ? '⏳ Mise à jour...' : '💾 Enregistrer le nouveau mot de passe'}
            </button>
          </form>

          <p style={styles.text}>
            <Link to="/login" style={styles.link}>← Retour à la connexion</Link>
          </p>
        </div>
      </div>
    );
  }

  // 🔴 RENDU : Formulaire "Mot de passe oublié"
  if (showResetForm) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>🔐 Mot de passe oublié</h2>
          
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}
          
          {!success ? (
            <form onSubmit={handleForgotPassword} style={styles.form}>
              <p style={styles.infoText}>
                Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Email:</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setError('');
                  }}
                  style={styles.input}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Je suis:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={styles.input}
                >
                  <option value="consommateur">Consommateur</option>
                  <option value="fournisseur">Fournisseur</option>
                  <option value="agent">Agent</option>
                  <option value="administrateur">Administrateur</option>
                </select>
              </div>

              <button 
                type="submit" 
                style={{
                  ...styles.button,
                  opacity: resetLoading ? 0.7 : 1,
                  cursor: resetLoading ? 'not-allowed' : 'pointer'
                }}
                disabled={resetLoading}
              >
                {resetLoading ? '⏳ Envoi en cours...' : '📧 Envoyer le lien de réinitialisation'}
              </button>
            </form>
          ) : (
            <div style={styles.successBox}>
              <p style={{marginBottom: '1rem'}}>{success}</p>
              <button 
                onClick={() => {
                  setShowResetForm(false);
                  setResetEmail('');
                  setSuccess('');
                }}
                style={styles.button}
              >
                ← Retour à la connexion
              </button>
            </div>
          )}

          <p style={styles.text}>
            <Link to="/login" style={styles.link}>← Retour à la connexion</Link>
          </p>
        </div>
      </div>
    );
  }

  // 🔴 RENDU : Formulaire de connexion normal
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Connexion</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              style={styles.input}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Je suis:</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setError('');
              }}
              style={styles.input}
            >
              <option value="consommateur">Consommateur</option>
              <option value="fournisseur">Fournisseur</option>
              <option value="agent">Agent</option>
              <option value="administrateur">Administrateur</option>
            </select>
          </div>

          {/* 🔴 LIEN MOT DE PASSE OUBLIÉ */}
          <p style={styles.forgotPassword}>
            <button 
              type="button" 
              onClick={() => setShowResetForm(true)}
              style={styles.forgotLink}
            >
              Mot de passe oublié ?
            </button>
          </p>

          <button 
            type="submit" 
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? '⏳ Connexion en cours...' : '🔐 Se connecter'}
          </button>
        </form>

        <p style={styles.text}>
          Pas encore de compte? <Link to="/register" style={styles.link}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

// 🎨 CSS STYLES
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '1rem'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '450px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#1f2937',
    fontSize: '2rem',
    fontWeight: '700'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.875rem'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  button: {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '10px',
    transition: 'background-color 0.2s'
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #fecaca',
    fontWeight: '500',
    fontSize: '0.875rem'
  },
  success: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #bbf7d0',
    fontWeight: '500',
    fontSize: '0.875rem',
    whiteSpace: 'pre-line'
  },
  successBox: {
    textAlign: 'center',
    padding: '1rem 0'
  },
  text: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  link: {
    color: '#16a34a',
    textDecoration: 'none',
    fontWeight: '600'
  },
  forgotPassword: {
    textAlign: 'right',
    margin: '-10px 0 15px 0'
  },
  forgotLink: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '0.875rem',
    padding: 0,
    textDecoration: 'none'
  },
  infoText: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    lineHeight: '1.5'
  },
  hint: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '4px',
    display: 'block'
  }
};

export default Login;