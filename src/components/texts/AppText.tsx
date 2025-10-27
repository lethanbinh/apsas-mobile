import React from 'react';
import {
  StyleProp,
  Text,
  TextProps,
  TextStyle
} from 'react-native';
import { textStyles } from '../../styles/shareStyles';

type Variant = keyof typeof textStyles;

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: Variant;
  color?: string;
}

const AppText = ({
  children,
  style,
  variant = 'body14pxRegular',
  color,
  ...rest
}: AppTextProps) => {
  const textColorStyle = color ? { color: color } : {};

  return (
    <Text style={[textStyles[variant], textColorStyle, style]} {...rest}>
      {children}
    </Text>
  );
};

export default AppText;