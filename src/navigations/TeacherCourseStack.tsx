import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import AssignmentDetailScreen from '../screens/AssignmentDetailScreen';
import CourseDetailTeacherScreen from '../screens/CourseDetailTeacherScreen';
import CreateAssessmentScreen from '../screens/CreateAssessmentScreen';
import CurriculumTeacherScreen from '../screens/CurriculumTeacherScreen';
import EditMaterialScreen from '../screens/EditMaterialScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import GradesScreen from '../screens/GradesScreen';
import GradingHistoryFilterScreen from '../screens/GradingHistoryFilterScreen';
import GradingHistoryScreen from '../screens/GradingHistoryScreen';
import ParticipantsScreen from '../screens/ParticipantsScreen';
import ScoreDetailScreen from '../screens/ScoreDetailScreen';
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
        name="CurriculumTeacherScreen"
        component={CurriculumTeacherScreen}
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
        name="GradingHistoryScreen"
        component={GradingHistoryScreen}
      />
      <TeacherCourseStack.Screen
        name="EditMaterialScreen"
        component={EditMaterialScreen}
      />
      <TeacherCourseStack.Screen
        name="CreateAssessmentScreen"
        component={CreateAssessmentScreen}
      />
      <TeacherCourseStack.Screen
        name="GradingHistoryFilterScreen"
        component={GradingHistoryFilterScreen}
      />
    </TeacherCourseStack.Navigator>
  );
};

export default TeacherCourseStackNavigator;
