import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { AppToast } from './src/components/toasts/AppToast';
import { useLoadSplashScreen } from './src/hooks/useLoadSplashScreen';
import MainAppStack from './src/navigations/MainAppStack';
import SplashScreen from './src/screens/SplashScreen';
import { store } from './src/store/store';
function App() {
  const { isLoading } = useLoadSplashScreen();
  if (isLoading) {
    return <SplashScreen />;
  }
  return (
    <PaperProvider>
      <Provider store={store}>
        <NavigationContainer>
          <MainAppStack />
          <AppToast />
        </NavigationContainer>
      </Provider>
    </PaperProvider>
  );
}

export default App;
