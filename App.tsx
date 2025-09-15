import { View } from 'react-native';
import { Provider } from 'react-redux';
import MainAppStack from './src/navigations/MainAppStack';
import { store } from './src/store/store';
import { AppColors } from './src/styles/color';
import { useLoadSplashScreen } from './src/hooks/useLoadSplashScreen';
import SplashScreen from './src/screens/SplashScreen';
import { NavigationContainer } from '@react-navigation/native';

function App() {
  const { isLoading } = useLoadSplashScreen();
  if (isLoading) {
    return <SplashScreen />;
  }
  return (
    <Provider store={store}>
      <NavigationContainer>
        <MainAppStack />
      </NavigationContainer>
    </Provider>
  );
}

export default App;
