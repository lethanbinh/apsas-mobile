import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { textStyles } from '../../styles/shareStyles';
import AppText from '../texts/AppText';
type Variant = keyof typeof textStyles;
interface SectionHeaderProps {
  title: string;
  buttonText?: string;
  onPress?: () => void;
  textVariant?: Variant;
  variant?: Variant;
  hasButton?: boolean;
  style?: ViewStyle;
}
const SectionHeader = ({
  title,
  buttonText,
  onPress,
  textVariant = 'h4',
  variant = 'label14pxRegular',
  hasButton = true,
  style,
}: SectionHeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      <AppText variant={textVariant}>{title}</AppText>
      {hasButton && (
        <TouchableOpacity onPress={onPress}>
          <AppText variant={variant}>{buttonText}</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
