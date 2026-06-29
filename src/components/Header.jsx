import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Header.css';

const Header = ({ signOut, user }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <img src={logo} alt="RapidAid Logo" className="logo-image" />
            <h1>RapidAid</h1>
          </Link>
        </div>
        <nav className="header-nav">
          <Link 
            to="/submit" 
            className={`nav-link ${isActive('/submit') || isActive('/') ? 'active' : ''}`}
          >
            Submit Request
          </Link>
          <Link
            to="/dashboard"
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          {signOut && (
            <button type="button" className="nav-link sign-out-btn" onClick={signOut}>
              Sign out{user?.signInDetails?.loginId ? ` (${user.signInDetails.loginId})` : ''}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;