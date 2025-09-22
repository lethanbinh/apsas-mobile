import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { s } from 'react-native-size-matters';
import AuthenticationFooter from '../components/authentication/AuthenticationFooter';
import AuthenticationHeader from '../components/authentication/AuthenticationHeader';
import LoginForm from '../components/authentication/LoginForm';
import { AppColors } from '../styles/color';
import { globalStyles } from '../styles/shareStyles';

const LoginScreen = () => {
  const navigation = useNavigation();
  const handleNavigateToResetPasswordScreen = () => {
    navigation.navigate('ResetPasswordScreen' as never);
  };

  return (
    <View style={styles.container}>
      <AuthenticationHeader
        title="Login"
        description="Enter your account information to log into our system"
      />
      <LoginForm />
      <AuthenticationFooter
        text="Forgot password?"
        onPress={handleNavigateToResetPasswordScreen}
        buttonText="Reset password!"
      />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: globalStyles.authenticationContainer,
});
