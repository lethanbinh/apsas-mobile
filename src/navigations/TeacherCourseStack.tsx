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
import RequirementScreen from '../screens/RequirementScreen';
import MembersScreen from '../screens/MembersScreen';
import PracticalExamListScreen from '../screens/PracticalExamListScreen';
import LabListScreen from '../screens/LabListScreen';
import LabDetailTeacherScreen from '../screens/LabDetailTeacherScreen';
import PracticalExamDetailTeacherScreen from '../screens/PracticalExamDetailTeacherScreen';
import AssignmentListScreen from '../screens/AssignmentListScreen';
import AssignmentGradingScreen from '../screens/AssignmentGradingScreen';
import MyGradingGroupScreen from '../screens/MyGradingGroupScreen';
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
      <TeacherCourseStack.Screen
        name="MembersScreen"
        component={MembersScreen}
      />
      <TeacherCourseStack.Screen
        name="PracticalExamListScreen"
        component={PracticalExamListScreen}
      />
      <TeacherCourseStack.Screen
        name="AssignmentGradingScreen"
        component={AssignmentGradingScreen}
      />
      <TeacherCourseStack.Screen
        name="AssignmentListScreen"
        component={AssignmentListScreen}
      />
      <TeacherCourseStack.Screen
        name="LabListScreen"
        component={LabListScreen}
      />
      <TeacherCourseStack.Screen
        name="LabDetailTeacherScreen"
        component={LabDetailTeacherScreen}
      />
      <TeacherCourseStack.Screen
        name="PracticalExamDetailTeacherScreen"
        component={PracticalExamDetailTeacherScreen}
      />
      <TeacherCourseStack.Screen
        name="MyGradingGroupScreen"
        component={MyGradingGroupScreen}
      />
      <TeacherCourseStack.Screen
        name="RequirementScreen"
        component={RequirementScreen}
      />
    </TeacherCourseStack.Navigator>
  );
};

export default TeacherCourseStackNavigator;
