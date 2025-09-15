import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { IS_ANDROID } from '../constants/constants';
import HomeScreen from '../screens/HomeScreen';
import MyClassScreen from '../screens/MyClassScreen';
import { AppColors } from '../styles/color';
import RequestScreen from '../screens/RequestScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const MainAppBottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.pr500,
        tabBarLabelStyle: { fontSize: s(10), marginTop: vs(4) },
        tabBarStyle: IS_ANDROID && {
          height: vs(75),
          paddingTop: vs(5),
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="My Class" component={MyClassScreen} />
      <Tab.Screen name="Request" component={RequestScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainAppBottomTabs;

const styles = StyleSheet.create({});
