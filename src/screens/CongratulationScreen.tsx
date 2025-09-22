import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { globalStyles } from '../styles/shareStyles';
import AuthenticationHeader from '../components/authentication/AuthenticationHeader';
import { CheckIcon } from '../assets/icons/icon';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../components/buttons/AppButton';
import { s, vs } from 'react-native-size-matters';

const CongratulationScreen = () => {
  const navigation = useNavigation();
  const handleNavigateToLoginScreen = () => {
    navigation.navigate('LoginScreen' as never);
  };
  return (
    <View style={styles.container}>
      <AuthenticationHeader
        title="Congratulations"
        description="Your Password has been reset successfully"
        icon={<CheckIcon />}
      />

      <AppButton
        onPress={handleNavigateToLoginScreen}
        title="Back to Login"
        style={{ width: s(200), marginTop: vs(40) }}
        textVariant="label16pxRegular"
      />
    </View>
  );
};

export default CongratulationScreen;

const styles = StyleSheet.create({
  container: globalStyles.authenticationContainer,
});
