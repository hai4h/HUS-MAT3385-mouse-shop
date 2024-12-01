import React, { Component } from "react";
import "../views/App.scss";
import LoginForm from "./LoginForm";
import Cart from "./Cart";
import ProductPage from "./ProductPage";
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogin: false,     // Quản lý trạng thái Login form
      showCart: false,      // Quản lý trạng thái Cart sidebar
      cartItems: [],        // Danh sách sản phẩm trong giỏ hàng
    };
    
    // Tham chiếu để quản lý DOM
    this.cartSidebarRef = React.createRef();
    this.LoginRef = React.createRef()
  }

  // Hàm bật/tắt Login form
  toggleLogin = () => {
    this.setState((prevState) => ({
      showLogin: !prevState.showLogin,
    }));
  };

  // Hàm bật/tắt Cart sidebar
  toggleCart = () => {
    this.setState((prevState) => ({
      showCart: !prevState.showCart,
    }));
  };

  // Hàm xử lý sự kiện click ngoài sidebar
  handleClickOutside = (event) => {
    // Kiểm tra xem click có nằm ngoài cart-sidebar không
    if (
      this.state.showCart && 
      this.cartSidebarRef.current && 
      !this.cartSidebarRef.current.contains(event.target)
    ) {
      this.toggleCart();
    }
  
    // Kiểm tra xem click có nằm ngoài login-overlay không
    if (
      this.state.showLogin && 
      this.LoginRef.current && 
      !this.LoginRef.current.contains(event.target)
    ) {
      this.toggleLogin();
    }
  };
  

  // Thêm sự kiện click toàn cục khi component được mount
  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  // Gỡ bỏ sự kiện khi component bị unmount
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  // Hàm thêm sản phẩm vào giỏ hàng
  addToCart = (product) => {
    this.setState((prevState) => ({
      cartItems: [...prevState.cartItems, product],
    }));
  };

  render() {
    const { showLogin, showCart, cartItems } = this.state;

    return (
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="logo" onClick={() => this.setState({ showLogin: false })}>
            X
          </div>
          <div className="header-icons">
            <span className="icon search">
                <SearchIcon style={{ color: "red" }}></SearchIcon>
            </span>
            <span className="icon login" onClick={this.toggleLogin}>
                <AccountCircleIcon style={{ color: "red" }}></AccountCircleIcon>
            </span>
            <span className="icon cart" onClick={this.toggleCart}>
                <ShoppingCartIcon style={{ color: "red" }}></ShoppingCartIcon>
            </span>
          </div>
        </header>

        {/* Trang chính: ProductPage */}
        <ProductPage onAddToCart={this.addToCart} />

        {/* Cửa sổ Login */}
        <div 
          ref={this.LoginRef}
          className={`login-sidebar ${showLogin ? "active" : ""}`}
        >
          <LoginForm  
            onClose={this.toggleLogin} 
          />
        </div>

        {/* Sidebar Cart */}
        <div 
          ref={this.cartSidebarRef}
          className={`cart-sidebar ${showCart ? "active" : ""}`}
        >
          <Cart 
            cartItems={cartItems} 
            onClose={this.toggleCart} 
          />
        </div>
      </div>
    );
  }
}

export default MyComponent;