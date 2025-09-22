import React from 'react';
import { StyleSheet, View } from 'react-native';
import AuthenticationHeader from '../components/authentication/AuthenticationHeader';
import OtpForm from '../components/authentication/OtpForm';
import { globalStyles } from '../styles/shareStyles';
import { vs } from 'react-native-size-matters';

const VerifyOTPScreen = () => {
  return (
    <View style={styles.container}>
      <AuthenticationHeader
        title="Verify OTP code"
        description="Code has been sent to let....@gmail.com"
        isLongDescription={false}
      />
      <View style={{ marginTop: vs(20) }}>
        <OtpForm />
      </View>
    </View>
  );
};

export default VerifyOTPScreen;

const styles = StyleSheet.create({
  container: globalStyles.authenticationContainer,
});
