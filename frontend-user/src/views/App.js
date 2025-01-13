import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyComponent from '../components/MyComponent';
import AccountManagement from './account/AccountManagement';
import PrivateRoute from '../components/PrivateRoute';
import './App.scss'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MyComponent />} />
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <AccountManagement />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;