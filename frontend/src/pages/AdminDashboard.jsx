import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Shared/Sidebar';
import OverviewTab from '../components/Admin/OverviewTab';
import UsersTab from '../components/Admin/UsersTab';
import ProductsTab from '../components/Admin/ProductsTab';
import ReportsTab from '../components/Admin/ReportsTab';
import Messagerie from '../components/Shared/Messagerie';

const API = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [allUsers, setAllUsers] = useState([]);
    const [statsByRole, setStatsByRole] = useState({});
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [fetchError, setFetchError] = useState('');

    // ✅ CORRECTION : useEffect manquant — charge les utilisateurs au montage
    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            setFetchError('');
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API}/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || `Erreur ${res.status}`);
                }

                const users = await res.json();
                setAllUsers(users);

                // ✅ Calcul des stats par rôle depuis la liste reçue
                const stats = users.reduce((acc, u) => {
                    // ✅ Normaliser agent_saisie → agent
                    let role = u.role || 'inconnu';
                    if (role === 'agent_saisie') role = 'agent';

                    acc[role] = (acc[role] || 0) + 1;
                    return acc;
                }, {});
                stats.total = users.length;
                setStatsByRole(stats);

            } catch (err) {
                console.error('❌ Erreur chargement users:', err.message);
                setFetchError(err.message);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, []); // ← se lance une seule fois au montage du composant

    // Gestion de la déconnexion
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Fonction pour afficher le contenu selon l'onglet actif
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <OverviewTab statsByRole={statsByRole} loading={loadingUsers} />;
            case 'users':
                return (
                    <UsersTab
                        allUsers={allUsers}
                        setAllUsers={setAllUsers}
                        statsByRole={statsByRole}
                        loading={loadingUsers}
                    />
                );
            case 'products':
                return <ProductsTab />;
            case 'reports':
                return <ReportsTab />;
            case 'messages':
                return <Messagerie user={user} role="administrateur" />;
            default:
                return <OverviewTab statsByRole={statsByRole} loading={loadingUsers} />;
        }
    };

    return (
        <div style={styles.container}>
            <Sidebar
                role="administrateur"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                user={user}
            />
            <div style={styles.content}>
                {/* Affichage erreur globale de chargement */}
                {fetchError && (
                    <div style={styles.errorBanner}>
                        ⚠️ Impossible de charger les utilisateurs : {fetchError}
                        <button
                            onClick={() => setFetchError('')}
                            style={styles.errorClose}
                        >
                            ✕
                        </button>
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: '30px',
    },
    errorBanner: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '0.5rem',
        color: '#991b1b',
        fontSize: '0.875rem',
        marginBottom: '1rem',
    },
    errorClose: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#991b1b',
        fontWeight: 700,
        fontSize: '1rem',
    },
};

export default AdminDashboard;
