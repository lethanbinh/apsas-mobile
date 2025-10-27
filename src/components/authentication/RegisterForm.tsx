import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import {
  EmailInputIcon,
  GoogleIcon,
  PasswordInputIcon,
  RegisterIcon,
  UserIcon,
} from '../../assets/icons/input-icon';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';

const RegisterForm = () => {
  type FormData = yup.InferType<typeof schema>;

  const schema = yup.object({
    email: yup.string().required('Email is required').email('Email is invalid'),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    retypePassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please retype your password'),
    fullname: yup.string().required('Fullname is required'),
    phoneNumber: yup
      .string()
      .required('Phone number is required')
      .matches(/^[0-9]+$/, 'Phone number is not valid')
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number must be at most 15 digits'),
  });
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const handleLoginWithGoogle = () => {};
  const handleRegister = (formData: FormData) => {};
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
        name="fullname"
        control={control}
        placeholder="Enter full name"
        label="Email"
        icon={<UserIcon />}
      />
      <View style={{ marginBottom: 10 }}></View>

      <AppTextInputController
        name="phoneNumber"
        control={control}
        placeholder="Enter phone number"
        label="Phone Number"
        icon={<UserIcon />}
      />
      <View style={{ marginBottom: 10 }}></View>
      <AppTextInputController
        name="password"
        control={control}
        placeholder="Enter password"
        secureTextEntry
        label="Password"
        icon={<PasswordInputIcon />}
      />
      <View style={{ marginBottom: 10 }}></View>
      <AppTextInputController
        name="retypePassword"
        control={control}
        placeholder="Retype password"
        secureTextEntry
        label="Retype Password"
        icon={<PasswordInputIcon />}
      />
      <View>
        <AppButton
          leftIcon={<RegisterIcon />}
          onPress={handleSubmit(handleRegister)}
          title="Register"
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
          <AppText style={{ color: AppColors.pr500 }}>
            Or register with?
          </AppText>
          <View style={styles.divider}></View>
        </View>
        <AppButton
          leftIcon={<GoogleIcon />}
          onPress={handleLoginWithGoogle}
          title="Register with Google"
          style={{ width: s(230), marginTop: vs(20) }}
          size="small"
          textVariant="label14pxRegular"
        />
      </View>
    </View>
  );
};
export default RegisterForm;
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
