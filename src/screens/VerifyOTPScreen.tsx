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

const VerifyOTPScreen = () => {
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
            description="Code has been sent to let....@gmail.com"
            isLongDescription={false}
          />
          <View style={{ marginTop: vs(20) }}>
            <OtpForm />
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