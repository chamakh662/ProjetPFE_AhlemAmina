import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Suplier/Sidebar';
import AddProductTab from '../components/Shared/AddProcuctTab';
import MyProductsTab from '../components/Suplier/ MyProductsTab';
import Notifications from '../components/Suplier/Notifications';
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

    return (
        <div style={styles.container}>
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
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