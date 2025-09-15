import { createStackNavigator } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import AuthStackNavigator from './AuthStack';
import MainAppBottomTabs from './MainAppBottomTabs';

const Stack = createStackNavigator();
const MainAppStack = () => {
  const [userData, setUserData] = useState<object | null>(null);
  return (
    <Stack.Navigator
      screenOptions={{ 
        headerShown: false, 
       }}
      // initialRouteName={userData ? 'MainAppBottomTabs' : 'AuthStack'}
    >
      <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
      <Stack.Screen name="MainAppBottomTabs" component={MainAppBottomTabs} />
    </Stack.Navigator>
  );
};

export default MainAppStack;

const styles = StyleSheet.create({});
