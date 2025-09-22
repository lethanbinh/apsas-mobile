import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import AuthStackNavigator from './AuthStack';
import MainAppBottomTabs from './MainAppBottomTabs';
import IntroScreen from '../screens/IntroScreen';

import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();
const MainAppStack = () => {
  const [userData, setUserData] = useState<object | null>({
    id: 1,
  });
  const [isFirstUseApp, setIsFirstUseApp] = useState<boolean | null>(false);
  useEffect(() => {
    const loadData = async () => {
      const value = await AsyncStorage.getItem('isFirstUseApp');
      // setIsFirstUseApp(value === 'false' ? false : true);
      setIsFirstUseApp(false);
    };
    loadData();
  }, []);

  let initRoute = '';
  if (!isFirstUseApp && userData) {
    initRoute = 'MainAppBottomTabs';
  } else if (!isFirstUseApp || !userData) {
    initRoute = 'AuthStack';
  } else {
    initRoute = 'IntroScreen';
  }
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initRoute}
    >
      <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
      <Stack.Screen name="MainAppBottomTabs" component={MainAppBottomTabs} />
      <Stack.Screen name="IntroScreen" component={IntroScreen} />
    </Stack.Navigator>
  );
};

export default MainAppStack;

const styles = StyleSheet.create({});
