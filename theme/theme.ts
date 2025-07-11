import { MD3LightTheme as PaperLight, MD3DarkTheme as PaperDark } from 'react-native-paper';

export const lightTheme = {
  ...PaperLight,
  colors: {
    ...PaperLight.colors,
    primary: '#343535',  
    primaryContainer: '#B7A2D7', 
    background: '#ffffff',   
    surface: '#f2f2f2',
    text: '#000000',
  },
};

export const darkTheme = {
  ...PaperDark,
  colors: {
    ...PaperDark.colors,
    primary: '#b9b9ba',     
    background: '#0D0D0D',  
    surface: '#191919',
    text: '#ffffff',
  },
};
