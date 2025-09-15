import React from 'react';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppIcon } from '../assets/icons/icon';
import AppText from '../components/texts/AppText';
import { AppColors } from '../styles/color';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <AppIcon />
      </View>
      <View style={styles.textContainer}>
        <AppText variant="h1" style={styles.title}>
          Auto Assessment
        </AppText>
        <AppText variant="label14pxRegular">Supportive system</AppText>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: { marginBottom: 22 },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    maxWidth: s(260),
    textAlign: 'center',
    marginBottom: vs(10),
    color: AppColors.pr500,
  },
});
