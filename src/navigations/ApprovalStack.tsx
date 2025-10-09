import { createStackNavigator } from '@react-navigation/stack';
import ApprovalChooseSemesterScreen from '../screens/ApprovalChooseSemesterScreen';
import ApprovalScreen from '../screens/ApprovalScreen';

const ApprovalStack = createStackNavigator();

export default function ApprovalStackNavigator() {
  return (
    <ApprovalStack.Navigator screenOptions={{ headerShown: false }}>
      <ApprovalStack.Screen
        name="ApprovalChooseSemesterScreen"
        component={ApprovalChooseSemesterScreen}
      />
      <ApprovalStack.Screen name="ApprovalScreen" component={ApprovalScreen} />
    </ApprovalStack.Navigator>
  );
}
