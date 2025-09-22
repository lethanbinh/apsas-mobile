import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { useLoadSplashScreen } from './src/hooks/useLoadSplashScreen';
import MainAppStack from './src/navigations/MainAppStack';
import SplashScreen from './src/screens/SplashScreen';
import { store } from './src/store/store';
import { AppToast } from './src/components/toasts/AppToast';
import { View } from 'react-native';

function App() {
  const { isLoading } = useLoadSplashScreen();
  if (isLoading) {
    return <SplashScreen />;
  }
  return (
    <Provider store={store}>
      <NavigationContainer>
        <MainAppStack />
        <AppToast />
      </NavigationContainer>
    </Provider>
  );
}

export default App;
