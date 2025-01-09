import { Button } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import "./NotFound.css";
import { useTheme } from "@mui/material/styles";

function NotFound() {
  const theme = useTheme();
  const color = theme.palette.custom.cardIconColor;
  
  return (
    <div className="not-found-container">
      <img src="./assets/error-404.png" alt="notFound" className="img" />
      <h1>404: The page you are looking for isn't here</h1>
      <h2>
        You either tried some shady route or you came here by mistake. Whichever
        it is, try using the navigation.
      </h2>
      <Button
        component={Link}
        to="/"
        startIcon={<ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />}
        variant="contained"
        sx={{
          background:`${color}`
        }}
      >
        Go back to home
      </Button>
    </div>
  );
}

export default NotFound;
