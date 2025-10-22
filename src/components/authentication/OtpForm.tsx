// Tên file: components/authentication/OtpForm.tsx
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import AppButton from '../buttons/AppButton';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import AuthenticationFooter from './AuthenticationFooter';
import OtpInput from './OtpInput';
import { verifyOtp } from '../../api/Authentication';

const schema = yup.object({
  otp: yup
    .string()
    .required('OTP is required')
    .length(6, 'OTP must be 6 digits')
    .matches(/^\d{6}$/, 'OTP must be numeric'),
});

type FormData = yup.InferType<typeof schema>;

interface OtpFormProps {
  email: string;
}

const OtpForm = ({ email }: OtpFormProps) => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigateToLoginScreen = () => {
    navigation.navigate('LoginScreen');
  };
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { otp: '' },
  });

  const handleVerifyOtp = async (formData: FormData) => {
    setIsLoading(true);
    try {
      console.log(email);
      const response = await verifyOtp(email, formData.otp);
      if (response.result?.verified === true) {
        showSuccessToast(
          'OTP Verified',
          response.result.message ||
            'OTP is correct. You can create a new password now.',
        );

        navigation.navigate('CreateNewPasswordScreen', {
          email: email,
          otp: formData.otp,
        });
      } else {
        // This case might occur if isSuccess is true but verified is false (unlikely based on API docs)
        throw new Error(
          response.errorMessages?.join(', ') || 'OTP verification failed.',
        );
      }
    } catch (error: any) {
      // Handles isSuccess: false (e.g., "Invalid OTP") and network errors
      showErrorToast(
        'OTP Incorrect',
        error.message || 'OTP verification failed, please try again!',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <View style={styles.container}>
        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <OtpInput
              otpValue={value}
              onOtpChange={onChange}
              error={error?.message}
            />
          )}
        />
      </View>

      <AppButton
        onPress={handleSubmit(handleVerifyOtp)}
        title="Continue"
        style={{ width: s(200), marginTop: vs(20) }}
        textVariant="label16pxRegular"
        loading={isLoading}
        disabled={isLoading}
      />

      <View style={{ alignItems: 'center', marginTop: vs(10) }}>
        <AuthenticationFooter
          text="Remembered your password?"
          onPress={handleNavigateToLoginScreen}
          buttonText="Back to login"
        />
      </View>
    </View>
  );
};

export default OtpForm;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
});
