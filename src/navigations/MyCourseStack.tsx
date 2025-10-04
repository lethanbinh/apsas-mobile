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
import FeedbackScreen from '../screens/FeedbackScreen';
import SubmissionScreen from '../screens/SubmissionScreen';
import SubmissionHistoryScreen from '../screens/SubmissionHistoryScreen';
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
      <MyCourseStack.Screen name="FeedbackScreen" component={FeedbackScreen} />
      <MyCourseStack.Screen
        name="SubmissionScreen"
        component={SubmissionScreen}
      />
      <MyCourseStack.Screen
        name="SubmissionHistoryScreen"
        component={SubmissionHistoryScreen}
      />
    </MyCourseStack.Navigator>
  );
};

export default MyCourseStackNavigator;
