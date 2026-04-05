import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import ConsumerDashboard from './components/dashboard/ConsumerDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'administrateur':
      return <Navigate to="/dashboard/AdminDashboard" replace />;
    case 'consommateur':
      return <Navigate to="/" replace />;  // 🔴 CONSOMMATEUR RESTE SUR HOME
    case 'fournisseur':
      return <Navigate to="/" replace />;
    case 'agent':
      return <Navigate to="/" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

const PublicHome = () => {
  const { user } = useAuth();

  if (user?.role === 'administrateur') {
    return <Navigate to="/dashboard/AdminDashboard" replace />;
  }

  return <Home />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard/AdminDashboard" element={<AdminDashboard />} />
          {/* Alias pour éviter page blanche si on tape /dashboard/administrateur */}
          <Route path="/dashboard/administrateur" element={<Navigate to="/dashboard/AdminDashboard" replace />} />
          <Route path="/dashboard/ConsumerDashboard" element={<ConsumerDashboard />} />
          <Route path="/dashboard/SupplierDashboard" element={<SupplierDashboard />} />
          <Route path="/dashboard/AgentDashboard" element={<AgentDashboard />} />
          <Route path="/redirect" element={<RoleBasedRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;