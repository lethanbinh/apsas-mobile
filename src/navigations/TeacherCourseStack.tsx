import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import AssessmentDetailScreen from '../screens/AssessmentDetailScreen';
import AssignmentDetailScreen from '../screens/AssignmentDetailScreen';
import AssignmentDetailTeacherScreen from '../screens/AssignmentDetailTeacherScreen';
import CourseDetailTeacherScreen from '../screens/CourseDetailTeacherScreen';
import CreateAssessmentScreen from '../screens/CreateAssessmentScreen';
import CurriculumTeacherScreen from '../screens/CurriculumTeacherScreen';
import DashboardTeacherScreen from '../screens/DashboardTeacherScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import FeedbackTeacherScreen from '../screens/FeedbackTeacherScreen';
import GradesScreen from '../screens/GradesScreen';
import GradingHistoryFilterScreen from '../screens/GradingHistoryFilterScreen';
import GradingHistoryScreen from '../screens/GradingHistoryScreen';
import ParticipantsScreen from '../screens/ParticipantsScreen';
import PracticalExamDetailScreen from '../screens/PracticalExamDetailScreen';
import ScoreDetailScreen from '../screens/ScoreDetailScreen';
import SubmissionScreen from '../screens/SubmissionScreen';
import TeachingClassScreen from '../screens/TeachingClassScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import ScoreDetailTeacherHistoryScreen from '../screens/ScoreDetailTeacherHistoryScreen';
import RequirementTeacherScreen from '../screens/RequirementTeacherScreen';
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
        name="CreateAssessmentScreen"
        component={CreateAssessmentScreen}
      />
      <TeacherCourseStack.Screen
        name="GradingHistoryFilterScreen"
        component={GradingHistoryFilterScreen}
      />
      <TeacherCourseStack.Screen
        name="PracticalExamDetailScreen"
        component={PracticalExamDetailScreen}
      />
      <TeacherCourseStack.Screen
        name="AssignmentDetailTeacherScreen"
        component={AssignmentDetailTeacherScreen}
      />
      <TeacherCourseStack.Screen
        name="AssessmentDetailScreen"
        component={AssessmentDetailScreen}
      />
      <TeacherCourseStack.Screen
        name="FeedbackTeacherScreen"
        component={FeedbackTeacherScreen}
      />
      <TeacherCourseStack.Screen
        name="DashboardTeacherScreen"
        component={DashboardTeacherScreen}
      />
      <TeacherCourseStack.Screen
        name="HistoryDetailScreen"
        component={HistoryDetailScreen}
      />
      <TeacherCourseStack.Screen
        name="ScoreDetailTeacherHistoryScreen"
        component={ScoreDetailTeacherHistoryScreen}
      />
      <TeacherCourseStack.Screen
        name="RequirementTeacherScreen"
        component={RequirementTeacherScreen}
      />
    </TeacherCourseStack.Navigator>
  );
};

export default TeacherCourseStackNavigator;
