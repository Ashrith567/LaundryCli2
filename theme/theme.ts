// theme/theme.ts
import { MD3LightTheme as PaperLight, MD3DarkTheme as PaperDark } from 'react-native-paper';

export const lightTheme = {
  ...PaperLight,
  colors: {
    ...PaperLight.colors,
    // primary: '#000000',      // black
    primary: '#343535',      // black
    primaryContainer: '#B7A2D7', // light color for primary container
    background: '#ffffff',   // white
    surface: '#f2f2f2',
    text: '#000000',
  },
};

export const darkTheme = {
  ...PaperDark,
  colors: {
    ...PaperDark.colors,
    primary: '#b9b9ba',      // white
    background: '#0D0D0D',   // black
    surface: '#191919',
    text: '#ffffff',
  },
};
