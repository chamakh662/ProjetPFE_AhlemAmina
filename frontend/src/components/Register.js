import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const Register = () => {
  const { register } = useAuth(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'consommateur'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('📝 Tentative d\'inscription:', formData);

    // Validations
    if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
      setError('❌ Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('❌ Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('❌ Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      // 🔴 UTILISER la fonction register du contexte
      const userData = await register(formData);
      
      console.log('✅ Inscription réussie:', userData);
      setSuccess('✅ Inscription réussie ! Redirection...');
      
      // 🔴 REDIRECTION SELON LE RÔLE
      setTimeout(() => {
        switch(userData.role.toLowerCase()) {
          case 'administrateur':
            navigate('/dashboard/AdminDashboard', { replace: true });
            break;
          case 'consommateur':
            navigate('/', { replace: true }); // 🔴 Vers Home
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
      }, 1500);
      
    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error);
      setError(error.message || '❌ Erreur lors de l\'inscription. Cet email existe peut-être déjà.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Inscription</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nom *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                style={styles.input}
                placeholder="Votre nom"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Prénom *</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                style={styles.input}
                placeholder="Votre prénom"
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Type de compte *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="consommateur">Consommateur</option>
              <option value="fournisseur">Fournisseur</option>
              <option value="agent">Agent</option>
              <option value="administrateur">Administrateur</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmer le mot de passe *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            S'inscrire
          </button>
        </form>

        <p style={styles.text}>
          Déjà un compte? <Link to="/login" style={styles.link}>Se connecter</Link>
        </p>
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
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '550px'
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
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
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
    outline: 'none'
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
    marginTop: '10px'
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #fecaca',
    fontWeight: '500'
  },
  success: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #bbf7d0',
    fontWeight: '500'
  },
  text: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#6b7280'
  },
  link: {
    color: '#16a34a',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default Register;