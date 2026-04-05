import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Shared/Sidebar';   // ✅ modifié
import AddProductTab from '../components/Shared/AddProductTab';
import MyProductsTab from '../components/Suplier/ MyProductsTab';
import Notifications, { useUnreadCount } from '../components/Suplier/Notifications'; // ✅ hook importé
import Messagerie from '../components/Shared/Messagerie';

const SupplierDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('addProduct');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // ✅ callback après ajout produit
    const handleProductAdded = () => {
        setActiveTab('myProducts'); // redirige vers mes produits
    };

    // ✅ récupérer le nombre de notifications non lues
    const unreadCount = useUnreadCount(user?.id);

    return (
        <div style={styles.container}>
            <Sidebar
                role="fournisseur"              // ✅ ajouté
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}         // ✅ renommé pour cohérence
                unreadCount={unreadCount}       // ✅ ajouté
                user={user}
            />

            <div style={styles.content}>
                {activeTab === 'addProduct' && (
                    <AddProductTab
                        user={user}
                        role="fournisseur"
                        onSuccess={handleProductAdded}
                    />
                )}

                {activeTab === 'myProducts' && <MyProductsTab user={user} />}

                {activeTab === 'messages' && (
                    <Messagerie user={user} role="fournisseur" />
                )}

                {activeTab === 'notifications' && (
                    <Notifications user={user} />
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    },
    content: {
        flex: 1,
        padding: '30px'
    }
};

export default SupplierDashboard;
