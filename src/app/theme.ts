import { createTheme } from "@material-ui/core";

const primary = "#00BC58";
const secondary = "#3F3D56";
const primaryText = "#FFFFFF";
const secondaryText = "#000000";

const theme = createTheme({
  palette: {
    primary: {
      main: primary,
    },
    secondary: {
      main: secondary,
    },
    text: {
      primary: primaryText,
      secondary: secondaryText,
    },
    background: { default: primary },
  },
  typography: {
    fontFamily: ["Poppins", "sans-serif"].join(","),
    h1: {
      fontWeight: 600,
      fontSize: 60,
    },
    h2: {
      fontWeight: 400,
      fontSize: 40,
    },
  },
});

export default theme;
