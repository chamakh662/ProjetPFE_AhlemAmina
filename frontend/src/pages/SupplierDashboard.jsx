import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Suplier/Sidebar';
import AddProductTab from '../components/Suplier/AddProductTab';
import MyProductsTab from '../components/Suplier/ MyProductsTab';
import MessagesTab from '../components/Suplier/MessagesTab';

const SupplierDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('addProduct');

    // States pour AddProductTab
    const [productForm, setProductForm] = useState({
        nom: '',
        description: '',
        code_barre: '',
        origine: '',
        ingredients: '',
        image: '',
        pointsDeVente: []
    });
    const [pointsDeVente, setPointsDeVente] = useState([]);
    const [newPoint, setNewPoint] = useState({ nom: '', adresse: '' });
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={styles.container}>
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
            />

            <div style={styles.content}>
                {activeTab === 'addProduct' && (
                    <AddProductTab
                        user={user}
                        productForm={productForm}
                        setProductForm={setProductForm}
                        pointsDeVente={pointsDeVente}
                        setPointsDeVente={setPointsDeVente}
                        newPoint={newPoint}
                        setNewPoint={setNewPoint}
                        loading={loading}
                        setLoading={setLoading}
                    />
                )}
                {activeTab === 'myProducts' && <MyProductsTab user={user} />}
                {activeTab === 'messages' && <MessagesTab user={user} />}
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