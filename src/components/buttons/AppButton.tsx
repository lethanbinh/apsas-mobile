import React from 'react';
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ActivityIndicator, // Import ActivityIndicator
  View,             // Import View for layout
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { textStyles } from '../../styles/shareStyles';

type TextVariant = keyof typeof textStyles;

interface AppButtonProps {
  onPress: () => void;
  title?: string;
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
  loading?: boolean; // Add loading prop
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
  loading = false, // Default loading to false
}: AppButtonProps) => {
  let sizeStyle = styles.medium;
  if (size === 'large') {
    sizeStyle = styles.large;
  } else if (size === 'small') {
    sizeStyle = styles.small;
  }

  // Determine effective background and text color based on variant
  let effectiveBackgroundColor = backgroundColor;
  let effectiveTextColor = textColor;
  let effectiveBorderColor = 'transparent'; // Default no border

  if (variant === 'secondary') {
    effectiveBackgroundColor = AppColors.white;
    effectiveTextColor = AppColors.n800; // Use a default text color for secondary
    effectiveBorderColor = AppColors.n800;
  } else if (variant === 'danger') {
    effectiveBackgroundColor = AppColors.white;
    effectiveTextColor = AppColors.errorColor; // Use error color for text
    effectiveBorderColor = AppColors.errorColor;
  }

  // Apply disabled styles
  const isDisabled = disabled || loading;
  const disabledStyle = isDisabled ? styles.disabled : {};
  const disabledTextStyle = isDisabled ? styles.disabledText : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: effectiveBackgroundColor,
          borderColor: effectiveBorderColor, // Apply border color
          borderWidth: variant !== 'primary' ? 1 : 0, // Add border for non-primary
        },
        styles[variant], // Apply base variant styles (might override border/bg)
        sizeStyle,
        style,
        disabledStyle, // Apply disabled style last
      ]}
      disabled={isDisabled} // Disable if loading or explicitly disabled
    >
      {loading ? (
        <ActivityIndicator color={effectiveTextColor} size="small" />
      ) : (
        <>
          {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}
          {title && (
            <AppText
              style={[
                styles.textTitle,
                { color: effectiveTextColor },
                ...(styleTitle
                  ? Array.isArray(styleTitle)
                    ? styleTitle
                    : [styleTitle]
                  : []),
                disabledTextStyle, // Apply disabled text style
              ]}
              variant={textVariant}
            >
              {title}
            </AppText>
          )}
          {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}
        </>
      )}
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
    borderWidth: 1, // Add default border width
    borderColor: 'transparent', // Default transparent
  },
  textTitle: {
    textAlign: 'center', // Ensure text is centered
  },
  iconWrapper: {
    // Add if you need specific styling around icons
  },
  primary: {
    // Keep primary background color defined by prop or default
    borderColor: AppColors.pr500, // Ensure border matches background if needed
  },
  secondary: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.n800,
  },
  danger: {
    backgroundColor: AppColors.white,
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
  disabled: {
    backgroundColor: AppColors.n200, // Example disabled background
    borderColor: AppColors.n300, // Example disabled border
    opacity: 0.6,
  },
  disabledText: {
    color: AppColors.n500, // Example disabled text color
  },
});