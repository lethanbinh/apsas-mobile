import { createStackNavigator } from '@react-navigation/stack';
import PlatListScreen from '../screens/PlanListScreen';
import PreviewDataScreen from '../screens/PreviewDataScreen';
import PublishPlansScreen from '../screens/PublishPlansScreen';

const PlanStack = createStackNavigator();

export default function PlanStackNavigator() {
  return (
    <PlanStack.Navigator screenOptions={{ headerShown: false }}>
      <PlanStack.Screen name="PlatListScreen" component={PlatListScreen} />
      <PlanStack.Screen
        name="PreviewDataScreen"
        component={PreviewDataScreen}
      />
      <PlanStack.Screen
        name="PublishPlansScreen"
        component={PublishPlansScreen}
      />
    </PlanStack.Navigator>
  );
}