import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import CreateNewPasswordScreen from '../screens/CreateNewPasswordScreen';
import CongratulationScreen from '../screens/CongratulationScreen';

const AuthStack = createStackNavigator();

export default function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen name="VerifyOTPScreen" component={VerifyOTPScreen} />
      <AuthStack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />
      <AuthStack.Screen
        name="CreateNewPasswordScreen"
        component={CreateNewPasswordScreen}
      />
      <AuthStack.Screen
        name="CongratulationScreen"
        component={CongratulationScreen}
      />
    </AuthStack.Navigator>
  );
}
