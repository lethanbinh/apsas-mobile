import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

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
import { ApiService } from '../../utils/ApiService';
import { SecureStorage } from '../../utils/SecureStorage';
import { setUserAndToken } from '../../store/slices/userSlice';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import { signInWithGoogle } from '../../utils/googleSignIn';

dayjs.extend(utc);

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
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLoginSuccess = async (
    token: string,
    expiresAt: string | null,
  ) => {
    const decodedProfile = ApiService.decodeToken(token);
    if (decodedProfile && decodedProfile.nameid && decodedProfile.accountCode) {
      // Check for accountCode
      const userProfileForRedux = {
        id: decodedProfile.nameid,
        name: decodedProfile.name,
        email: decodedProfile.email,
        role: decodedProfile.role,
        accountCode: decodedProfile.accountCode, // Add accountCode
      };
      await SecureStorage.saveCredentials('authToken', token);
      if (expiresAt) {
        const expiresAtTimestamp = dayjs.utc(expiresAt).valueOf();
        await AsyncStorage.setItem(
          'tokenExpiresAt',
          expiresAtTimestamp.toString(),
        );
      } else {
        await AsyncStorage.removeItem('tokenExpiresAt');
        console.warn('No expiresAt received from backend for Google login.');
      }

      dispatch(setUserAndToken({ profile: userProfileForRedux, token: token }));
      showSuccessToast(
        'Login Successful',
        `Welcome ${userProfileForRedux.name || ''}!`,
      );
    } else {
      throw new Error(
        'Invalid user data received from backend token (missing id or accountCode).',
      );
    }
  };

  const handleLoginWithGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const googleIdToken = await signInWithGoogle();
      console.log(googleIdToken);
      type GoogleLoginResult = {
        token: string;
        refreshToken: string;
        expiresAt: string | null;
      };
      const backendResponse = await ApiService.post<GoogleLoginResult>(
        '/api/Auth/google',
        {
          idToken: googleIdToken,
        },
      );

      const backendToken = backendResponse.result?.token;
      const backendExpiresAt = backendResponse.result?.expiresAt;

      if (backendToken) {
        await handleLoginSuccess(backendToken, backendExpiresAt ?? null);
      } else {
        throw new Error('Backend response missing token after Google Sign-In.');
      }
    } catch (error: any) {
      if (error.message !== 'Sign in cancelled by user.') {
        showErrorToast(
          'Google Login Failed',
          error.message || 'An unexpected error occurred.',
        );
      } else {
        console.log(error.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    try {
      type LoginResult = {
        token: string;
        refreshToken: string;
        expiresAt: string;
      };
      const response = await ApiService.post<LoginResult>('/api/Auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const token = response.result?.token;
      const expiresAt = response.result?.expiresAt;

      if (token && expiresAt) {
        await handleLoginSuccess(token, expiresAt);
      } else {
        throw new Error('Login response missing token or expiration time.');
      }
    } catch (error: any) {
      showErrorToast(
        'Login Failed',
        error.message || 'An unexpected error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
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
      <View style={{ marginBottom: 10 }}></View>
      <AppTextInputController
        name="password"
        control={control}
        placeholder="Enter password"
        secureTextEntry
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
          loading={isLoading}
          disabled={isLoading || isGoogleLoading}
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
          loading={isGoogleLoading}
          disabled={isLoading || isGoogleLoading}
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
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.pr500,
    flex: 1,
    marginHorizontal: s(10),
  },
});
