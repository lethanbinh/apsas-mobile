import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import UserManagementScreen from '../screens/UserManagementScreen';

const AdminStack = createStackNavigator();

export default function AdminStackNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="UserManagementScreen" component={UserManagementScreen} />
      <AdminStack.Screen name="AdminDashboardScreen" component={AdminDashboardScreen} />
    </AdminStack.Navigator>
  );
}
