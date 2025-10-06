import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { IS_ANDROID } from '../constants/constants';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { AppColors } from '../styles/color';
import HistoryStackNavigator from './HistoryStack';
import HomeStackNavigator from './HomeStack';
import MyCourseStackNavigator from './MyCourseStack';

const Tab = createBottomTabNavigator();
const StudentBottomTabs = () => {
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
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Courses"
        component={MyCourseStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="book" size={size} color={color} />
          ),
          tabBarLabel: 'Courses',
        }}
      />
      <Tab.Screen
        name="Submission"
        component={HistoryStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
          tabBarLabel: 'Submission',
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

export default StudentBottomTabs;

const styles = StyleSheet.create({});
