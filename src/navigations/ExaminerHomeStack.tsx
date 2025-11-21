import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ExaminerHomeScreen from '../screens/ExaminerHomeScreen';
import ExaminerGradingGroupsScreen from '../screens/ExaminerGradingGroupsScreen';
import ExaminerTemplatesScreen from '../screens/ExaminerTemplatesScreen';
import ExaminerSubmissionsScreen from '../screens/ExaminerSubmissionsScreen';

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
      <ExaminerHomeStack.Screen
        name="ExaminerTemplatesScreen"
        component={ExaminerTemplatesScreen}
      />
      <ExaminerHomeStack.Screen
        name="ExaminerSubmissionsScreen"
        component={ExaminerSubmissionsScreen}
      />
    </ExaminerHomeStack.Navigator>
  );
};

export default ExaminerHomeStackNavigator;

