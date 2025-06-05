
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import DeviceStorageForm from './components/forms/DeviceStorageForm';
import GatePassForm from './components/forms/GatePassForm';
import VMSDashboardLayout from './components/vms/VMSDashboardLayout';
import VMSHomePage from './components/vms/VMSHomePage';
import VMSAddRecordPage from './components/vms/VMSAddRecordPage';
import VMSVisitorListPage from './components/vms/VMSVisitorListPage';
import VMSReportsPage from './components/vms/VMSReportsPage';
import VMSUserRegistrationPage from './components/vms/VMSUserRegistrationPage'; 
import VMSAddDocumentPage from './components/vms/VMSAddDocumentPage';
// VMSRegisterUserPage (placeholder) is removed as its functionality is merged
import { getAuthToken, removeAuthToken } from './services/tokenService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    removeAuthToken();
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  }, []);
  

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
        />
        
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/dashboard/device-storage" 
          element={isAuthenticated ? <DeviceStorageForm onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/dashboard/gate-pass" 
          element={isAuthenticated ? <GatePassForm onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />

        <Route 
          path="/vms" 
          element={isAuthenticated ? <VMSDashboardLayout onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<VMSHomePage />} />
          <Route path="add-record" element={<VMSAddRecordPage />} />
          <Route path="visitor-list" element={<VMSVisitorListPage />} />
          <Route path="reports" element={<VMSReportsPage />} />
          {/* Path for "Register User" */}
          <Route path="add-image" element={<VMSUserRegistrationPage />} /> 
          <Route path="add-document" element={<VMSAddDocumentPage />} />
          {/* Removed old /vms/register-user route */}
        </Route>

        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
