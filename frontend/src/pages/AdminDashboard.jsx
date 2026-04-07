import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Shared/Sidebar';
import OverviewTab from '../components/Admin/OverviewTab';
import UsersTab from '../components/Admin/UsersTab';
import ProductsTab from '../components/Admin/ProductsTab';
import ReportsTab from '../components/Admin/ReportsTab';
import Messagerie from '../components/Shared/Messagerie';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [allUsers, setAllUsers] = useState([]);
    const [statsByRole, setStatsByRole] = useState({});
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Gestion de la déconnexion
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Fonction pour afficher le contenu selon l'onglet actif
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <OverviewTab statsByRole={statsByRole} />;
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
                return <OverviewTab statsByRole={statsByRole} />;
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
            <div style={styles.content}>{renderContent()}</div>
        </div>
    );
};

// Styles inline (comme pour AgentDashboard)
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
};

export default AdminDashboard;