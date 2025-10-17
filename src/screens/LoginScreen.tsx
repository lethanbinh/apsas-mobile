import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from 'react-native';
import AuthenticationFooter from '../components/authentication/AuthenticationFooter';
import AuthenticationHeader from '../components/authentication/AuthenticationHeader';
import LoginForm from '../components/authentication/LoginForm';
import AppSafeView from '../components/views/AppSafeView'; // Sử dụng AppSafeView làm gốc
import { globalStyles } from '../styles/shareStyles';

const LoginScreen = () => {
  const navigation = useNavigation();
  const handleNavigateToResetPasswordScreen = () => {
    navigation.navigate('ResetPasswordScreen' as never);
  };

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
            title="Login"
            description="Enter your account information to log into our system"
          />
          <LoginForm />
          <AuthenticationFooter
            text="Forgot password?"
            onPress={handleNavigateToResetPasswordScreen}
            buttonText="Reset password!"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppSafeView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    ...globalStyles.authenticationContainer, // Kế thừa style cũ
    flexGrow: 1, // Đảm bảo ScrollView có thể giãn ra
    justifyContent: 'center', // Căn giữa nội dung theo chiều dọc
  },
});