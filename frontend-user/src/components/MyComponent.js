import React, { Component } from "react";
import authService from "../services/authService";
import axiosInstance from "../services/axiosConfig";

import '../styles/App.scss';
import "../styles/desktop/ProductPage.scss"
import "../styles/desktop/LoginSignup.scss"
import "../styles/desktop/UserSidebar.scss"

import LoginForm from "../views/login-signup/LoginForm";
import SignupForm from "../views/login-signup/SignupForm";
import SessionExpiredModal from "../views/session/SessionExpiredModal";
import UserSidebar from "../views/user/UserSidebar";
import Cart from "../views/cart/Cart";
import Toast from "../views/toast/Toast";
import ProductPage from "../views/product-page/ProductPage";
import SearchResults from "../views/product-page/search/SearchResults";
import ProductDetailModal from "../views/product-page/modals/ProductDetailModal";
import ResponsiveWrapper from "../views/mobile/ResponsiveWrapper";

import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { RiXrpLine } from "react-icons/ri";

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
      showSessionExpiredModal: false,
      products: [],
      selectedProduct: null,
      isModalOpen: false,
    };
    this.productPageRef = React.createRef();
    this.handleSessionExpired = this.handleSessionExpired.bind(this);
  }

  loadCompleteUserData = async () => {
    const currentUser = authService.getCurrentUser();
    
    if (currentUser) {
      if (authService.isTokenExpired()) {
        // Clear các state liên quan
        this.setState({ 
          user: null,
          cartItems: [],
          showSessionExpiredModal: true,
          showCart: false,
          showUserSidebar: false
        });
        // Clear interval nếu có
        if (this.tokenCheckInterval) {
          clearInterval(this.tokenCheckInterval);
        }
        return;
      }
  
      try {
        const userInfoResponse = await axiosInstance.get(`/users/${currentUser.user_id}`);
        const fullUserData = {
          ...currentUser,
          ...userInfoResponse.data
        };
        authService.setUserData(fullUserData);
        this.setState({ user: fullUserData });
      } catch (error) {
        if (error.response?.status === 401) {
          this.setState({ 
            user: null,
            cartItems: [],
            showSessionExpiredModal: true,
            showCart: false,
            showUserSidebar: false
          });
          if (this.tokenCheckInterval) {
            clearInterval(this.tokenCheckInterval);
          }
        } else {
          console.error('Error loading complete user data:', error);
          this.setState({ user: currentUser });
        }
      }
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
      // Load initial data and setup checks
      this.loadCompleteUserData().then(() => {
        if (this.state.user && !this.state.showSessionExpiredModal) {
          this.setupTokenCheck();
        }
      });
    }

    try {
      const response = await axiosInstance.get('/products/');
      this.setState({ products: response.data });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  
    this.fetchCart();
    window.addEventListener('sessionExpired', this.handleSessionExpired);
  }

  componentWillUnmount() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    window.removeEventListener('focus', this.checkAndUpdateUserAuth);
    window.removeEventListener('sessionExpired', this.handleSessionExpired);
    document.removeEventListener('click', this.handleDocumentClick);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.user === null && this.state.user !== null) {
      this.fetchCart();
    }
  }

  
  checkAndUpdateUserAuth = () => {
    console.log('Checking auth status...'); // Debug log
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    if (authService.isTokenExpired()) {
      console.log('Token expired, attempting to show modal...'); // Debug log
      
      // Clear interval
      if (this.tokenCheckInterval) {
        clearInterval(this.tokenCheckInterval);
        this.tokenCheckInterval = null;
      }
      
      // Force a state update to show modal
      this.setState(prevState => {
        console.log('Previous state showSessionExpiredModal:', prevState.showSessionExpiredModal);
        return {
          showSessionExpiredModal: true,
          showCart: false,
          showUserSidebar: false,
          showLogin: false,
          showSignup: false
        };
      }, () => {
        console.log('State updated, showSessionExpiredModal:', this.state.showSessionExpiredModal);
      });
    }
  };

  setupTokenCheck = () => {
    console.log('Setting up token check...'); // Debug log
    // Clear existing interval if any
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    
    // Initial check
    this.checkAndUpdateUserAuth();
    
    // Set up interval check (every 30 seconds)
    this.tokenCheckInterval = setInterval(() => {
      console.log('Interval check triggered'); // Debug log
      this.checkAndUpdateUserAuth();
    }, 30000); // Reduced to 30 seconds for testing
    
    // Add window focus listener
    window.addEventListener('focus', () => {
      console.log('Window focused, checking auth...'); // Debug log
      this.checkAndUpdateUserAuth();
    });
  };

  toggleSearch = (event) => {
    event.stopPropagation();
    this.setState(prevState => ({
      showSearch: !prevState.showSearch,
      searchQuery: '', // Reset search query when toggling
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
      await this.fetchCart();
      
      // Thêm dòng này để fetch lại preferences
      if (this.productPageRef.current) {
        this.productPageRef.current.fetchUserPreferences();
      }
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
    console.log('Session expired event triggered'); // Debug log
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    this.setState({ 
      user: null,
      cartItems: [],
      showSessionExpiredModal: true,
      showCart: false,
      showUserSidebar: false
    });
  };
  
  handleModalConfirm = () => {
    console.log('Modal confirm clicked'); // Debug log
    
    // Clear all intervals
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
    
    // First hide modal and clear states
    this.setState({
      showSessionExpiredModal: false,
      user: null,
      cartItems: [],
      showCart: false,
      showUserSidebar: false,
      showLogin: false,
      showSignup: false
    }, () => {
      console.log('States cleared'); // Debug log
      
      // Then logout
      authService.logout();
      
      // Finally reload the page
      window.location.reload();
    });
  };

  handleAPIError = (error) => {
    if (error.response?.status === 401) {
      // Only show modal, don't reload
      this.setState({ 
        showSessionExpiredModal: true 
      });
      return true; // Indicate that error was handled
    }
    return false; // Error wasn't handled
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
      this.setState({ 
        showSearch: false,
        searchQuery: ''
      });
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
        quantity: product.quantity
      });
  
      await this.fetchCart();
      
      this.setState({
        showToast: true,
        toastMessage: 'Sản phẩm đã được thêm vào giỏ hàng'
      });
    } catch (error) {
      if (!this.handleAPIError(error)) {
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
        this.setState({ cartItems });
      }
    } catch (error) {
      if (!this.handleAPIError(error)) {
        console.error('Error fetching cart:', error);
      }
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
      showSessionExpiredModal,
      products,
      selectedProduct,
      isModalOpen
    } = this.state;

    console.log('Rendering MyComponent, showSessionExpiredModal:', showSessionExpiredModal);

    return (
      <ResponsiveWrapper
        onSearch={this.handleSearchInput}
        onToggleCart={this.toggleCart}
        onToggleUser={user ? this.toggleUserSidebar : this.toggleLogin}
        cartItemsCount={cartItems.length}
        user={user}
      >
        <div className="app">
          <Toast 
            message={toastMessage}
            isVisible={showToast}
            onHide={this.hideToast}
          />

        {console.log('Modal state:', showSessionExpiredModal)}

          <div className={`overlay ${(showLogin || showSignup || showCart || showUserSidebar) ? 'active' : ''}`} />

          <header className="header">
            <div className="logo">
              <RiXrpLine />
            </div>

            <div className="header-icons">
              <div className={`search-input-container ${!showSearch ? 'hidden' : ''}`}>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => this.setState({ searchQuery: e.target.value })}
                  autoFocus={showSearch}
                />
                <SearchResults
                  products={products} // Sử dụng products từ state
                  searchQuery={searchQuery}
                  onSelectProduct={(product) => {
                    this.setState({
                      selectedProduct: product,
                      isModalOpen: true,
                      searchQuery: '',
                      showSearch: false
                    });
                  }}
                  onCloseSearch={() => this.setState({ 
                    showSearch: false,
                    searchQuery: ''
                  })}
                  isVisible={showSearch}
                />
              </div>

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

          <ProductPage 
            onAddToCart={this.addToCart} 
            ref={this.productPageRef} // Thêm dòng này
          />

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
              user={this.state.user}
              onFetchCart={this.fetchCart}  // Thêm dòng này
            />
          </div>

          {showSessionExpiredModal && (
            <SessionExpiredModal onClose={this.handleModalConfirm} />
          )}

          <ProductDetailModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={() => this.setState({ 
              isModalOpen: false,
              selectedProduct: null 
            })}
            onAddToCart={this.addToCart} // Use this.addToCart instead of this.props.onAddToCart
          />
        </div>
      </ResponsiveWrapper>
    );
  }
}

export default MyComponent;