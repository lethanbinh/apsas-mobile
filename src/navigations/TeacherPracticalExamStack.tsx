import { createStackNavigator } from '@react-navigation/stack';
import DashboardTeacherScreen from '../screens/DashboardTeacherScreen';
import FeedbackTeacherScreen from '../screens/FeedbackTeacherScreen';
import PracticalExamDetailScreen from '../screens/PracticalExamDetailScreen';
import PracticalExamListScreen from '../screens/PracticalExamListScreen';
import ScoreDetailTeacherScreen from '../screens/ScoreDetailTeacherScreen';
import AssessmentDetailScreen from '../screens/AssessmentDetailScreen';

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
    </TeacherPracticalExamStack.Navigator>
  );
}