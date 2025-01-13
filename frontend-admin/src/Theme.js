import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        custom: {
          cardBorderColor: 'red',
          cardIconColor: 'red',
          tableHeaderBg: 'red',
          tableHeaderText: 'white',
          openInNewIcon: 'black',
          colorIcon:'red'
        }
      }
    },
    dark: {
      palette: {
        custom: {
          cardBorderColor: 'white',
          cardIconColor: 'white', 
          tableHeaderBg: 'white',
          tableHeaderText: 'black',
          openInNewIcon: 'white',
          colorIcon : 'lightblue'
        }
      }
    }
  }
});

export default theme;