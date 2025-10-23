import React, { ReactNode } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { s } from 'react-native-size-matters';
import { textStyles } from '../../styles/shareStyles';
import AppText from '../texts/AppText';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons
import { AppColors } from '../../styles/color'; // Import AppColors

type Variant = keyof typeof textStyles;
interface SectionHeaderProps {
  title: string;
  buttonText?: string;
  onPress?: () => void;
  textVariant?: Variant;
  variant?: Variant;
  hasButton?: boolean;
  style?: ViewStyle;
  onAdd?: () => void; // Add the onAdd prop
}
const SectionHeader = ({
  title,
  buttonText,
  onPress,
  textVariant = 'h4',
  variant = 'label14pxRegular',
  hasButton = true,
  style,
  onAdd, // Destructure onAdd
}: SectionHeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      <AppText variant={textVariant}>{title}</AppText>
      <View style={styles.buttonGroup}>
        {hasButton && (
          <TouchableOpacity onPress={onPress}>
            <AppText variant={variant}>{buttonText}</AppText>
          </TouchableOpacity>
        )}
        {onAdd && (
          <TouchableOpacity onPress={onAdd} style={styles.addButton}>
            <Ionicons name="add-circle" size={s(26)} color={AppColors.pr500} />
          </TouchableOpacity>
        )}
      </View>
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
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
  },
  addButton: {
    // Add specific styles for the add button if needed
  },
});