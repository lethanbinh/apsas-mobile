import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useSelector } from 'react-redux';
import IntroScreen from '../screens/IntroScreen';

import { RootState } from '../store/store';
import AdminStackNavigator from './AdminStack';
import HeadDeptBottomTabs from './HeadDeptBottomTabs';
import LecturerBottomTabs from './LecturerBottomTabs';
import StudentBottomTabs from './StudentBottomTabs';
import ExaminerBottomTabs from './ExaminerBottomTabs';

const Stack = createStackNavigator();

const MainAppStack = () => {
  const userProfile = useSelector(
    (state: RootState) => state.userSlice.profile,
  );
  const getComponentByRole = (role: string | string[] | undefined) => {
    const userRole = Array.isArray(role) ? role[0] : role;
    switch (userRole?.toUpperCase()) {
      case 'LECTURER':
        return LecturerBottomTabs;
      case 'HOD':
        return HeadDeptBottomTabs;
      case 'STUDENT':
        return StudentBottomTabs;
      case 'ADMIN':
        return AdminStackNavigator;
      case 'EXAMINER':
        return ExaminerBottomTabs;
      default:
        console.warn('Unknown role in MainAppStack:', userRole);
        return StudentBottomTabs;
    }
  };

  const MainAppComponent = getComponentByRole(userProfile?.role);
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainAppBottomTabs" component={MainAppComponent} />
    </Stack.Navigator>
  );
};

export default MainAppStack;
