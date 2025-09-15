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
}

const AppText = ({
  children,
  style,
  variant = 'body14pxRegular',
  ...rest
}: AppTextProps) => {
  return (
    <Text style={[textStyles[variant], style]} {...rest}>
      {children}
    </Text>
  );
};

export default AppText;
