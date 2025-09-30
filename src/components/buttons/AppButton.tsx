import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { textStyles } from '../../styles/shareStyles';

type TextVariant = keyof typeof textStyles;

interface AppButtonProps {
  onPress: () => void;
  title: string;
  backgroundColor?: string;
  textColor?: string;
  style?: Object;
  styleTitle?: TextStyle | TextStyle[];
  disabled?: boolean;
  textVariant?: TextVariant;
  variant?: 'primary' | 'secondary' | 'danger';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'large' | 'medium' | 'small';
}

const AppButton = ({
  onPress,
  title,
  backgroundColor = AppColors.pr500,
  textColor = AppColors.white,
  style,
  styleTitle,
  disabled = false,
  textVariant = 'label16pxRegular',
  variant = 'primary',
  leftIcon,
  rightIcon,
  size = 'medium',
}: AppButtonProps) => {
  let sizeStyle = styles.medium;
  if (size === 'large') {
    sizeStyle = styles.large;
  } else if (size === 'small') {
    sizeStyle = styles.small;
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: backgroundColor,
        },
        styles[variant],
        sizeStyle,
        style,
      ]}
      disabled={disabled}
    >
      {leftIcon}
      <AppText
        style={[
          styles.textTitle,
          {
            color: textColor,
          },
          ...(styleTitle
            ? Array.isArray(styleTitle)
              ? styleTitle
              : [styleTitle]
            : []),
        ]}
        variant={textVariant}
      >
        {title}
      </AppText>
      {rightIcon}
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(4),
    alignSelf: 'center',
    flexDirection: 'row',
    gap: s(8),
  },

  textTitle: {},
  primary: {},
  secondary: {
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.n800,
  },
  danger: {
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.errorColor,
  },
  large: {
    paddingVertical: vs(14),
    paddingHorizontal: s(24),
    minWidth: s(200),
  },
  medium: {
    paddingVertical: vs(10),
    paddingHorizontal: s(16),
    minWidth: s(150),
  },
  small: {
    paddingVertical: vs(6),
    paddingHorizontal: s(8),
    minWidth: s(100),
  },
});
