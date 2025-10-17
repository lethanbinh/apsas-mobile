import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AuthenticationHeader from '../components/authentication/AuthenticationHeader';
import CreateNewPasswordForm from '../components/authentication/CreateNewPasswordForm';
import AppSafeView from '../components/views/AppSafeView';
import { globalStyles } from '../styles/shareStyles';

const CreateNewPasswordScreen = () => {
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
          />
          <CreateNewPasswordForm />
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
