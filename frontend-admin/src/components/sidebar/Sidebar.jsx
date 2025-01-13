import React, { useState } from "react";
import "./Sidebar.css";
import { 
  useColorScheme 
} from '@mui/material/styles';
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import PaymentIcon from "@mui/icons-material/Payment";
import { UilSignOutAlt } from "@iconscout/react-unicons";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import { NavLink } from "react-router-dom";

const Sidebar = ({Children}) => {
  const [selected, setSelected] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { mode } = useColorScheme();
  
  const menuItem = [
    {
      path: "/",
      name: "Overview",
      icon: <DashboardIcon />
    },
    {
      path: "/products", 
      name: "Products",
      icon: <Inventory2RoundedIcon />
    },
    {
      path: "/users",
      name: "Users", 
      icon: <GroupIcon />
    },
    {
      path: "/billing",
      name: "Billling & Payments",
      icon: <PaymentIcon />
    }
  ];

  const sidebarStyle = {
    backgroundColor: mode === 'light' 
      ? 'rgba(210, 205, 129, 0.08)' 
      : 'black',
    color: mode === 'light' ? '#000' : '#fff'
  };
  const iconColor = mode === 'light' ? '#ff0505' : "#fff";

  return(
    <div className={`container ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar" style={sidebarStyle}>
        <div className="top_section">
          <div className="logo">
            <img src="./logo.png" alt="logo" className="img"/>
          </div>
        </div>
        {
          menuItem.map((item, index) =>(
            <NavLink 
              to={item.path} 
              key={index} 
              className={`link ${selected === index ? "active" : ""}`} 
              onClick={() => setSelected(index)}
              style={{
                color: selected === index 
                  ? '#ff0505' 
                  : (mode === 'light' ? '#000' : '#fff')
              }}
            >
              <div 
                className="icon" 
                style={{color: iconColor}}
              >
                {React.cloneElement(item.icon, { 
                  sx: { color: iconColor } 
                })}
              </div>
              {!isCollapsed && <div className="link_text"  style={{color: iconColor}}>{item.name}</div>}
            </NavLink>
          ))
        }
        <div 
          className="menuItem" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{color: iconColor}}
        >
          <UilSignOutAlt color={iconColor} />
          {!isCollapsed }
        </div>
      </div>
      <main>{Children}</main>
    </div>
  );
};

export default Sidebar;