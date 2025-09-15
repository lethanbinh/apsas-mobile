import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AuthenticationFooter from '../components/authentication/AuthenticationFooter';
import AuthenticationHeader from '../components/authentication/AuthenticationHeader';
import RegisterForm from '../components/authentication/RegisterForm';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

const RegisterScreen = () => {
  const handleNavigateToLogin = () => {
    // Navigation logic to go to the Log in screen
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
    >
      <AppSafeView style={styles.container}>
        <AuthenticationHeader
          title="Register"
          description="Enter your account information to register a new account"
        />
        <RegisterForm />
        <AuthenticationFooter
          text="You don’t have an account?"
          onPress={handleNavigateToLogin}
          buttonText="Log in"
        />
      </AppSafeView>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(35),
    paddingBottom: vs(40),
    backgroundColor: AppColors.white
  },
});
