import { createStackNavigator } from '@react-navigation/stack';
import ChooseSemesterScreen from '../screens/ChooseSemesterScreen';
import HeadDeptHomeScreen from '../screens/HeadDeptHomeScreen';
import ImportExcelScreen from '../screens/ImportExcelScreen';
import PlatListScreen from '../screens/PlanListScreen';
import PreviewDataScreen from '../screens/PreviewDataScreen';
import PublishPlansScreen from '../screens/PublishPlansScreen';

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
      <HeadDeptHomeStack.Screen
        name="PlatListScreen"
        component={PlatListScreen}
      />
      <HeadDeptHomeStack.Screen
        name="PublishPlansScreen"
        component={PublishPlansScreen}
      />
    </HeadDeptHomeStack.Navigator>
  );
}
