import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import AssignmentDetailScreen from '../screens/AssignmentDetailScreen';
import CourseDetailTeacherScreen from '../screens/CourseDetailTeacherScreen';
import CurriculumScreen from '../screens/CurriculumScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import GradesScreen from '../screens/GradesScreen';
import ParticipantsScreen from '../screens/ParticipantsScreen';
import ScoreDetailScreen from '../screens/ScoreDetailScreen';
import SubmissionHistoryScreen from '../screens/SubmissionHistoryScreen';
import SubmissionScreen from '../screens/SubmissionScreen';
import TeachingClassScreen from '../screens/TeachingClassScreen';
const TeacherCourseStack = createStackNavigator();

const TeacherCourseStackNavigator = () => {
  return (
    <TeacherCourseStack.Navigator screenOptions={{ headerShown: false }}>
      <TeacherCourseStack.Screen
        name="TeachingClassScreen"
        component={TeachingClassScreen}
      />
      <TeacherCourseStack.Screen
        name="CourseDetailTeacherScreen"
        component={CourseDetailTeacherScreen}
      />
      <TeacherCourseStack.Screen
        name="CurriculumScreen"
        component={CurriculumScreen}
      />
      <TeacherCourseStack.Screen
        name="ParticipantsScreen"
        component={ParticipantsScreen}
      />
      <TeacherCourseStack.Screen name="GradesScreen" component={GradesScreen} />
      <TeacherCourseStack.Screen
        name="AssignmentDetailScreen"
        component={AssignmentDetailScreen}
      />
      <TeacherCourseStack.Screen
        name="ScoreDetailScreen"
        component={ScoreDetailScreen}
      />
      <TeacherCourseStack.Screen
        name="FeedbackScreen"
        component={FeedbackScreen}
      />
      <TeacherCourseStack.Screen
        name="SubmissionScreen"
        component={SubmissionScreen}
      />
      <TeacherCourseStack.Screen
        name="SubmissionHistoryScreen"
        component={SubmissionHistoryScreen}
      />
    </TeacherCourseStack.Navigator>
  );
};

export default TeacherCourseStackNavigator;
