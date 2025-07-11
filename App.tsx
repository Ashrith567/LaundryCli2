// App.tsx
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import AppNavigator from './android/app/src/navigation/AppNavigator';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from './theme/theme';

const App = () => {
  const scheme = useColorScheme();

  return (
    <PaperProvider theme={scheme === 'dark' ? darkTheme : lightTheme}>
      <AppNavigator />
    </PaperProvider>
  );
};

export default App;
