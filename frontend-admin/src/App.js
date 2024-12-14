// App.js
import React from "react";
import "./App.css";
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material';
import theme from "./Theme";
import AppRoute from "./Route/Route";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppRoute/>
      </div>
    </ThemeProvider>
  );
}

export default App;