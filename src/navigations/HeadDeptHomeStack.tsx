import { createStackNavigator } from '@react-navigation/stack';
import CourseManagementScreen from '../screens/CourseManagementScreen';
import HeadDeptHomeScreen from '../screens/HeadDeptHomeScreen';
import SemesterManagementScreen from '../screens/SemesterManagementScreen';

const HeadDeptHomeStack = createStackNavigator();

export default function HeadDeptHomeStackNavigator() {
  return (
    <HeadDeptHomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HeadDeptHomeStack.Screen
        name="HeadDeptHomeScreen"
        component={HeadDeptHomeScreen}
      />
      <HeadDeptHomeStack.Screen
        name="CourseManagementScreen"
        component={CourseManagementScreen}
      />
      <HeadDeptHomeStack.Screen
        name="SemesterManagementScreen"
        component={SemesterManagementScreen}
      />
    </HeadDeptHomeStack.Navigator>
  );
}