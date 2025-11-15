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
import RNPickerSelect from 'react-native-picker-select';

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

// Demo accounts data - giống hệt web
interface DemoAccount {
  accountCode: string;
  email: string;
  password: string;
  role: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { accountCode: 'ADM000001', email: 'admin1@system.com', password: 'admin@123', role: 'Admin' },
  { accountCode: 'HOD000001', email: 'Hod1@example.com', password: 'Lenam2386', role: 'HOD' },
  { accountCode: 'LEC000001', email: 'nguyenvana@example.com', password: '123456', role: 'Lecturer' },
  { accountCode: 'LEC000002', email: 'Lecturer1@example.com', password: 'Lenam2385', role: 'Lecturer' },
  { accountCode: 'LEC000003', email: 'tranthib@example.com', password: '123456', role: 'Lecturer' },
  { accountCode: 'LEC000004', email: 'leminhc@example.com', password: '123456', role: 'Lecturer' },
  { accountCode: 'LEC000005', email: 'phamthid@example.com', password: '123456', role: 'Lecturer' },
  { accountCode: 'LEC000006', email: 'hoangvane@example.com', password: '123456', role: 'Lecturer' },
  { accountCode: 'LEC000007', email: 'ngothif@example.com', password: '123456', role: 'Lecturer' },
  { accountCode: 'EXA000001', email: 'examiner1@example.com', password: 'Lenam2385', role: 'Examiner' },
  { accountCode: 'EXA000002', email: 'lehongt@example.com', password: 'Teach3r!', role: 'Examiner' },
  { accountCode: 'STU000001', email: 'namle2385@gmail.com', password: 'Lenam235', role: 'Student' },
  { accountCode: 'STU000002', email: 'dangthig@example.com', password: '123456', role: 'Student' },
  { accountCode: 'STU000003', email: 'vutranh@example.com', password: '123456', role: 'Student' },
  { accountCode: 'STU000004', email: 'doanthij@example.com', password: '123456', role: 'Student' },
  { accountCode: 'STU000005', email: 'phamanhk@example.com', password: '123456', role: 'Student' },
  { accountCode: 'STU000006', email: 'truongthil@example.com', password: '123456', role: 'Student' },
  { accountCode: 'STU000007', email: 'nguyenthanhm@example.com', password: '123456', role: 'Student' },
];

const LoginForm = () => {
  type FormData = yup.InferType<typeof schema>;

  const schema = yup.object({
    email: yup.string().required('Email is required').email('Email is invalid'),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
  });
  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [selectedDemoAccount, setSelectedDemoAccount] = useState<string | null>(null);
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
        name: decodedProfile.fullName,
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

  console.log(isLoading);

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
      console.log('Logging in with:', formData);

      const token = response.result?.token;
      const expiresAt = response.result?.expiresAt;
      console.log(token, expiresAt);
      if (token && expiresAt) {
        await handleLoginSuccess(token, expiresAt);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        throw new Error('Login response missing token or expiration time.');
      }
    } catch (error: any) {
      showErrorToast(
        'Login Failed',
        error.message || 'An unexpected error occurred.',
      );
    }

    setIsLoading(false);
  };

  const handleDemoLogin = async (accountCode: string) => {
    if (isLoading || isGoogleLoading) return;

    const account = DEMO_ACCOUNTS.find(acc => acc.accountCode === accountCode);
    if (!account) return;

    // Set form values for display
    setValue('email', account.email);
    setValue('password', account.password);

    // Call handleLogin directly with demo credentials
    await handleLogin({
      email: account.email,
      password: account.password,
    });
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

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: vs(20),
          }}
        >
          <View style={styles.divider}></View>
          <AppText style={{ color: AppColors.pr500 }}>Or login with demo account</AppText>
          <View style={styles.divider}></View>
        </View>

        <View style={styles.demoAccountContainer}>
          <RNPickerSelect
            onValueChange={value => {
              setSelectedDemoAccount(value);
              if (value) {
                handleDemoLogin(value);
              }
            }}
            items={DEMO_ACCOUNTS.map(account => ({
              label: `${account.accountCode} - ${account.role} (${account.email})`,
              value: account.accountCode,
            }))}
            value={selectedDemoAccount}
            placeholder={{
              label: 'Demo Account',
              value: null,
            }}
            style={pickerSelectStyles}
            disabled={isLoading || isGoogleLoading}
            useNativeAndroidPickerStyle={false}
          />
        </View>
      </View>
    </View>
  );
};

export default LoginForm;

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: s(12),
    paddingVertical: vs(8),
    paddingHorizontal: s(8),
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(6),
    color: AppColors.n800,
    backgroundColor: AppColors.white,
    width: s(150),
    marginTop: vs(10),
    alignSelf: 'center',
  },
  inputAndroid: {
    fontSize: s(12),
    paddingVertical: vs(8),
    paddingHorizontal: s(8),
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(6),
    color: AppColors.n800,
    backgroundColor: AppColors.white,
    width: s(150),
    marginTop: vs(10),
    alignSelf: 'center',
  },
  placeholder: {
    color: AppColors.n400,
  },
});

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
  demoAccountContainer: {
    width: '100%',
    marginTop: vs(10),
    alignItems: 'center',
  },
});
