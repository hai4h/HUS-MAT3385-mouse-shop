import React from 'react';
import './Topbar.css'
import {  
  Button, 
  useColorScheme,
  useTheme 
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAdminAuth } from '../../hooks/useAdminAuth';

function TopBar() {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  const { logout } = useAdminAuth();

  const toggleColorMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
   <div className='topbar'>
      <Button onClick={toggleColorMode}>
        {mode === 'light' 
          ? <DarkModeIcon sx={{color: theme.palette.custom.colorIcon}}/> 
          : <LightModeIcon sx={{color: theme.palette.custom.colorIcon}} />
        }
      </Button>
      
      <Button>
        <SettingsIcon sx={{color: theme.palette.custom.colorIcon}} />
      </Button>
      
      <Button>
        <PersonPinIcon sx={{color: theme.palette.custom.colorIcon}} />
      </Button>

      <Button onClick={logout}>
        <LogoutIcon sx={{color: theme.palette.custom.colorIcon}} />
      </Button>
   </div>
  );
}

export default TopBar;