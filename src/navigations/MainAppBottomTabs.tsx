import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather'; // 👈 sửa lại đúng bộ icon
import { IS_ANDROID } from '../constants/constants';
import HomeScreen from '../screens/HomeScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RequestScreen from '../screens/RequestScreen';
import { AppColors } from '../styles/color';
import MyCourses from '../screens/MyCourses';

const Tab = createBottomTabNavigator();
const MainAppBottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.pr500,
        tabBarLabelStyle: { fontSize: s(10), marginTop: vs(4) },
        tabBarStyle: IS_ANDROID && {
          height: vs(100),
          paddingTop: vs(5),
          paddingBottom: vs(40),
          paddingHorizontal: s(20),
          backgroundColor: AppColors.white,
          borderTopWidth: 0, // 👈 ẩn border top
          elevation: 0, // 👈 Android: bỏ shadow
          shadowOpacity: 0, // 👈 iOS: bỏ shadow
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="MyCourses"
        component={MyCourses}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="book" size={size} color={color} />
          ),
          tabBarLabel: 'My Courses',
        }}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="bell" size={size} color={color} />
          ),
          tabBarLabel: 'Notification',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainAppBottomTabs;

const styles = StyleSheet.create({});
