import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ExaminerHomeScreen from '../screens/ExaminerHomeScreen';
import ExaminerGradingGroupsScreen from '../screens/ExaminerGradingGroupsScreen';

const ExaminerHomeStack = createStackNavigator();

const ExaminerHomeStackNavigator = () => {
  return (
    <ExaminerHomeStack.Navigator screenOptions={{ headerShown: false }}>
      <ExaminerHomeStack.Screen
        name="ExaminerHomeScreen"
        component={ExaminerHomeScreen}
      />
      <ExaminerHomeStack.Screen
        name="ExaminerGradingGroupsScreen"
        component={ExaminerGradingGroupsScreen}
      />
    </ExaminerHomeStack.Navigator>
  );
};

export default ExaminerHomeStackNavigator;

