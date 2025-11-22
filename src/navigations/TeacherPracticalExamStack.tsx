import { createStackNavigator } from '@react-navigation/stack';
import AssessmentDetailScreen from '../screens/AssessmentDetailScreen';
import DashboardTeacherScreen from '../screens/DashboardTeacherScreen';
import FeedbackTeacherScreen from '../screens/FeedbackTeacherScreen';
import GradingHistoryFilterScreen from '../screens/GradingHistoryFilterScreen';
import GradingHistoryScreen from '../screens/GradingHistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import PracticalExamDetailScreen from '../screens/PracticalExamDetailScreen';
import PracticalExamListScreen from '../screens/PracticalExamListScreen';
import RequirementTeacherScreen from '../screens/RequirementTeacherScreen';
import RequirementScreen from '../screens/RequirementScreen';
import LabDetailTeacherScreen from '../screens/LabDetailTeacherScreen';
import PracticalExamDetailTeacherScreen from '../screens/PracticalExamDetailTeacherScreen';

const TeacherPracticalExamStack = createStackNavigator();

export default function TeacherPracticalExamStackNavigator() {
  return (
    <TeacherPracticalExamStack.Navigator screenOptions={{ headerShown: false }}>
      <TeacherPracticalExamStack.Screen
        name="PracticalExamListScreen"
        component={PracticalExamListScreen}
      />
      <TeacherPracticalExamStack.Screen
        name="PracticalExamDetailScreen"
        component={PracticalExamDetailScreen}
      />
      <TeacherPracticalExamStack.Screen
        name="AssessmentDetailScreen"
        component={AssessmentDetailScreen}
      />
      <TeacherPracticalExamStack.Screen
        name="FeedbackTeacherScreen"
        component={FeedbackTeacherScreen}
      />
      <TeacherPracticalExamStack.Screen
        name="DashboardTeacherScreen"
        component={DashboardTeacherScreen}
      />
      <TeacherPracticalExamStack.Screen
        name="GradingHistoryScreen"
        component={GradingHistoryScreen}
      />
      <TeacherPracticalExamStack.Screen
        name="GradingHistoryFilterScreen"
        component={GradingHistoryFilterScreen}
      />
      <TeacherPracticalExamStack.Screen
        name="HistoryDetailScreen"
        component={HistoryDetailScreen}
      />
      <TeacherPracticalExamStack.Screen
        name="RequirementTeacherScreen"
        component={RequirementTeacherScreen}
      />
      <TeacherPracticalExamStack.Screen
        name="LabDetailTeacherScreen"
        component={LabDetailTeacherScreen}
      />
      <TeacherPracticalExamStack.Screen
        name="PracticalExamDetailTeacherScreen"
        component={PracticalExamDetailTeacherScreen}
      />
      <TeacherPracticalExamStack.Screen
        name="RequirementScreen"
        component={RequirementScreen}
      />
    </TeacherPracticalExamStack.Navigator>
  );
}