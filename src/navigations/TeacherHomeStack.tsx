import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import LecturerHomeScreen from '../screens/LecturerHomeScreen';
import TeachingClassScreen from '../screens/TeachingClassScreen';
import CourseDetailTeacherScreen from '../screens/CourseDetailTeacherScreen';
import CurriculumTeacherScreen from '../screens/CurriculumTeacherScreen';
import ParticipantsScreen from '../screens/ParticipantsScreen';
import AssignmentDetailScreen from '../screens/AssignmentDetailScreen';
import ScoreDetailScreen from '../screens/ScoreDetailScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import SubmissionScreen from '../screens/SubmissionScreen';
import GradingHistoryScreen from '../screens/GradingHistoryScreen';
import CreateAssessmentScreen from '../screens/CreateAssessmentScreen';
import GradingHistoryFilterScreen from '../screens/GradingHistoryFilterScreen';
import GradesScreen from '../screens/GradesScreen';
import AssessmentDetailScreen from '../screens/AssessmentDetailScreen';
import ScoreDetailTeacherScreen from '../screens/ScoreDetailTeacherScreen';
import FeedbackTeacherScreen from '../screens/FeedbackTeacherScreen';
import DashboardTeacherScreen from '../screens/DashboardTeacherScreen';
import TaskListScreen from '../screens/TaskListScreen';
import AssignmentDetailTeacherScreen from '../screens/AssignmentDetailTeacherScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import ScoreDetailTeacherHistoryScreen from '../screens/ScoreDetailTeacherHistoryScreen';
import RequirementTeacherScreen from '../screens/RequirementTeacherScreen';

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
      <TeacherHomeStack.Screen
        name="CurriculumTeacherScreen"
        component={CurriculumTeacherScreen}
      />
      <TeacherHomeStack.Screen
        name="ParticipantsScreen"
        component={ParticipantsScreen}
      />
      <TeacherHomeStack.Screen name="GradesScreen" component={GradesScreen} />
      <TeacherHomeStack.Screen
        name="AssignmentDetailScreen"
        component={AssignmentDetailScreen}
      />
      <TeacherHomeStack.Screen
        name="ScoreDetailScreen"
        component={ScoreDetailScreen}
      />
      <TeacherHomeStack.Screen
        name="FeedbackScreen"
        component={FeedbackScreen}
      />
      <TeacherHomeStack.Screen
        name="SubmissionScreen"
        component={SubmissionScreen}
      />
      <TeacherHomeStack.Screen
        name="GradingHistoryScreen"
        component={GradingHistoryScreen}
      />
      <TeacherHomeStack.Screen
        name="CreateAssessmentScreen"
        component={CreateAssessmentScreen}
      />
      <TeacherHomeStack.Screen
        name="GradingHistoryFilterScreen"
        component={GradingHistoryFilterScreen}
      />
      <TeacherHomeStack.Screen
        name="AssessmentDetailScreen"
        component={AssessmentDetailScreen}
      />
      <TeacherHomeStack.Screen
        name="ScoreDetailTeacherScreen"
        component={ScoreDetailTeacherScreen}
      />
      <TeacherHomeStack.Screen
        name="FeedbackTeacherScreen"
        component={FeedbackTeacherScreen}
      />
      <TeacherHomeStack.Screen
        name="DashboardTeacherScreen"
        component={DashboardTeacherScreen}
      />

      <TeacherHomeStack.Screen
        name="TaskListScreen"
        component={TaskListScreen}
      />
      <TeacherHomeStack.Screen
        name="AssignmentDetailTeacherScreen"
        component={AssignmentDetailTeacherScreen}
      />
      <TeacherHomeStack.Screen
        name="HistoryDetailScreen"
        component={HistoryDetailScreen}
      />
      <TeacherHomeStack.Screen
        name="ScoreDetailTeacherHistoryScreen"
        component={ScoreDetailTeacherHistoryScreen}
      />
      <TeacherHomeStack.Screen
        name="RequirementTeacherScreen"
        component={RequirementTeacherScreen}
      />
    </TeacherHomeStack.Navigator>
  );
};

export default TeacherHomeStackNavigator;

const styles = StyleSheet.create({});
