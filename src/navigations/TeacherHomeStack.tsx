import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import LecturerHomeScreen from '../screens/LecturerHomeScreen';
import TeachingClassScreen from '../screens/TeachingClassScreen';
import CourseDetailTeacherScreen from '../screens/CourseDetailTeacherScreen';

const TeacherHomeStack = createStackNavigator();
const TeacherHomeStackNavigator = () => {
  return (
    <TeacherHomeStack.Navigator screenOptions={{ headerShown: false }}>
      <TeacherHomeStack.Screen
        name="LecturerHomeScreen"
        component={LecturerHomeScreen}
      />
      <TeacherHomeStack.Screen
        name="TeachingClassScreen"
        component={TeachingClassScreen}
      />
      <TeacherHomeStack.Screen
        name="CourseDetailTeacherScreen"
        component={CourseDetailTeacherScreen}
      />
    </TeacherHomeStack.Navigator>
  );
};

export default TeacherHomeStackNavigator;

const styles = StyleSheet.create({});
