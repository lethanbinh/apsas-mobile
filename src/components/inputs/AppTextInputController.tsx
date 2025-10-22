import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { StyleSheet, TextInputProps } from 'react-native'; // Import TextInputProps
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';
import AppTextInput from './AppTextInput';

interface AppTextInputControllerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  rules?: object;
  placeholder?: string;
  securityTextEntry?: boolean; // Renamed for consistency
  keyboardType?: TextInputProps['keyboardType']; // Use standard type
  label?: string;
  icon?: React.ReactNode;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: TextInputProps['autoCapitalize']; // Add autoCapitalize prop
}

const AppTextInputController = <T extends FieldValues>({
  control,
  name,
  rules,
  placeholder,
  securityTextEntry,
  keyboardType,
  label,
  icon,
  editable,
  multiline,
  numberOfLines,
  autoCapitalize = 'sentences', // Default to 'sentences'
}: AppTextInputControllerProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <AppTextInput
            label={label}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            secureTextEntry={securityTextEntry} // Use renamed prop
            keyboardType={keyboardType}
            style={error && styles.errorInput}
            icon={icon}
            editable={editable}
            multiline={multiline}
            numberOfLines={numberOfLines}
            autoCapitalize={autoCapitalize} // Pass down autoCapitalize
          />
          {error && <AppText style={styles.textError}>{error.message}</AppText>}
        </>
      )}
    />
  );
};

export default AppTextInputController;

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