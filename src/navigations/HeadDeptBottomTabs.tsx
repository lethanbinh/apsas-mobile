import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { IS_ANDROID } from '../constants/constants';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { AppColors } from '../styles/color';
import HeadDeptHomeStackNavigator from './HeadDeptHomeStack';
import NotificationScreen from '../screens/NotificationScreen';
import PlanStackNavigator from './PlanStack';
import ApprovalScreen from '../screens/ApprovalScreen';

const Tab = createBottomTabNavigator();

const HeadDeptBottomTabs = () => {
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
        component={HeadDeptHomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Plans"
        component={PlanStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="map" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Approval"
        component={ApprovalScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="clipboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="bell" size={size} color={color} />
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

export default HeadDeptBottomTabs;
