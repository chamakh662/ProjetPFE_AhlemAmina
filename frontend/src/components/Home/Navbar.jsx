// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({
  user,
  favoritesCount = 0,
  onFavoritesClick,
  onHistoryClick,
  onProfileClick,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ✅ Responsive correct : écoute le resize en temps réel
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ferme le menu mobile quand on passe en desktop
  useEffect(() => {
    if (!isMobile) setIsMobileMenuOpen(false);
  }, [isMobile]);

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>

        {/* Logo */}
        <div style={styles.logo} onClick={() => navigate('/')}>
          <img
            src="/logo.png"
            alt="BioScan Logo"
            style={styles.logoImage}
          />

          <img
            src="/BioScan1.png"   // ton deuxième logo
            alt="Second Logo"
            style={styles.logoImage}
          />
        </div>

        {/* Liens centraux — masqués sur mobile */}
        {!isMobile && (
          <div style={styles.navLinks}>
            {user?.role === 'consommateur' && (
              <button style={styles.navLink} onClick={onFavoritesClick}>
                ❤️ Favoris {favoritesCount > 0 && `(${favoritesCount})`}
              </button>
            )}
            {user?.role === 'consommateur' && (
              <button style={styles.navLink} onClick={onHistoryClick}>
                📋 Historique
              </button>
            )}
          </div>
        )}

        {/* Actions droite — masquées sur mobile */}
        {!isMobile && (
          <div style={styles.navActions}>
            {user ? (
              <>
                <button style={styles.btnProfile} onClick={onProfileClick}>
                  👤 {user.prenom || 'Mon Profil'}
                </button>
                <button style={styles.btnLogout} onClick={onLogout}>
                  🚪 Déconnexion
                </button>
              </>
            ) : (
              <>
                <button style={styles.btnLogin} onClick={() => navigate('/login')}>
                  Connexion
                </button>
                <button style={styles.btnRegister} onClick={() => navigate('/register')}>
                  Inscription
                </button>
              </>
            )}
          </div>
        )}

        {/* Burger icon — visible sur mobile uniquement */}
        {isMobile && (
          <button
            style={styles.burgerBtn}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        )}
      </div>

      {/* Menu déroulant mobile */}
      {isMobile && isMobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <button style={styles.mobileLink} onClick={() => { onFavoritesClick(); setIsMobileMenuOpen(false); }}>
            ❤️ Favoris {favoritesCount > 0 && `(${favoritesCount})`}
          </button>
          <button style={styles.mobileLink} onClick={() => { onHistoryClick(); setIsMobileMenuOpen(false); }}>
            📋 Historique
          </button>
          {user ? (
            <>
              <button style={styles.mobileLink} onClick={() => { onProfileClick(); setIsMobileMenuOpen(false); }}>
                👤 Mon Profil
              </button>
              <button style={{ ...styles.mobileLink, color: '#ef4444' }} onClick={onLogout}>
                🚪 Déconnexion
              </button>
            </>
          ) : (
            <>
              <button style={styles.mobileLink} onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>
                Connexion
              </button>
              <button style={styles.mobileLink} onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}>
                Inscription
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0.85rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },

  logoImage: {
    height: '38px',      // taille claire et visible
    width: 'auto',
    objectFit: 'contain', // évite la déformation
  },

  logoImageSmall: {
    height: '45px',
    width: 'auto',
    objectFit: 'contain',
    opacity: 0.9          // léger effet propre
  },

  navLinks: { display: 'flex', gap: '1.25rem' },
  navLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '0.95rem', color: '#4b5563', fontWeight: '500',
    padding: '0.4rem 0.6rem', borderRadius: '0.4rem',
    transition: 'background 0.15s',
  },
  navActions: { display: 'flex', gap: '0.6rem', alignItems: 'center' },
  btnLogin: {
    padding: '0.45rem 1.1rem', borderRadius: '0.5rem',
    border: '1.5px solid #16a34a', backgroundColor: 'white',
    color: '#16a34a', cursor: 'pointer', fontWeight: '500',
  },
  btnRegister: {
    padding: '0.45rem 1.1rem', borderRadius: '0.5rem',
    border: 'none', backgroundColor: '#16a34a',
    color: 'white', cursor: 'pointer', fontWeight: '500',

  },
  btnProfile: {
    padding: '0.45rem 1.1rem', borderRadius: '0.5rem',
    border: 'none', backgroundColor: '#16a34a',
    color: 'white', cursor: 'pointer', fontWeight: '500',

  },
  btnLogout: {
    padding: '0.45rem 1.1rem', borderRadius: '0.5rem',
    border: 'none', backgroundColor: '#ef4444',
    color: 'white', cursor: 'pointer', fontWeight: '500',
  },
  burgerBtn: {
    background: 'none', border: 'none', fontSize: '1.6rem',
    cursor: 'pointer', color: '#374151', lineHeight: 1,

  },
  mobileMenu: {
    display: 'flex', flexDirection: 'column',
    padding: '0.75rem 1.5rem 1rem',
    borderTop: '1px solid #f3f4f6',
    gap: '0.25rem',
    backgroundColor: '#ffffff',
  },
  mobileLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    textAlign: 'left', padding: '0.6rem 0.25rem',
    fontSize: '1rem', color: '#374151', fontWeight: '500',
    borderBottom: '1px solid #f3f4f6',
  },
};

export default Navbar;
