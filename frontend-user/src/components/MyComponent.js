import React, { Component } from "react";
import authService from "../services/authService";
import axiosInstance from "../services/axiosConfig";

import "../views/App.scss";
import "../views/product-page/ProductPage.scss"
import "../views/login-signup/LoginSignup.scss"
import "../views/user/UserSidebar.scss"

import LoginForm from "../views/login-signup/LoginForm";
import SignupForm from "../views/login-signup/SignupForm";
import SessionExpiredModal from "../views/session/SessionExpiredModal";
import UserSidebar from "../views/user/UserSidebar";
import Cart from "../views/cart/Cart";
import Toast from "../views/toast/Toast";
import ProductPage from "../views/product-page/ProductPage";

import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      showSearch: false,
      showLogin: false,
      showSignup: false,
      showCart: false,
      showUserSidebar: false,
      cartItems: [],
      showToast: false,
      toastMessage: '',
      searchQuery: "",
      adminLoggedOut: false,
      showSessionExpiredModal: false
    };
  }

  loadCompleteUserData = async () => {
    const currentUser = authService.getCurrentUser();
    
    if (currentUser && !authService.isTokenExpired()) {
        try {
            const userInfoResponse = await axiosInstance.get(`/users/${currentUser.user_id}`);
            const fullUserData = {
                ...currentUser,
                ...userInfoResponse.data
            };
            authService.setUserData(fullUserData);
            this.setState({ user: fullUserData });
        } catch (error) {
            console.error('Error loading complete user data:', error);
            this.setState({ user: currentUser });
        }
    } else if (currentUser && authService.isTokenExpired()) {
        this.setState({ showSessionExpiredModal: true });
    }
  }

  async componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick);
    
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminLogout = urlParams.get('adminLogout');
    
    if (isAdminLogout) {
        authService.logout();
        this.setState({ user: null });
        window.history.replaceState({}, '', window.location.pathname);
    } else {
        // Load complete user data on mount
        await this.loadCompleteUserData();
    }
    
    this.setupTokenCheck();
    this.fetchCart();
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.user === null && this.state.user !== null) {
      this.fetchCart();
    }
  }

  checkAndUpdateUserAuth = () => {
    const currentUser = authService.getCurrentUser();
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminLogout = urlParams.get('adminLogout');
    
    if (currentUser && authService.isTokenExpired() && !isAdminLogout) {
      this.setState({ 
        showSessionExpiredModal: true 
      });
    } else if (currentUser && !authService.isTokenExpired()) {
      this.setState({ user: currentUser }); // Chỉ set state từ localStorage
    }
  }

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
      const userInfoResponse = await axiosInstance.get(`/users/${userData.user_id}`);
      const fullUserData = {
        ...userData,
        ...userInfoResponse.data
      };
      
      this.setState({ 
        user: fullUserData,
        showLogin: false,
        showSignup: false
      });
      
      this.setupTokenCheck();
      await this.fetchCart(); // Fetch giỏ hàng ngay sau khi đăng nhập
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
        this.setState({ 
          user: null,
          cartItems: [] // Xóa giỏ hàng
        }, () => {
          window.location.reload(); // Reload trang
        });
      }, 300);
    });
  };

  handleSessionExpired = () => {
    // Xóa dữ liệu user và reload trang
    authService.logout();
    this.setState({ 
      user: null,
      showSessionExpiredModal: false 
    }, () => {
      window.location.reload();
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

  handleCartUpdate = (updatedItem) => {
    const updatedCartItems = this.state.cartItems.map(item =>
      item.cart_item_id === updatedItem.cart_item_id ? updatedItem : item
    );
    
    this.setState({ cartItems: updatedCartItems });
  };

  addToCart = async (product) => {
    if (!this.state.user) {
      this.setState({ showLogin: true });
      return;
    }

    try {
      await axiosInstance.post('/cart/add-to-cart', {
        product_id: product.product_id,
        quantity: 1
      });

      await this.fetchCart();
      
      this.setState({
        showToast: true,
        toastMessage: 'Sản phẩm đã được thêm vào giỏ hàng'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        this.setState({ showSessionExpiredModal: true });
      } else {
        this.setState({
          showToast: true,
          toastMessage: 'Không thể thêm sản phẩm vào giỏ hàng'
        });
      }
    }
  };
  
  removeFromCart = async (cartItemId) => {
    try {
      await axiosInstance.delete(`/cart/${cartItemId}`);
      await this.fetchCart();
    } catch (error) {
      if (error.response?.status === 401) {
        this.setState({ showSessionExpiredModal: true });
      } else {
        alert('Không thể xóa sản phẩm khỏi giỏ hàng');
      }
    }
  };
  
  fetchCart = async () => {
    if (!this.state.user) {
      this.setState({ cartItems: [] });
      return;
    }
  
    try {
      const response = await axiosInstance.get('/cart/cart');
      const cartItems = response.data.items || [];
      
      if (JSON.stringify(cartItems) !== JSON.stringify(this.state.cartItems)) {
        this.setState({ cartItems }, () => {
          this.forceUpdate(); // Force re-render
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        this.setState({ showSessionExpiredModal: true });
      }
      console.error('Error fetching cart:', error);
    }
  };

  hideToast = () => {
    this.setState({ showToast: false });
  };

  render() {
    const { 
      showSearch, 
      showLogin,
      showSignup, 
      showCart, 
      showUserSidebar, 
      cartItems,
      showToast, 
      toastMessage, 
      user,
      searchQuery,
      showSessionExpiredModal
    } = this.state;

    return (
      <div className="app">
        <Toast 
          message={toastMessage}
          isVisible={showToast}
          onHide={this.hideToast}
        />

        {showSessionExpiredModal && (
          <SessionExpiredModal 
            onClose={this.handleSessionExpired}
          />
        )}

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
              user={user}  // Truyền user info đầy đủ xuống
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
            onUpdateCart={this.handleCartUpdate}
          />
        </div>
      </div>
    );
  }
}

export default MyComponent;