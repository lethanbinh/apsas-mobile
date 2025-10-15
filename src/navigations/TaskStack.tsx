import { createStackNavigator } from '@react-navigation/stack';
import AssignmentDetailTeacherScreen from '../screens/AssignmentDetailTeacherScreen';
import TaskListScreen from '../screens/TaskListScreen';
import AssessmentDetailScreen from '../screens/AssessmentDetailScreen';
import ScoreDetailTeacherScreen from '../screens/ScoreDetailTeacherScreen';
import FeedbackTeacherScreen from '../screens/FeedbackTeacherScreen';
import DashboardTeacherScreen from '../screens/DashboardTeacherScreen';
import CreateAssessmentScreen from '../screens/CreateAssessmentScreen';
import RequirementTeacherScreen from '../screens/RequirementTeacherScreen';

const TaskStack = createStackNavigator();

export default function TaskStackNavigator() {
  return (
    <TaskStack.Navigator screenOptions={{ headerShown: false }}>
      <TaskStack.Screen name="TaskListScreen" component={TaskListScreen} />
      <TaskStack.Screen
        name="CreateAssessmentScreen"
        component={CreateAssessmentScreen}
      />
      <TaskStack.Screen
        name="AssignmentDetailTeacherScreen"
        component={AssignmentDetailTeacherScreen}
      />
      <TaskStack.Screen
        name="AssessmentDetailScreen"
        component={AssessmentDetailScreen}
      />
      <TaskStack.Screen
        name="ScoreDetailTeacherScreen"
        component={ScoreDetailTeacherScreen}
      />
      <TaskStack.Screen
        name="FeedbackTeacherScreen"
        component={FeedbackTeacherScreen}
      />
      <TaskStack.Screen
        name="DashboardTeacherScreen"
        component={DashboardTeacherScreen}
      />
      <TaskStack.Screen
        name="RequirementTeacherScreen"
        component={RequirementTeacherScreen}
      />
    </TaskStack.Navigator>
  );
}
