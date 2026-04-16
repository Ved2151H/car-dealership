import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import CarInventory from './pages/CarInventory';
import CarDetails from './pages/CarDetails';

import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

import EditCar from './pages/EditCar';
import Account from './pages/Account';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main className="main-content" style={{ flex: 1 }}>
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
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
