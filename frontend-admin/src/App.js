// App.js
import React from "react";
import "./App.css";
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material';
import theme from "./Theme";
import AppRoute from "./Route/Route";
import SessionTimeoutDialog from './components/auth/SessionTimeoutDialog';
import { useAdminAuth } from './hooks/useAdminAuth';

function App() {
  const { showSessionTimeout, setShowSessionTimeout } = useAdminAuth();

  const handleConfirmLogout = () => {
    setShowSessionTimeout(false);
    localStorage.removeItem('adminUser');
    window.location.href = 'http://localhost:3000?adminLogout=true';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppRoute />
        <SessionTimeoutDialog 
          open={showSessionTimeout}
          onClose={() => setShowSessionTimeout(false)}
          onConfirm={handleConfirmLogout}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;