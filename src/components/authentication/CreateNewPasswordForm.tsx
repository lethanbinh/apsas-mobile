import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import { PasswordInputIcon } from '../../assets/icons/input-icon';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';

const CreateNewPasswordForm = () => {
  const navigation = useNavigation();
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
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const handleCreateNewPassword = () => {
    navigation.navigate('CongratulationScreen' as never);
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

      <AppTextInputController
        name="retypePassword"
        control={control}
        placeholder="Retype Password"
        securityTextEntry
        label="Password"
        icon={<PasswordInputIcon />}
      />

      <AppButton
        onPress={handleSubmit(handleCreateNewPassword)}
        title="Reset Password"
        style={{ width: s(200), marginTop: vs(20) }}
        textVariant="label14pxRegular"
      />
    </View>
  );
};

export default CreateNewPasswordForm;

const styles = StyleSheet.create({
  container: {
    marginTop: vs(20),
    width: '100%',
  },
});
