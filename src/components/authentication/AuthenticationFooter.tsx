import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';

interface AuthenticationFooterProps {
  text?: string;
  onPress?: () => void;
  buttonText?: string;
}

const AuthenticationFooter = ({
  text,
  onPress,
  buttonText,
}: AuthenticationFooterProps) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 4,
        marginTop: 30,
        alignItems: 'center',
      }}
    >
      <AppText>{text}</AppText>
      <TouchableOpacity onPress={onPress}>
        <AppText
          variant="body14pxBold"
          style={{ color: AppColors.pr500, textDecorationLine: 'underline' }}
        >
          {buttonText}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

export default AuthenticationFooter;

const styles = StyleSheet.create({});
