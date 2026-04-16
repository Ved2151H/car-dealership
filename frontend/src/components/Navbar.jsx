import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleAuthChange = () => setUser(JSON.parse(localStorage.getItem('user')));
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('user-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('user-auth-change', handleAuthChange);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-auth-change'));
    setMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        {/* Logo — left */}
        <div className="navbar-logo">
          <Link to="/" className="heading-gradient" onClick={closeMenu}>
            NewRoyalCars
          </Link>
        </div>

        {/* Desktop links — middle/right. CSS hides this on mobile */}
        <div className="navbar-links">
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <Link to="/inventory">Inventory</Link>
          {user?.role === 'admin' && <Link to="/admin">Dashboard</Link>}
          {user ? (
            <>
              <Link to="/account">Account</Link>
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: '0.45rem 1rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '0.45rem 1rem' }}>
              Login
            </Link>
          )}
        </div>

        {/* Hamburger — right on mobile. CSS shows this on mobile only */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span style={{
            transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
          }} />
          <span style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'scaleX(0)' : 'none' }} />
          <span style={{
            transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
          }} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`navbar-mobile-menu${menuOpen ? ' open' : ''}`}>
        <Link to="/inventory" onClick={closeMenu}>🚗 Inventory</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" onClick={closeMenu}>⚙️ Dashboard</Link>
        )}
        {user ? (
          <>
            <Link to="/account" onClick={closeMenu}>👤 Account</Link>
            <button onClick={handleLogout} style={{ color: 'var(--error-color)' }}>
              🚪 Logout
            </button>
          </>
        ) : (
          <Link to="/login" onClick={closeMenu}>🔑 Login</Link>
        )}
        <button
          onClick={() => { toggleTheme(); closeMenu(); }}
          style={{ color: 'var(--text-secondary)' }}
        >
          {theme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
        </button>
      </div>
    </>
  );
};

export default Navbar;
