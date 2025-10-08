import { createStackNavigator } from '@react-navigation/stack';
import HeadDeptHomeScreen from '../screens/HeadDeptHomeScreen';
import ChooseSemesterScreen from '../screens/ChooseSemesterScreen';
import ImportExcelScreen from '../screens/ImportExcelScreen';
import PreviewDataScreen from '../screens/PreviewDataScreen';

const HeadDeptHomeStack = createStackNavigator();

export default function HeadDeptHomeStackNavigator() {
  return (
    <HeadDeptHomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HeadDeptHomeStack.Screen
        name="HeadDeptHomeScreen"
        component={HeadDeptHomeScreen}
      />
      <HeadDeptHomeStack.Screen
        name="ChooseSemesterScreen"
        component={ChooseSemesterScreen}
      />
      <HeadDeptHomeStack.Screen
        name="ImportExcelScreen"
        component={ImportExcelScreen}
      />
      <HeadDeptHomeStack.Screen
        name="PreviewDataScreen"
        component={PreviewDataScreen}
      />
    </HeadDeptHomeStack.Navigator>
  );
}
