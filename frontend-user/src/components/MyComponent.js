import React, { Component } from "react";
import authService from "../services/authService";
import axiosInstance from "../services/axiosConfig";

import "../views/App.scss";
import "../views/productpage/ProductPage.scss"
import "../views/login-signup/LoginSignup.scss"
import "../views/user/UserSidebar.scss"

import LoginForm from "../views/login-signup/LoginForm";
import SignupForm from "../views/login-signup/SignupForm";
import UserSidebar from "../views/user/UserSidebar";
import Cart from "../views/productpage/Cart";
import ProductPage from "../views/productpage/ProductPage";

import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSearch: false,
      showLogin: false,
      showSignup: false,
      showCart: false,
      showUserSidebar: false,
      cartItems: [],
      user: authService.getCurrentUser(),
      searchQuery: ""
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick);
    // Kiểm tra token ngay khi component mount
    this.checkAndUpdateUserAuth();
    // Thiết lập kiểm tra định kỳ
    this.setupTokenCheck();
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }

  // Thêm method mới để kiểm tra và cập nhật trạng thái authentication
  checkAndUpdateUserAuth = () => {
    const currentUser = authService.getCurrentUser();
    
    if (currentUser && !authService.isTokenExpired()) {
      // Token hợp lệ, cập nhật state
      this.setState({ user: currentUser });
    } else if (currentUser) {
      // Token đã hết hạn, xóa user data
      authService.logout();
      this.setState({ user: null });
    }
  };

  setupTokenCheck = () => {
    // Clear interval cũ nếu có
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    
    // Thiết lập interval mới (30 giây)
    this.tokenCheckInterval = setInterval(() => {
      this.checkAndUpdateUserAuth();
    }, 30000);
  };

  toggleSearch = (event) => {
    event.stopPropagation();
    this.setState(prevState => ({
      showSearch: !prevState.showSearch,
      showLogin: false,
      showSignup: false,
      showCart: false,
      showUserSidebar: false
    }));
  };

  toggleLogin = () => {
    this.setState(prevState => ({
      showLogin: !prevState.showLogin,
      showSignup: false,
      showSearch: false,
      showCart: false,
      showUserSidebar: false
    }));
  };

  toggleSignup = () => {
    this.setState(prevState => ({
      showSignup: !prevState.showSignup,
      showLogin: false,
      showSearch: false,
      showCart: false,
      showUserSidebar: false
    }));
  };

  toggleCart = () => {
    this.setState(prevState => ({
      showCart: !prevState.showCart,
      showSearch: false,
      showLogin: false,
      showSignup: false,
      showUserSidebar: false
    }));
  };

  toggleUserSidebar = () => {
    this.setState(prevState => ({
      showUserSidebar: !prevState.showUserSidebar,
      showSearch: false,
      showLogin: false,
      showSignup: false,
      showCart: false
    }));
  };

  handleLoginSuccess = async (userData) => {
    try {
      await this.setState({ 
        user: userData,
        showLogin: false,
        showSignup: false
      });
      
      this.setupTokenCheck();
    } catch (error) {
      console.error('Error handling login success:', error);
    }
  };

  handleSignupSuccess = async (userData) => {
    try {
      await this.setState({ 
        user: userData,
        showLogin: false,
        showSignup: false
      });
      
      this.setupTokenCheck();
    } catch (error) {
      console.error('Error handling signup success:', error);
    }
  };

  handleLogout = () => {
    this.setState({ showUserSidebar: false }, () => {
      setTimeout(() => {
        if (this.tokenCheckInterval) {
          clearInterval(this.tokenCheckInterval);
        }
        authService.logout();
        this.setState({ user: null });
      }, 300);
    });
  };

  handleDocumentClick = (event) => {
    const searchContainer = event.target.closest('.search-input-container');
    const searchIcon = event.target.closest('.icon.search');
    const cartContainer = event.target.closest('.cart-sidebar');
    const cartIcon = event.target.closest('.icon.cart');
    const userSidebarContainer = event.target.closest('.sidebar-container');
    const userIcon = event.target.closest('.icon.user');
    const authContainer = event.target.closest('.login-signup-sidebar');
    const authIcon = event.target.closest('.icon.login');
    
    if (!searchContainer && !searchIcon && this.state.showSearch) {
      this.setState({ showSearch: false });
    }

    if (!cartContainer && !cartIcon && this.state.showCart) {
      this.setState({ showCart: false });
    }

    if (!userSidebarContainer && !userIcon && this.state.showUserSidebar) {
      this.setState({ showUserSidebar: false });
    }

    if (!authContainer && !authIcon && (this.state.showLogin || this.state.showSignup)) {
      this.setState({ 
        showLogin: false,
        showSignup: false
      });
    }
  };

  render() {
    const { 
      showSearch, 
      showLogin,
      showSignup, 
      showCart, 
      showUserSidebar, 
      cartItems, 
      user,
      searchQuery 
    } = this.state;

    return (
      <div className="app">
        <div className={`overlay ${(showLogin || showSignup || showCart || showUserSidebar) ? 'active' : ''}`} />

        <header className="header">
          <div className="logo">X</div>
          
          <div className={`search-input-container ${!showSearch ? 'hidden' : ''}`}>
            <input 
              type="text" 
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => this.setState({ searchQuery: e.target.value })}
              autoFocus={showSearch}
            />
          </div>

          <div className="header-icons">
            <span className="icon search" onClick={this.toggleSearch}>
              <SearchIcon style={{ color: "red" }} />
            </span>
            
            {user ? (
              <span className="icon user" onClick={this.toggleUserSidebar}>
                <AccountCircleIcon style={{ color: "red" }} />
              </span>
            ) : (
              <span className="icon login" onClick={this.toggleLogin}>
                <AccountCircleIcon style={{ color: "red" }} />
              </span>
            )}

            <span className="icon cart" onClick={this.toggleCart}>
              <ShoppingCartIcon style={{ color: "red" }} />
              {cartItems.length > 0 && (
                <span className="cart-badge">{cartItems.length}</span>
              )}
            </span>
          </div>
        </header>

        <ProductPage onAddToCart={this.addToCart} />

        <div className={`login-signup-sidebar ${showLogin || showSignup ? 'active' : ''}`}>
          <div className="form-toggle">
            <button
              className={`toggle-btn ${showLogin ? "active" : ""}`}
              onClick={() => this.setState({ 
                showLogin: true, 
                showSignup: false,
                error: null 
              })}
            >
              Login
            </button>
            <button
              className={`toggle-btn ${showSignup ? "active" : ""}`}
              onClick={() => this.setState({ 
                showSignup: true, 
                showLogin: false,
                error: null 
              })}
            >
              Sign Up
            </button>
          </div>

          {showLogin && (
            <LoginForm 
              onClose={() => this.setState({ showLogin: false })}
              onLoginSuccess={this.handleLoginSuccess}
              onForgotPassword={() => this.setState({ 
                showLogin: false, 
                showForgotPassword: true 
              })}
            />
          )}
          
          {showSignup && (
            <SignupForm
              onClose={() => this.setState({ showSignup: false })}
              onSignupSuccess={this.handleSignupSuccess}
            />
          )}
        </div>

        {user && (
          <div className={`sidebar-container ${showUserSidebar ? 'active' : ''}`}>
            <UserSidebar
              user={user}
              onClose={this.toggleUserSidebar}
              onLogout={this.handleLogout}
            />
          </div>
        )}

        <div className={`cart-sidebar ${showCart ? 'active' : ''}`}>
          <Cart
            cartItems={cartItems}
            onClose={this.toggleCart}
            onRemoveToCart={this.removeFromCart}
          />
        </div>
      </div>
    );
  }
}

export default MyComponent;