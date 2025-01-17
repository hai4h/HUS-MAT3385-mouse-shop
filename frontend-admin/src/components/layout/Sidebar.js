import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Tag,
  Wrench
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, text: 'Dashboard' },
    { path: '/users', icon: Users, text: 'Users' },
    { path: '/products', icon: Package, text: 'Products' },
    { path: '/orders', icon: ShoppingCart, text: 'Orders' },
    { path: '/promotions', icon: Tag, text: 'Promotions' },
    { path: '/warranties', icon: Wrench, text: 'Warranty' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Admin Panel</h1>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">{item.text}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;