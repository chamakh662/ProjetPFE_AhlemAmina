import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // 🔴 CHARGER LES UTILISATEURS AU MONTAGE
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    setAllUsers(storedUsers);
  }, []);

  // 🔴 FILTRER LES UTILISATEURS
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = 
      u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // 🔴 STATISTIQUES PAR RÔLE
  const statsByRole = {
    total: allUsers.length,
    consommateur: allUsers.filter(u => u.role === 'consommateur').length,
    fournisseur: allUsers.filter(u => u.role === 'fournisseur').length,
    agent: allUsers.filter(u => u.role === 'agent').length,
    administrateur: allUsers.filter(u => u.role === 'administrateur').length
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 🔴 SUPPRIMER UN UTILISATEUR
  const handleDeleteUser = (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const updatedUsers = allUsers.filter(u => u.id !== userId);
      setAllUsers(updatedUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      alert('Utilisateur supprimé avec succès !');
      setShowUserModal(false);
    }
  };

  // 🔴 BLOQUER/DÉBLOQUER UN UTILISATEUR
  const handleToggleBlock = (userId) => {
    const updatedUsers = allUsers.map(u => {
      if (u.id === userId) {
        return { ...u, isBlocked: !u.isBlocked };
      }
      return u;
    });
    setAllUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    alert('Statut de l\'utilisateur mis à jour !');
  };

  // 🔴 VOIR LES DÉTAILS D'UN UTILISATEUR
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const stats = [
    { title: 'Total Utilisateurs', value: statsByRole.total.toString(), change: '+12%', color: '#f59e0b', icon: '👥', trend: 'up' },
    { title: 'Consommateurs', value: statsByRole.consommateur.toString(), change: '+18%', color: '#10b981', icon: '🛒', trend: 'up' },
    { title: 'Fournisseurs', value: statsByRole.fournisseur.toString(), change: '+5%', color: '#3b82f6', icon: '🏭', trend: 'up' },
    { title: 'Agents', value: statsByRole.agent.toString(), change: '+3%', color: '#8b5cf6', icon: '👮', trend: 'up' },
  ];

  const trafficData = [
    { label: 'Consommateurs', value: statsByRole.consommateur, color: '#10b981', total: statsByRole.total },
    { label: 'Fournisseurs', value: statsByRole.fournisseur, color: '#3b82f6', total: statsByRole.total },
    { label: 'Agents', value: statsByRole.agent, color: '#8b5cf6', total: statsByRole.total },
    { label: 'Administrateurs', value: statsByRole.administrateur, color: '#f59e0b', total: statsByRole.total },
  ];

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <span style={styles.logoIcon}>🛡️</span>
          <h2 style={styles.logoText}>AdminPanel</h2>
        </div>
        
        <nav style={styles.nav}>
          <NavItem 
            icon="📊" 
            label="Vue d'ensemble" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon="👥" 
            label="Utilisateurs" 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
            badge={statsByRole.total.toString()}
          />
          <NavItem 
            icon="📦" 
            label="Produits" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
          />
          <NavItem 
            icon="✅" 
            label="Validations" 
            active={activeTab === 'validations'} 
            onClick={() => setActiveTab('validations')} 
          />
          <NavItem 
            icon="🏪" 
            label="Points de vente" 
            active={activeTab === 'sales'} 
            onClick={() => setActiveTab('sales')} 
          />
          <NavItem 
            icon="📈" 
            label="Rapports" 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
          />
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfoSmall}>
            <div style={styles.avatarSmall}>{user?.nom?.[0]?.toUpperCase() || 'A'}</div>
            <div style={styles.userInfoText}>
              <span style={styles.userNameSmall}>{user?.nom || 'Admin'}</span>
              <span style={styles.userRoleSmall}>Administrateur</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={styles.logoutBtnSmall}
          >
            🚪
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              {activeTab === 'dashboard' ? 'Tableau de bord' : 
               activeTab === 'users' ? 'Gestion des Utilisateurs' : 
               `Gestion : ${activeTab}`}
            </h1>
            <p style={styles.headerSubtitle}>
              {activeTab === 'dashboard' ? 'Bienvenue, voici ce qui se passe aujourd hui.' : 
               activeTab === 'users' ? 'Gérez tous les utilisateurs de la plateforme.' : 
               'Le contenu de gestion s\'affichera ici.'}
            </p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.notificationBtn}>
              🔔 
              <span style={styles.badge}>3</span>
            </button>
            <button 
              onClick={handleLogout}
              style={styles.logoutBtnHeader}
            >
              🚪 Déconnexion
            </button>
          </div>
        </header>

        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            {/* STATS CARDS */}
            <div style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <div>
                      <p style={styles.statTitle}>{stat.title}</p>
                      <h3 style={styles.statValue}>{stat.value}</h3>
                    </div>
                    <div style={{...styles.statIconBox, backgroundColor: `${stat.color}20`}}>
                      <span style={{fontSize: '24px'}}>{stat.icon}</span>
                    </div>
                  </div>
                  <div style={{...styles.statFooter, backgroundColor: stat.color}}>
                    <span style={styles.statChange}>
                      {stat.change} {stat.trend === 'up' ? '↗' : '↘'}
                    </span>
                    <span style={styles.statLabel}>depuis le mois dernier</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CHARTS SECTION */}
            <div style={styles.chartsGrid}>
              {/* Chart 1: Activity Graph */}
              <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Activité des Utilisateurs</h3>
                  <select style={styles.select}>
                    <option>Cette semaine</option>
                    <option>Ce mois</option>
                  </select>
                </div>
                <div style={styles.graphContainer}>
                  <svg viewBox="0 0 500 150" style={styles.svgGraph}>
                    <path d="M0,100 C100,50 200,120 300,80 C400,40 500,90 500,20" fill="none" stroke="#3b82f6" strokeWidth="3" />
                    <path d="M0,100 C100,50 200,120 300,80 C400,40 500,90 500,20 V150 H0 Z" fill="url(#gradient)" opacity="0.2" />
                    <defs>
                      <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Chart 2: Donut Chart */}
              <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Répartition des Rôles</h3>
                </div>
                <div style={styles.donutContainer}>
                  <div style={styles.donutChart}>
                    <svg viewBox="0 0 36 36" style={styles.svgDonut}>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${(statsByRole.consommateur / statsByRole.total) * 100}, 100`} />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${(statsByRole.fournisseur / statsByRole.total) * 100}, 100`} strokeDashoffset={`-${(statsByRole.consommateur / statsByRole.total) * 100}`} />
                    </svg>
                    <div style={styles.donutCenter}>
                      <span style={styles.donutValue}>{statsByRole.total}</span>
                      <span style={styles.donutLabel}>Total</span>
                    </div>
                  </div>
                  <div style={styles.legend}>
                    {trafficData.map((item, idx) => (
                      <div key={idx} style={styles.legendItem}>
                        <span style={{...styles.dot, backgroundColor: item.color}}></span>
                        {item.label} ({item.value})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart 3: Progress Bars */}
              <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>État du Système</h3>
                </div>
                <div style={styles.trafficList}>
                  {trafficData.map((item, idx) => (
                    <div key={idx} style={styles.trafficItem}>
                      <div style={styles.trafficHeader}>
                        <span style={styles.trafficLabel}>{item.label}</span>
                        <span style={styles.trafficValue}>{item.value}</span>
                      </div>
                      <div style={styles.progressBarBg}>
                        <div 
                          style={{
                            ...styles.progressBarFill, 
                            width: `${statsByRole.total > 0 ? (item.value / statsByRole.total) * 100 : 0}%`, 
                            backgroundColor: item.color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB: UTILISATEURS */}
        {activeTab === 'users' && (
          <div style={styles.usersContainer}>
            {/* Filtres et Recherche */}
            <div style={styles.usersHeader}>
              <div style={styles.searchBox}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              
              <div style={styles.filterBox}>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">Tous les rôles</option>
                  <option value="consommateur">Consommateurs</option>
                  <option value="fournisseur">Fournisseurs</option>
                  <option value="agent">Agents</option>
                  <option value="administrateur">Administrateurs</option>
                </select>
              </div>
            </div>

            {/* Stats Rapides */}
            <div style={styles.quickStats}>
              <div style={styles.quickStatCard}>
                <span style={styles.quickStatIcon}>🛒</span>
                <div>
                  <span style={styles.quickStatValue}>{statsByRole.consommateur}</span>
                  <span style={styles.quickStatLabel}>Consommateurs</span>
                </div>
              </div>
              <div style={styles.quickStatCard}>
                <span style={styles.quickStatIcon}>🏭</span>
                <div>
                  <span style={styles.quickStatValue}>{statsByRole.fournisseur}</span>
                  <span style={styles.quickStatLabel}>Fournisseurs</span>
                </div>
              </div>
              <div style={styles.quickStatCard}>
                <span style={styles.quickStatIcon}>👮</span>
                <div>
                  <span style={styles.quickStatValue}>{statsByRole.agent}</span>
                  <span style={styles.quickStatLabel}>Agents</span>
                </div>
              </div>
              <div style={styles.quickStatCard}>
                <span style={styles.quickStatIcon}>🛡️</span>
                <div>
                  <span style={styles.quickStatValue}>{statsByRole.administrateur}</span>
                  <span style={styles.quickStatLabel}>Admins</span>
                </div>
              </div>
            </div>

            {/* Tableau des Utilisateurs */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Utilisateur</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Rôle</th>
                    <th style={styles.th}>Date Inscription</th>
                    <th style={styles.th}>Statut</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.noData}>Aucun utilisateur trouvé</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.userInfo}>
                            <div style={styles.userAvatar}>
                              {u.prenom?.[0]?.toUpperCase()}{u.nom?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={styles.userName}>{u.prenom} {u.nom}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.roleBadge,
                            backgroundColor: getRoleColor(u.role)
                          }}>
                            {getRoleLabel(u.role)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: u.isBlocked ? '#fecaca' : '#d1fae5',
                            color: u.isBlocked ? '#dc2626' : '#059669'
                          }}>
                            {u.isBlocked ? '🔒 Bloqué' : '✅ Actif'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button 
                              onClick={() => handleViewUser(u)}
                              style={styles.btnView}
                              title="Voir détails"
                            >
                              👁️
                            </button>
                            <button 
                              onClick={() => handleToggleBlock(u.id)}
                              style={u.isBlocked ? styles.btnUnblock : styles.btnBlock}
                              title={u.isBlocked ? 'Débloquer' : 'Bloquer'}
                            >
                              {u.isBlocked ? '🔓' : '🔒'}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              style={styles.btnDelete}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUTRES TABS (Placeholder) */}
        {['products', 'validations', 'sales', 'reports'].includes(activeTab) && (
          <div style={styles.placeholderContent}>
            <h2>Gestion : {activeTab}</h2>
            <p>Le contenu de gestion pour {activeTab} s'affichera ici.</p>
            <button style={styles.actionButton}>+ Nouvelle Action</button>
          </div>
        )}
      </main>

      {/* 🔴 MODAL DÉTAILS UTILISATEUR */}
      {showUserModal && selectedUser && (
        <div style={styles.modalOverlay} onClick={() => setShowUserModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>👤 Détails Utilisateur</h2>
              <button onClick={() => setShowUserModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.userDetailHeader}>
                <div style={styles.userDetailAvatar}>
                  {selectedUser.prenom?.[0]?.toUpperCase()}{selectedUser.nom?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 style={styles.userDetailName}>{selectedUser.prenom} {selectedUser.nom}</h3>
                  <span style={{
                    ...styles.roleBadge,
                    backgroundColor: getRoleColor(selectedUser.role),
                    marginTop: '0.5rem',
                    display: 'inline-block'
                  }}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                </div>
              </div>

              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Email</label>
                  <p style={styles.detailValue}>{selectedUser.email}</p>
                </div>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Téléphone</label>
                  <p style={styles.detailValue}>{selectedUser.telephone || 'N/A'}</p>
                </div>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Adresse</label>
                  <p style={styles.detailValue}>{selectedUser.adresse || 'N/A'}</p>
                </div>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Date Inscription</label>
                  <p style={styles.detailValue}>
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Statut</label>
                  <p style={styles.detailValue}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: selectedUser.isBlocked ? '#fecaca' : '#d1fae5',
                      color: selectedUser.isBlocked ? '#dc2626' : '#059669',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}>
                      {selectedUser.isBlocked ? '🔒 Bloqué' : '✅ Actif'}
                    </span>
                  </p>
                </div>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>ID Utilisateur</label>
                  <p style={styles.detailValue}>{selectedUser.id}</p>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button 
                  onClick={() => handleToggleBlock(selectedUser.id)}
                  style={selectedUser.isBlocked ? styles.modalBtnUnblock : styles.modalBtnBlock}
                >
                  {selectedUser.isBlocked ? '🔓 Débloquer' : '🔒 Bloquer'}
                </button>
                <button 
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  style={styles.modalBtnDelete}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🔴 Helper Functions
const getRoleColor = (role) => {
  const colors = {
    'consommateur': '#10b981',
    'fournisseur': '#3b82f6',
    'agent': '#8b5cf6',
    'administrateur': '#f59e0b'
  };
  return colors[role] || '#6b7280';
};

const getRoleLabel = (role) => {
  const labels = {
    'consommateur': '🛒 Consommateur',
    'fournisseur': '🏭 Fournisseur',
    'agent': '👮 Agent',
    'administrateur': '🛡️ Admin'
  };
  return labels[role] || role;
};

// NavItem Component
const NavItem = ({ icon, label, active, onClick, badge }) => (
  <button 
    onClick={onClick}
    style={{
      ...styles.navItem,
      backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
      borderLeft: active ? '4px solid #3b82f6' : '4px solid transparent'
    }}
  >
    <span style={styles.navIcon}>{icon}</span>
    <span style={styles.navLabel}>{label}</span>
    {badge && <span style={styles.navBadge}>{badge}</span>}
  </button>
);

// 🎨 STYLES
const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
  },
  sidebar: {
    width: '230px',
    backgroundColor: '#1e293b',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0,
    zIndex: 10
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2.5rem',
    paddingLeft: '0.5rem'
  },
  logoIcon: { fontSize: '1.75rem' },
  logoText: { fontSize: '1.25rem', fontWeight: '700', margin: 0 },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    color: '#94a3b8',
    fontWeight: '500',
    transition: 'all 0.2s',
    position: 'relative',
    width: '100%',
    textAlign: 'left'
  },
  navIcon: { marginRight: '0.75rem', fontSize: '1.2rem' },
  navLabel: { flex: 1 },
  navBadge: {
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '0.7rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '1rem',
    fontWeight: '700'
  },
  sidebarFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    borderTop: '1px solid #334155',
    marginTop: 'auto'
  },
  userInfoSmall: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  avatarSmall: {
    width: '36px', height: '36px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '0.875rem'
  },
  userInfoText: { display: 'flex', flexDirection: 'column' },
  userNameSmall: { fontSize: '0.875rem', fontWeight: '600', color: 'white' },
  userRoleSmall: { fontSize: '0.75rem', color: '#94a3b8' },
  logoutBtnSmall: {
    background: 'transparent',
    border: '1px solid #334155',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    transition: 'all 0.2s'
  },
  mainContent: {
    flex: 1,
    marginLeft: '260px',
    padding: '2rem',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  headerTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.25rem 0' },
  headerSubtitle: { color: '#64748b', margin: 0 },
  headerActions: { display: 'flex', gap: '1rem', alignItems: 'center' },
  notificationBtn: {
    position: 'relative',
    background: 'white',
    border: '1px solid #e2e8f0',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1.2rem'
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '0.65rem',
    padding: '0.15rem 0.35rem',
    borderRadius: '50%',
    border: '2px solid white'
  },
  logoutBtnHeader: {
    backgroundColor: '#e2e8f0',
    color: '#1e293b',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    transition: 'all 0.2s'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '140px'
  },
  statHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  statTitle: { color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.5rem 0', fontWeight: '500' },
  statValue: { fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  statIconBox: {
    width: '48px', height: '48px',
    borderRadius: '0.75rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  statFooter: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem'
  },
  statChange: { fontWeight: '700', fontSize: '0.875rem' },
  statLabel: { fontSize: '0.75rem', opacity: 0.9 },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  cardTitle: { fontSize: '1.125rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  select: {
    padding: '0.35rem 0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    cursor: 'pointer'
  },
  graphContainer: {
    position: 'relative',
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },
  svgGraph: { width: '100%', height: '150px' },
  svgDonut: { transform: 'rotate(-90deg)', width: '100%', height: '100%' },
  donutContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  donutChart: { position: 'relative', width: '150px', height: '150px' },
  donutCenter: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  donutValue: { display: 'block', fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' },
  donutLabel: { fontSize: '0.75rem', color: '#64748b' },
  legend: { marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#64748b' },
  dot: { width: '10px', height: '10px', borderRadius: '50%' },
  trafficList: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  trafficItem: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  trafficHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' },
  trafficLabel: { color: '#64748b', fontWeight: '500' },
  trafficValue: { color: '#1e293b', fontWeight: '700' },
  progressBarBg: {
    width: '100%', height: '8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBarFill: { height: '100%', borderRadius: '4px', transition: 'width 1s ease-in-out' },
  
  // 🔴 Styles pour la gestion des utilisateurs
  usersContainer: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  usersHeader: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap'
  },
  searchBox: {
    flex: 1,
    minWidth: '250px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem'
  },
  searchIcon: { marginRight: '0.5rem', fontSize: '1rem' },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.875rem'
  },
  filterBox: {
    minWidth: '200px'
  },
  filterSelect: {
    width: '100%',
    padding: '0.5rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  quickStatCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0'
  },
  quickStatIcon: { fontSize: '1.5rem' },
  quickStatValue: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b'
  },
  quickStatLabel: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    borderBottom: '2px solid #e2e8f0'
  },
  tr: {
    borderBottom: '1px solid #e2e8f0',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '1rem',
    fontSize: '0.875rem',
    color: '#1e293b'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  userName: {
    fontWeight: '600',
    color: '#1e293b'
  },
  roleBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white'
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  btnView: {
    padding: '0.375rem 0.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  btnBlock: {
    padding: '0.375rem 0.5rem',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  btnUnblock: {
    padding: '0.375rem 0.5rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  btnDelete: {
    padding: '0.375rem 0.5rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  noData: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b',
    fontStyle: 'italic'
  },
  placeholderContent: {
    backgroundColor: 'white',
    padding: '3rem',
    borderRadius: '1rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  actionButton: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600'
  },
  
  // 🔴 Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '85vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#64748b'
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  userDetailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem'
  },
  userDetailAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.25rem'
  },
  userDetailName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: '0.875rem',
    color: '#1e293b',
    margin: 0
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0'
  },
  modalBtnBlock: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600'
  },
  modalBtnUnblock: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600'
  },
  modalBtnDelete: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

export default AdminDashboard;