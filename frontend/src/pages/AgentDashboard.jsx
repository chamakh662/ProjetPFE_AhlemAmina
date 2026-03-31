import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Agent/Sidebar';
import OverviewTab from '../components/Agent/OverviewTabl';
import NotificationsTab from '../components/Agent/Messagerie';
import ProductsTab from '../components/Agent/ProductsTab';
import ProfileTab from '../components/Agent/ProfileTab';
import AiAnalysisTab from '../components/Agent/AiAnalysisTab';

const AgentDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'notifications': return <NotificationsTab />;
      case 'products': return <ProductsTab />;
      case 'aiAnalysis': return <AiAnalysisTab />;
      case 'profile': return <ProfileTab user={user} updateUser={updateUser} />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <div style={styles.content}>{renderContent()}</div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' },
  content: { flex: 1, padding: '30px' }
};

export default AgentDashboard;