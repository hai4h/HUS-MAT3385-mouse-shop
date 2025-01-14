import React, { useState } from 'react';
import { Search, ShoppingCart, User } from 'lucide-react';

const MobileLayout = ({ 
  onSearch,
  onToggleCart,
  onToggleUser,
  cartItemsCount,
  user,
  children 
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      setTimeout(() => {
        const searchInput = document.querySelector('.mobile-search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    } else {
      setSearchQuery('');
      if (onSearch) onSearch('');
    }
  };

  const handleUserClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleUser) {
      onToggleUser();
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleCart) {
      onToggleCart();
    }
  };

  return (
    <div className="mobile-layout">
      {/* Header */}
      <header>
        <div className="logo">X</div>
        
        <div className={`search-container ${isSearchActive ? 'active' : ''}`}>
          {isSearchActive && (
            <input
              type="text"
              className="mobile-search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          )}
        </div>

        <button 
          onClick={handleSearchToggle}
          className="search-button"
        >
          <Search size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className="nav-button user-button"
          onClick={handleUserClick}
        >
          <User size={24} />
        </button>

        <button 
          className="nav-button cart-button"
          onClick={handleCartClick}
        >
          <ShoppingCart size={24} />
          {cartItemsCount > 0 && (
            <span className="cart-badge">{cartItemsCount}</span>
          )}
        </button>
      </nav>
    </div>
  );
};

export default MobileLayout;