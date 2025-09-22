import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import AppButton from '../buttons/AppButton';
import AuthenticationFooter from './AuthenticationFooter';
import OtpInput from './OtpInput';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';

const schema = yup.object({
  otp: yup
    .string()
    .required('OTP is required')
    .length(4, 'OTP must be 4 digits')
    .matches(/^\d{4}$/, 'OTP must be numeric'),
});

type FormData = yup.InferType<typeof schema>;
const OtpForm = () => {
  const navigation = useNavigation();

  const handleNavigateToLoginScreen = () => {
    navigation.navigate('LoginScreen' as never);
  };
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { otp: '' },
  });

  const handleVerifyOtp = (formData: FormData) => {
    if (formData.otp === '1234') {
      showSuccessToast(
        'OTP verified',
        'OTP is correct. You can create new password now',
      );
      navigation.navigate('CreateNewPasswordScreen' as never);
    } else {
      showErrorToast('OTP Incorrect', 'OTP incorrect, please try again!');
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
      />

      <View style={{ alignItems: 'center', marginTop: vs(10) }}>
        <AuthenticationFooter
          text="Have another account?"
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
  },
});
