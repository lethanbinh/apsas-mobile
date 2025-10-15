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
  color?: string; // ✅ 1. Thêm thuộc tính color vào interface
}

const AppText = ({
  children,
  style,
  variant = 'body14pxRegular',
  color, // ✅ 2. Nhận prop color
  ...rest
}: AppTextProps) => {
  // ✅ 3. Tạo style object cho màu sắc (chỉ khi prop color được truyền vào)
  const textColorStyle = color ? { color: color } : {};

  return (
    // ✅ 4. Kết hợp style từ variant, màu sắc, và style bên ngoài
    <Text style={[textStyles[variant], textColorStyle, style]} {...rest}>
      {children}
    </Text>
  );
};

export default AppText;