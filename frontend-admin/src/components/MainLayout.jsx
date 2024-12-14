import React from 'react';
import Sidebar from './sidebar/Sidebar';
import Topbar from './topbar/Topbar';

function MainLayout({ children }) {
  return (
    <div className="App">
      <Sidebar />
      <Topbar />
      {children}
    </div>
  );
}

export default MainLayout;