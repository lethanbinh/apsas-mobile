import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AuthenticationHeader from '../components/authentication/AuthenticationHeader';
import ForgotPasswordForm from '../components/authentication/ForgotPasswordForm';
import AppSafeView from '../components/views/AppSafeView';
import { globalStyles } from '../styles/shareStyles';

const ResetPasswordScreen = () => {
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
            title="Forgot Password"
            description="Recover your account password"
          />
          <ForgotPasswordForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppSafeView>
  );
};

export default ResetPasswordScreen;

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
