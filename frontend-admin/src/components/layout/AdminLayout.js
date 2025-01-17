import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="admin-layout">
      {/* Sidebar container */}
      <div className={`admin-sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}>
        <Sidebar isOpen={sidebarOpen} />
      </div>

      {/* Main content area */}
      <div className={`admin-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        {/* Header */}
        <div className="admin-header-container">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Main content */}
        <main className="admin-content">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;