import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import AppButton from '../buttons/AppButton';
import { ArrowRightIcon } from '../../assets/icons/icon';
import { AppColors } from '../../styles/color';
import { useNavigation } from '@react-navigation/native';

const ContentSection = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('AuthStack' as never);
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('AuthStack' as never);
  }

  return (
    <View style={styles.textContainer}>
      <AppText variant="h1" style={styles.title}>
        Welcome to the best assignment auto-graded system
      </AppText>
      <AppButton
        leftIcon={<ArrowRightIcon />}
        onPress={handleGetStarted}
        title="Get Started"
        style={{ width: s(250) }}
      />
      <View
        style={{
          marginTop: vs(20),
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <AppText>Already have an account? </AppText>
        <TouchableOpacity onPress={handleNavigateToLogin}>
          <AppText
            style={{
              textDecorationLine: 'underline',
              color: AppColors.pr500,
            }}
            variant="label14pxBold"
          >
            Log in
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContentSection;

const styles = StyleSheet.create({
  textContainer: {
    alignItems: 'center',
  },
  title: {
    maxWidth: s(300),
    textAlign: 'center',
    marginBottom: vs(70),
  },
});
