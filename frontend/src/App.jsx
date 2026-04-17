import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages - Lazy Loaded
const Home = lazy(() => import('./pages/Home'));
const CarInventory = lazy(() => import('./pages/CarInventory'));
const CarDetails = lazy(() => import('./pages/CarDetails'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const EditCar = lazy(() => import('./pages/EditCar'));
const Account = lazy(() => import('./pages/Account'));

// Placeholder Loading Component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh',
    flexDirection: 'column',
    gap: '1rem',
    color: 'var(--text-secondary)'
  }}>
    <div className="spinner" style={{
      width: '40px',
      height: '40px',
      border: '3px solid var(--border-color)',
      borderTopColor: 'var(--accent-color)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
    <p>Loading...</p>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main className="main-content" style={{ flex: 1 }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inventory" element={<CarInventory />} />
                <Route path="/car/:id" element={<CarDetails />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/edit/:id" element={<EditCar />} />
                <Route path="/account" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
