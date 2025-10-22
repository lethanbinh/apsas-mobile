import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider, useSelector } from 'react-redux';
import { AppToast } from './src/components/toasts/AppToast';
import { useLoadSplashScreen } from './src/hooks/useLoadSplashScreen';
import MainAppStack from './src/navigations/MainAppStack';
import SplashScreen from './src/screens/SplashScreen';
import { RootState, store } from './src/store/store';
import { useAuthInitializer } from './src/hooks/useAuthInitializer';
import { MenuProvider } from 'react-native-popup-menu';
import AuthStackNavigator from './src/navigations/AuthStack';
import { configureGoogleSignIn } from './src/utils/googleSignIn';
function AppContent() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.userSlice.isAuthenticated,
  );
  const { isLoading: isLoadingSplash } = useLoadSplashScreen();
  const isLoadingAuthentication = useAuthInitializer();

  const isLoading = isLoadingSplash || isLoadingAuthentication;
  useEffect(() => {
    configureGoogleSignIn();
  }, []);
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainAppStack /> : <AuthStackNavigator />}
      <AppToast />
    </NavigationContainer>
  );
}
function App() {
  return (
    <MenuProvider>
      <PaperProvider>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </PaperProvider>
    </MenuProvider>
  );
}

export default App;
