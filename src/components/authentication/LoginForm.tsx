import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import {
  EmailInputIcon,
  GoogleIcon,
  LoginIcon,
  PasswordInputIcon,
} from '../../assets/icons/input-icon';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';

const LoginForm = () => {
  type FormData = yup.InferType<typeof schema>;

  const schema = yup.object({
    email: yup.string().required('Email is required').email('Email is invalid'),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
  });
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const handleLoginWithGoogle = () => {};
  const handleLogin = (formData: FormData) => {};
  return (
    <View style={styles.container}>
      <AppTextInputController
        name="email"
        control={control}
        placeholder="Enter email"
        label="Email"
        icon={<EmailInputIcon />}
      />
      <View style={{ marginBottom: 10 }}></View>
      <AppTextInputController
        name="password"
        control={control}
        placeholder="Enter password"
        securityTextEntry
        label="Password"
        icon={<PasswordInputIcon />}
      />

      <View>
        <AppButton
          leftIcon={<LoginIcon />}
          onPress={handleSubmit(handleLogin)}
          title="Login"
          style={{ width: s(230), marginTop: vs(20) }}
          size="small"
          textVariant="label14pxRegular"
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: vs(20),
          }}
        >
          <View style={styles.divider}></View>
          <AppText style={{ color: AppColors.pr500 }}>Or login with?</AppText>
          <View style={styles.divider}></View>
        </View>

        <AppButton
          leftIcon={<GoogleIcon />}
          onPress={handleLoginWithGoogle}
          title="Login with Google"
          style={{ width: s(230), marginTop: vs(20) }}
          size="small"
          textVariant="label14pxRegular"
        />
      </View>
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  container: {
    marginTop: vs(20),
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.pr500,
    flex: 1,
    marginHorizontal: s(10),
  },
});
