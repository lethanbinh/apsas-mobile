import React from 'react';
import { StyleSheet, View } from 'react-native';
import AuthenticationHeader from '../components/authentication/AuthenticationHeader';
import ForgotPasswordForm from '../components/authentication/ForgotPasswordForm';
import { globalStyles } from '../styles/shareStyles';

const ResetPasswordScreen = () => {
  return (
    <View style={styles.container}>
      <AuthenticationHeader
        title="Forgot Password"
        description="Recover your account password"
      />
      <ForgotPasswordForm />
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: globalStyles.authenticationContainer,
});
