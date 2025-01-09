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
          cardBorderColor: 'orange',
          cardIconColor: 'orange',
          tableHeaderBg: 'white',
          tableHeaderText: 'orange',
          openInNewIcon: 'white',
          colorIcon: 'orange'
        }
      },
      text: {
        primary: 'orange',
        secondary: 'orange'
      }
    }
  }
});

export default theme;