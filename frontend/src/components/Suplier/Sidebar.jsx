import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => {
    return (
        <div style={styles.sidebar}>
            <h2>Espace Fournisseur</h2>

            <button
                onClick={() => setActiveTab('addProduct')}
                style={activeTab === 'addProduct' ? styles.activeButton : styles.menuButton}
            >
                ➕ Ajouter Produit
            </button>

            <button
                onClick={() => setActiveTab('myProducts')}
                style={activeTab === 'myProducts' ? styles.activeButton : styles.menuButton}
            >
                📦 Mes Produits
            </button>

            <button
                onClick={() => setActiveTab('messages')}
                style={activeTab === 'messages' ? styles.activeButton : styles.menuButton}
            >
                💬 Messages
            </button>

            <button onClick={handleLogout} style={styles.logoutButton}>
                Déconnexion
            </button>
        </div>
    );
};

const styles = {
    sidebar: {
        width: '250px',
        backgroundColor: '#1976D2',
        color: 'white',
        padding: '20px'
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
        color: '#1976D2',
        border: 'none',
        borderRadius: '5px',
        fontWeight: 'bold'
    },
    logoutButton: {
        marginTop: '20px',
        padding: '12px',
        width: '100%',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '5px'
    }
};

export default Sidebar;