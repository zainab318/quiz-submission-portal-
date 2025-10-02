import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { 
  Brain, 
  Home, 
  BookOpen, 
  Trophy, 
  LogIn, 
  LogOut,
  ChevronDown,
  Settings,
  BarChart3
} from 'lucide-react';
import './Header.css';

function Header() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <Brain className="logo-icon" />
            <span className="logo-text">Quiz Portal</span>
          </Link>
          
          <nav className="nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            
            {isAuthenticated && (
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <BarChart3 size={20} />
                <span>Dashboard</span>
              </Link>
            )}
            
            <Link 
              to="/quiz-selection" 
              className={`nav-link ${isActive('/quiz-selection') ? 'active' : ''}`}
            >
              <BookOpen size={20} />
              <span>Quizzes</span>
            </Link>
            
            <Link 
              to="/results" 
              className={`nav-link ${isActive('/results') ? 'active' : ''}`}
            >
              <Trophy size={20} />
              <span>Results</span>
            </Link>
          </nav>

          <div className="auth-section">
            {isAuthenticated ? (
              <div className="user-menu">
                <button 
                  className="user-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <Avatar 
                    src={user?.avatar} 
                    alt={user?.name || 'User'}
                    size={32}
                    className="user-avatar-small"
                    forceInitials={true}
                  />
                  <span className="user-name">{user?.name}</span>
                  <ChevronDown size={16} className={`chevron ${showUserMenu ? 'open' : ''}`} />
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link 
                      to="/dashboard" 
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <BarChart3 size={18} />
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={18} />
                      Profile
                    </Link>
                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
