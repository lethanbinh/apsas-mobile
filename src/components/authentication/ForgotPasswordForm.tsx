import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import { EmailInputIcon } from '../../assets/icons/input-icon';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AuthenticationFooter from './AuthenticationFooter';

const ForgotPasswordForm = () => {
  type FormData = yup.InferType<typeof schema>;
  const navigation = useNavigation();
  const schema = yup.object({
    email: yup.string().required('Email is required').email('Email is invalid'),
  });
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });
  const handleSendEmail = (formData: FormData) => {
    navigation.navigate('VerifyOTPScreen' as never);
  };
  const handleNavigateToLoginScreen = () => {
    navigation.navigate('LoginScreen' as never);
  };
  return (
    <View style={styles.container}>
      <AppTextInputController
        name="email"
        control={control}
        placeholder="Enter email"
        label="Email"
        icon={<EmailInputIcon />}
      />

      <AppButton
        onPress={handleSubmit(handleSendEmail)}
        title="Continue"
        style={{ width: s(200), marginTop: vs(20) }}
        textVariant="label16pxRegular"
      />
      <View style={{ alignItems: 'center' }}>
        <AuthenticationFooter
          text="Have another account?"
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
  },
});
