import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AuthenticationHeader from '../components/authentication/AuthenticationHeader';
import LoginForm from '../components/authentication/LoginForm';
import AuthenticationFooter from '../components/authentication/AuthenticationFooter';
import { s } from 'react-native-size-matters';
import { AppColors } from '../styles/color';

const LoginScreen = () => {
  const handleNavigateToRegister = () => {
    // Navigation logic to go to the Register screen
  };

  return (
    <View style={styles.container}>
      <AuthenticationHeader
        title="Login"
        description="Enter your account information to log into our system"
      />
      <LoginForm />
      <AuthenticationFooter
        text="You don’t have an account?"
        onPress={handleNavigateToRegister}
        buttonText="Register"
      />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(35),
    backgroundColor: AppColors.white
  },
});
