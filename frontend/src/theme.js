import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';


export const lightTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#35684b',
    },
    secondary: {
      main: '#ffa726',
    },
    error: {
      main: red.A400,
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#35684b',
    },
    secondary: {
      main: '#ffa726',
    },
    error: {
      main: red.A400,
    },
  },
});

export default lightTheme;