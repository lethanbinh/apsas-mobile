import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { vs } from 'react-native-size-matters';
import AuthenticationHeader from '../components/authentication/AuthenticationHeader';
import OtpForm from '../components/authentication/OtpForm';
import AppSafeView from '../components/views/AppSafeView';
import { globalStyles } from '../styles/shareStyles';
import { useRoute } from '@react-navigation/native'; // Import useRoute

const VerifyOTPScreen = () => {
  const route = useRoute(); // Get route object
  const email = (route.params as { email?: string })?.email ?? ''; // Safely get email param

  // Mask the email for display
  const maskEmail = (emailAddr: string) => {
    if (!emailAddr || !emailAddr.includes('@')) {
      return 'your email'; // Fallback
    }
    const [name, domain] = emailAddr.split('@');
    if (name.length <= 3) {
      return `${name.slice(0, 1)}***@${domain}`;
    }
    return `${name.slice(0, 3)}****@${domain}`;
  };

  const maskedEmail = maskEmail(email);

  return (
    <AppSafeView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AuthenticationHeader
            title="Verify OTP code"
            description={`Code has been sent to ${maskedEmail}`} // Use masked email
            isLongDescription={false}
          />
          <View style={{ marginTop: vs(20) }}>
            <OtpForm email={email} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppSafeView>
  );
};

export default VerifyOTPScreen;

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    ...globalStyles.authenticationContainer,
    flexGrow: 1,
    justifyContent: 'center',
  },
});