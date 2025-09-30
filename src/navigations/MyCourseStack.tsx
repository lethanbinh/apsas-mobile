import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import MyCoursesScreen from '../screens/MyCourses';
import CurriculumScreen from '../screens/CurriculumScreen';
import ParticipantsScreen from '../screens/ParticipantsScreen';
import GradesScreen from '../screens/GradesScreen';
import AssignmentDetailScreen from '../screens/AssignmentDetailScreen';
import ScoreDetailScreen from '../screens/ScoreDetailScreen';
const MyCourseStack = createStackNavigator();

const MyCourseStackNavigator = () => {
  return (
    <MyCourseStack.Navigator screenOptions={{ headerShown: false }}>
      <MyCourseStack.Screen
        name="MyCoursesScreen"
        component={MyCoursesScreen}
      />
      <MyCourseStack.Screen
        name="CourseDetailScreen"
        component={CourseDetailScreen}
      />
      <MyCourseStack.Screen
        name="CurriculumScreen"
        component={CurriculumScreen}
      />
      <MyCourseStack.Screen
        name="ParticipantsScreen"
        component={ParticipantsScreen}
      />
      <MyCourseStack.Screen name="GradesScreen" component={GradesScreen} />
      <MyCourseStack.Screen
        name="AssignmentDetailScreen"
        component={AssignmentDetailScreen}
      />
      <MyCourseStack.Screen
        name="ScoreDetailScreen"
        component={ScoreDetailScreen}
      />
    </MyCourseStack.Navigator>
  );
};

export default MyCourseStackNavigator;
