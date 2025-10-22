import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import { EmailInputIcon } from '../../assets/icons/input-icon';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AuthenticationFooter from './AuthenticationFooter';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import { sendForgotPasswordEmail } from '../../api/Authentication';

const ForgotPasswordForm = () => {
  type FormData = yup.InferType<typeof schema>;
  const navigation = useNavigation<any>();
  const schema = yup.object({
    email: yup.string().required('Email is required').email('Email is invalid'),
  });
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const result = await sendForgotPasswordEmail(formData.email);

      if (result.sent === true) {
        showSuccessToast(
          'Email Sent',
          'Password reset instructions sent to your email.',
        );
        navigation.navigate('VerifyOTPScreen', { email: formData.email });
        console.log(`OTP expires in ${result.expiresMinutes} minutes.`);
      } else {
        throw new Error('Failed to send reset email. Please try again.');
      }
    } catch (error: any) {
      showErrorToast('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLoginScreen = () => {
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={styles.container}>
      <AppTextInputController
        name="email"
        control={control}
        placeholder="Enter email"
        label="Email"
        icon={<EmailInputIcon />}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AppButton
        onPress={handleSubmit(handleSendEmail)}
        title="Continue"
        style={{ width: s(200), marginTop: vs(20) }}
        textVariant="label16pxRegular"
        loading={isLoading}
        disabled={isLoading}
      />
      <View style={{ alignItems: 'center' }}>
        <AuthenticationFooter
          text="Remembered your password?"
          onPress={handleNavigateToLoginScreen}
          buttonText="Back to login"
        />
      </View>
    </View>
  );
};

export default ForgotPasswordForm;
const styles = StyleSheet.create({
  container: {
    marginTop: vs(40),
    width: '100%',
    alignItems: 'center',
  },
});
