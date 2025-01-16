import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="admin-header">
      <div className="header-content">
        <button
          onClick={onMenuClick}
          className="header-menu-button"
        >
          <Menu className="header-menu-icon" />
        </button>

        <div className="header-user-section">
          <span className="header-username">{user?.username}</span>
          <button
            onClick={logout}
            className="header-logout-button"
          >
            <LogOut className="header-logout-icon" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;