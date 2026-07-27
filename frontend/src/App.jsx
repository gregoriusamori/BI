import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import BIPage from './pages/BIPage';
import IntegrationPage from './pages/IntegrationPage';
import MiningPage from './pages/MiningPage';
import ClusterPage from './pages/ClusterPage';
import ReportPage from './pages/ReportPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import SearchPage from './pages/SearchPage';
import DrillDownPage from './pages/DrillDownPage';
import DataQualityPage from './pages/DataQualityPage';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/bi" element={<ProtectedRoute><DashboardLayout><BIPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/integration" element={<ProtectedRoute><DashboardLayout><IntegrationPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/mining" element={<ProtectedRoute><DashboardLayout><MiningPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/clusters" element={<ProtectedRoute><DashboardLayout><ClusterPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><DashboardLayout><ReportPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/data-quality" element={<ProtectedRoute><DashboardLayout><DataQualityPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><DashboardLayout><SearchPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/drilldown" element={<ProtectedRoute><DashboardLayout><DrillDownPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
