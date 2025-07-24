import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import OverviewPage from './components/OverviewPage';
// Private route wrapper
const ProtectedRoutes: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('access_token');
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header visible on all pages */}
        <Header />
        <main className="pt-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected Routes Group */}
            <Route element={<ProtectedRoutes />}>
              <Route path="/overview" element={<OverviewPage />} />
              {/* <Route path="/report" element={<ReportCard />} />
              <Route path="/feed" element={<Feed />} /> */}
            </Route>

            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
