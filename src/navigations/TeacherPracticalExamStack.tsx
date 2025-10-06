import { createStackNavigator } from '@react-navigation/stack';
import PracticalExamListScreen from '../screens/PracticalExamListScreen';
import PracticalExamDetailScreen from '../screens/PracticalExamDetailScreen';

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
    </TeacherPracticalExamStack.Navigator>
  );
}
