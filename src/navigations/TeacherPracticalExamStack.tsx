import { createStackNavigator } from '@react-navigation/stack';
import AssessmentDetailScreen from '../screens/AssessmentDetailScreen';
import DashboardTeacherScreen from '../screens/DashboardTeacherScreen';
import FeedbackTeacherScreen from '../screens/FeedbackTeacherScreen';
import GradingHistoryFilterScreen from '../screens/GradingHistoryFilterScreen';
import GradingHistoryScreen from '../screens/GradingHistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import PracticalExamDetailScreen from '../screens/PracticalExamDetailScreen';
import PracticalExamListScreen from '../screens/PracticalExamListScreen';
import ScoreDetailTeacherHistoryScreen from '../screens/ScoreDetailTeacherHistoryScreen';
import ScoreDetailTeacherScreen from '../screens/ScoreDetailTeacherScreen';

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
        name="ScoreDetailTeacherScreen"
        component={ScoreDetailTeacherScreen}
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
        name="ScoreDetailTeacherHistoryScreen"
        component={ScoreDetailTeacherHistoryScreen}
      />
    </TeacherPracticalExamStack.Navigator>
  );
}