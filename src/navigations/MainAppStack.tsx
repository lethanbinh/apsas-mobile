import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import IntroScreen from '../screens/IntroScreen';
import AuthStackNavigator from './AuthStack';

import AdminStackNavigator from './AdminStack';
import HeadDeptBottomTabs from './HeadDeptBottomTabs';
import LecturerBottomTabs from './LecturerBottomTabs';
import StudentBottomTabs from './StudentBottomTabs';

const Stack = createStackNavigator();

const MainAppStack = () => {
  const [userData, setUserData] = useState<{ id: number; role: string } | null>(
    {
      id: 1,
      role: 'head', // "student" | "lecturer" | "head"
    },
  );
  const [isFirstUseApp, setIsFirstUseApp] = useState<boolean | null>(false);

  useEffect(() => {
    const loadData = async () => {
      // const value = await AsyncStorage.getItem('isFirstUseApp');
      // setIsFirstUseApp(value === 'true');
    };
    loadData();
  }, []);

  let initRoute = '';
  if (!isFirstUseApp && userData) {
    initRoute = 'MainAppBottomTabs';
  } else if (!userData && !isFirstUseApp) {
    initRoute = 'AuthStack';
  } else {
    initRoute = 'IntroScreen';
  }

  console.log(initRoute, isFirstUseApp, userData)

  const getBottomTabsByRole = (role: string) => {
    switch (role) {
      case 'lecturer':
        return LecturerBottomTabs;
      case 'head':
        return HeadDeptBottomTabs;
      case 'student':
        return StudentBottomTabs;
      case 'admin':
        return AdminStackNavigator;
      default:
        return StudentBottomTabs;
    }
  };

  const BottomTabsComponent = userData
    ? getBottomTabsByRole(userData.role)
    : StudentBottomTabs;

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
