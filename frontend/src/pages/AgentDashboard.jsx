import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import './Dashboard.css';

import Sidebar from '../components/Shared/Sidebar';   // ✅ modifié
import OverviewTab from '../components/Agent/OverviewTabl';
import ProfileTab from '../components/Agent/ProfileTab';
import AiAnalysisTab from '../components/Agent/AiAnalysisTab';
import Messagerie from '../components/Shared/Messagerie';
import ProductManagement from '../components/Agent/ProductManagement';

const AgentDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'messages': return <Messagerie user={user} role="agent" />;
      case 'products': return <ProductManagement />;
      case 'aiAnalysis': return <AiAnalysisTab />;
      case 'profile': return <ProfileTab user={user} updateUser={updateUser} />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="dashboardContainer">
      <button
        className="mobileMenuButton"
        type="button"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FiMenu size={20} />
      </button>
      <Sidebar
        role="agent"
        activeTab={activeTab}
        setActiveTab={(key) => { setActiveTab(key); setIsSidebarOpen(false); }}
        onLogout={handleLogout}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div
        className={`dashboardOverlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div className="dashboardContent">{renderContent()}</div>
    </div>
  );
};

export default AgentDashboard;
