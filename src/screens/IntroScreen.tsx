import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppIcon } from '../assets/icons/icon';
import ContentSection from '../components/intro/ContentSection';
import { AppColors } from '../styles/color';

const IntroScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <AppIcon />
      </View>
      <ContentSection />
    </View>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white
  },
  logoContainer: { marginBottom: 70 },
});
