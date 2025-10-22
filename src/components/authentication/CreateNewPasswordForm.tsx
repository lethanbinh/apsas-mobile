import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react'; // Import useState
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import { PasswordInputIcon } from '../../assets/icons/input-icon';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import { resetPassword } from '../../api/Authentication'; // Import resetPassword
import { showErrorToast, showSuccessToast } from '../toasts/AppToast'; // Import toasts

interface CreateNewPasswordFormProps {
  email: string;
  otp: string;
}

const CreateNewPasswordForm = ({ email, otp }: CreateNewPasswordFormProps) => {
  // Receive props
  const navigation = useNavigation<any>(); // Use any or define types
  type FormData = yup.InferType<typeof schema>;

  const schema = yup.object({
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    retypePassword: yup
      .string()
      .required('Retype password is required')
      .min(6, 'Password must be at least 6 characters')
      .oneOf([yup.ref('password')], 'Password does not match'),
  });
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      password: '',
      retypePassword: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleCreateNewPassword = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const response = await resetPassword(email, otp, formData.password);

      if (response.result?.reset === true) {
        showSuccessToast('Success', 'Password has been reset successfully.');
        navigation.navigate('CongratulationScreen'); // Or 'LoginScreen'
      } else {
        throw new Error(
          response.errorMessages?.join(', ') || 'Failed to reset password.',
        );
      }
    } catch (error: any) {
      showErrorToast('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppTextInputController
        name="password"
        control={control}
        placeholder="Enter password"
        securityTextEntry
        label="Password"
        icon={<PasswordInputIcon />}
      />
      {/* Add margin between inputs */}
      <View style={{ marginBottom: vs(10) }} />
      <AppTextInputController
        name="retypePassword"
        control={control}
        placeholder="Retype Password"
        securityTextEntry
        label="Retype Password" // Changed label
        icon={<PasswordInputIcon />}
      />

      <AppButton
        onPress={handleSubmit(handleCreateNewPassword)}
        title="Reset Password"
        style={{ width: s(200), marginTop: vs(20) }}
        textVariant="label14pxRegular"
        loading={isLoading} // Pass loading state
        disabled={isLoading} // Disable while loading
      />
    </View>
  );
};

export default CreateNewPasswordForm;

const styles = StyleSheet.create({
  container: {
    marginTop: vs(20),
    width: '100%',
    alignItems: 'center',
  },
});
