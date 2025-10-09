import { createStackNavigator } from '@react-navigation/stack';
import ScoreDetailScreen from '../screens/ScoreDetailScreen';
import SubmissionHistoryScreen from '../screens/SubmissionHistoryScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const HistoryStack = createStackNavigator();

export default function HistoryStackNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="SubmissionHistoryScreen" component={SubmissionHistoryScreen} />
      <HistoryStack.Screen name="ScoreDetailScreen" component={ScoreDetailScreen} />
      <HistoryStack.Screen name="FeedbackScreen" component={FeedbackScreen} />
    </HistoryStack.Navigator>
  );
}
