import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';

interface DropdownOption {
  label: string;
  value: string;
}

interface AppDropdownProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: DropdownOption[];
  label?: string;
  style?: object;
  editable?: boolean;
}

const AppDropdown = ({
  value,
  onValueChange,
  options,
  label,
  style,
  editable = true,
}: AppDropdownProps) => {
  return (
    <View style={styles.container}>
      {label && (
        <AppText
          style={{
            color: AppColors.n700,
            marginBottom: vs(4),
          }}
          variant="label16pxBold"
        >
          {label}
        </AppText>
      )}
      <View
        style={[styles.pickerContainer, style, !editable && styles.disabled]}
      >
        <Picker
          selectedValue={value}
          onValueChange={val => onValueChange?.(val)}
          enabled={editable}
          style={styles.picker}
        >
          {options.map((opt, idx) => (
            <Picker.Item key={idx} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default AppDropdown;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: vs(10),
  },
  pickerContainer: {
    width: '100%',
    height: vs(40),
    borderRadius: s(6),
    borderColor: AppColors.n300,
    borderWidth: 1,
    backgroundColor: AppColors.white,
    justifyContent: 'center',
    paddingHorizontal: s(5)
  },
  picker: {
    width: '100%',
    height: '100%',
  },
  disabled: {
    backgroundColor: AppColors.n200,
  },
});
