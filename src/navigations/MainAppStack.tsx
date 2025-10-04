import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import AuthStackNavigator from './AuthStack';
import IntroScreen from '../screens/IntroScreen';

import AsyncStorage from '@react-native-async-storage/async-storage';
import LecturerBottomTabs from './LecturerBottomTabs';
import HeadDeptBottomTabs from './HeadDeptBottomTabs';
import StudentBottomTabs from './StudentBottomTabs';

const Stack = createStackNavigator();

const MainAppStack = () => {
  const [userData, setUserData] = useState<{ id: number; role: string } | null>({
    id: 1,
    role: 'lecturer', // "student" | "lecturer" | "head"
  });
  const [isFirstUseApp, setIsFirstUseApp] = useState<boolean | null>(false);

  useEffect(() => {
    const loadData = async () => {
      const value = await AsyncStorage.getItem('isFirstUseApp');
      setIsFirstUseApp(value === 'true');
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

  const getBottomTabsByRole = (role: string) => {
    switch (role) {
      case 'lecturer':
        return LecturerBottomTabs;
      case 'head':
        return HeadDeptBottomTabs;
      case 'student':
      default:
        return StudentBottomTabs;
    }
  };

  const BottomTabsComponent = userData ? getBottomTabsByRole(userData.role) : StudentBottomTabs;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initRoute}
    >
      <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
      <Stack.Screen name="MainAppBottomTabs" component={BottomTabsComponent} />
      <Stack.Screen name="IntroScreen" component={IntroScreen} />
    </Stack.Navigator>
  );
};

export default MainAppStack;

const styles = StyleSheet.create({});
