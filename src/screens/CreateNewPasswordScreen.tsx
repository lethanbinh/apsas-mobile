import { useRoute } from '@react-navigation/native'; // Import useRoute
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from 'react-native';
import AuthenticationHeader from '../components/authentication/AuthenticationHeader';
import CreateNewPasswordForm from '../components/authentication/CreateNewPasswordForm';
import AppSafeView from '../components/views/AppSafeView';
import { globalStyles } from '../styles/shareStyles';

const CreateNewPasswordScreen = () => {
  const route = useRoute();
  const email = (route.params as { email?: string })?.email ?? '';
  const otp = (route.params as { otp?: string })?.otp ?? '';

  if (!email || !otp) {
      console.error("Email or OTP missing in navigation params for CreateNewPasswordScreen");
  }
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
            title="Create new Password"
            description="Type your new password"
            isLongDescription={false} // Adjust if needed
          />
          <CreateNewPasswordForm email={email} otp={otp} />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppSafeView>
  );
};

export default CreateNewPasswordScreen;

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