import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { IS_ANDROID } from '../constants/constants';
import ProfileScreen from '../screens/ProfileScreen';
import { AppColors } from '../styles/color';
import ExaminerHomeStackNavigator from './ExaminerHomeStack';

const Tab = createBottomTabNavigator();

const ExaminerBottomTabs = () => {
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
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ExaminerHomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ExaminerBottomTabs;

