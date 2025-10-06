import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';
import AppDropdown from './AppDropdown';

interface DropdownOption {
  label: string;
  value: string;
}

interface AppDropdownControllerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  rules?: object;
  label?: string;
  options: DropdownOption[];
  editable?: boolean;
}

const AppDropdownController = <T extends FieldValues>({
  control,
  name,
  rules,
  label,
  options,
  editable,
}: AppDropdownControllerProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <AppDropdown
            value={value}
            onValueChange={onChange}
            options={options}
            label={label}
            editable={editable}
            style={error && styles.errorInput}
          />
          {error && <AppText style={styles.textError}>{error.message}</AppText>}
        </>
      )}
    />
  );
};

export default AppDropdownController;

const styles = StyleSheet.create({
  errorInput: {
    borderColor: AppColors.errorColor,
  },
  textError: {
    color: AppColors.errorColor,
    fontSize: s(12),
    marginBottom: vs(10),
    marginTop: -vs(5),
  },
});
