import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => (
    <div style={styles.sidebar}>
        <h2>Espace Agent</h2>
        <button onClick={() => setActiveTab('overview')} style={activeTab === 'overview' ? styles.activeButton : styles.menuButton}>📊 Vue d'ensemble</button>
        <button onClick={() => setActiveTab('products')} style={activeTab === 'products' ? styles.activeButton : styles.menuButton}>📦 Gérer Produits</button>
        <button onClick={() => setActiveTab('notifications')} style={activeTab === 'notifications' ? styles.activeButton : styles.menuButton}>📩 Messagerie</button>
        <button onClick={() => setActiveTab('aiAnalysis')} style={activeTab === 'aiAnalysis' ? styles.activeButton : styles.menuButton}>🤖 Analyse IA</button>
        <button onClick={() => setActiveTab('profile')} style={activeTab === 'profile' ? styles.activeButton : styles.menuButton}>👤 Mon Profil</button>
        <button onClick={onLogout} style={styles.logoutButton}>Déconnexion</button>
    </div>
);

const styles = {
    sidebar: { width: '250px', backgroundColor: '#FF9800', color: 'white', padding: '20px' },
    menuButton: { width: '100%', padding: '12px', marginBottom: '10px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '5px', cursor: 'pointer', textAlign: 'left' },
    activeButton: { width: '100%', padding: '12px', marginBottom: '10px', backgroundColor: 'white', border: 'none', color: '#FF9800', borderRadius: '5px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' },
    logoutButton: { width: '100%', padding: '12px', marginTop: '20px', backgroundColor: '#f44336', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' }
};

export default Sidebar;