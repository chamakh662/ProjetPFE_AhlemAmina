import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Sidebar from '../../src/components/Shared/Sidebar';
import OverviewTab from '../../src/components/Admin/OverviewTab';
import UsersTab from '../../src/components/Admin/UsersTab';
import ProductsTab from '../../src/components/Admin/ProductsTab';
import ReportsTab from '../../src/components/Admin/ReportsTab';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [allUsers, setAllUsers] = useState([]);

    // ── Charger les utilisateurs ──────────────────────────────────────────
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        setAllUsers(stored);
    }, []);

    const handleLogout = () => { logout(); navigate('/'); };

    // ── Statistiques par rôle (passées aux composants enfants) ────────────
    const statsByRole = {
        total: allUsers.length,
        consommateur: allUsers.filter(u => u.role === 'consommateur').length,
        fournisseur: allUsers.filter(u => u.role === 'fournisseur').length,
        agent: allUsers.filter(u => u.role === 'agent').length,
        administrateur: allUsers.filter(u => u.role === 'administrateur').length,
    };

    // ── Titre de l'onglet actif ───────────────────────────────────────────
    const tabTitles = {
        dashboard: "Tableau de bord",
        users: "Gestion des Utilisateurs",
        products: "Gestion des Produits",
        reports: "Rapports",
    };
    const tabSubtitles = {
        dashboard: "Bienvenue, voici ce qui se passe aujourd'hui.",
        users: "Gérez tous les utilisateurs de la plateforme.",
        products: "Consultez tous les produits de la plateforme.",
        reports: "Messages et rapports reçus.",
    };

    return (
        <div style={styles.layout}>
            {/* ── Sidebar ── */}
            <Sidebar
                role="admin"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                user={user}
                extraBadges={{ users: statsByRole.total }}
            />

            {/* ── Contenu principal ── */}
            <main style={styles.main}>
                {/* Header */}
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.headerTitle}>{tabTitles[activeTab]}</h1>
                        <p style={styles.headerSubtitle}>{tabSubtitles[activeTab]}</p>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        🚪 Déconnexion
                    </button>
                </header>

                {/* Onglets */}
                {activeTab === 'dashboard' && (
                    <OverviewTab statsByRole={statsByRole} />
                )}
                {activeTab === 'users' && (
                    <UsersTab
                        allUsers={allUsers}
                        setAllUsers={setAllUsers}
                        statsByRole={statsByRole}
                    />
                )}
                {activeTab === 'products' && (
                    <ProductsTab />
                )}
                {activeTab === 'reports' && (
                    <ReportsTab />
                )}
            </main>
        </div>
    );
};

const styles = {
    layout: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    main: {
        flex: 1,
        padding: '2rem',
        overflowY: 'auto',
        minWidth: 0, // ✅ évite le débordement flex
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    headerTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1e293b',
        margin: '0 0 0.25rem 0',
    },
    headerSubtitle: {
        color: '#64748b',
        margin: 0,
        fontSize: '0.875rem',
    },
    logoutBtn: {
        backgroundColor: '#e2e8f0',
        color: '#1e293b',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.875rem',
    },
};

export default AdminDashboard;