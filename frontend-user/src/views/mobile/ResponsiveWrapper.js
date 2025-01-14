import React, { useState, useEffect } from 'react';
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

  // Add these handlers to fix the button clicks
  const handleUserClick = (e) => {
    e.stopPropagation();
    if (onToggleUser) onToggleUser();
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    if (onToggleCart) onToggleCart();
  };

  return (
    <div className="mobile-layout">
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
        <button onClick={handleSearchToggle} className="search-button">
          <Search size={24} />
        </button>
      </header>

      <main>
        {children}
      </main>

      <nav className="bottom-nav">
        {user ? (
          <button onClick={handleUserClick}>
            <User size={24} />
          </button>
        ) : (
          <button onClick={handleUserClick}>
            <User size={24} />
          </button>
        )}

        <button onClick={handleCartClick}>
          <ShoppingCart size={24} />
          {cartItemsCount > 0 && (
            <span className="cart-badge">{cartItemsCount}</span>
          )}
        </button>
      </nav>
    </div>
  );
};

const ResponsiveWrapper = ({ children, ...props }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobileLayout {...props}>{children}</MobileLayout>;
  }

  return children;
};

export default ResponsiveWrapper;