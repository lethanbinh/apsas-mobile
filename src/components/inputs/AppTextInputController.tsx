import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, TextInputProps } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';
import AppTextInput from './AppTextInput';

interface AppTextInputControllerProps {
  control: any;
  name: string;
  rules?: object;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  label?: string;
  icon?: React.ReactNode;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: TextInputProps['autoCapitalize'];
}

const AppTextInputController = ({
  control,
  name,
  rules,
  placeholder,
  secureTextEntry,
  keyboardType,
  label,
  icon,
  editable,
  multiline,
  numberOfLines,
  autoCapitalize = 'sentences',
}: AppTextInputControllerProps) => { // Bỏ generic ở đây
  return (
    <Controller
      control={control} // Truyền control trực tiếp
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <>
          <AppTextInput
            label={label}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            style={error && styles.errorInput}
            icon={icon}
            editable={editable}
            multiline={multiline}
            numberOfLines={numberOfLines}
            autoCapitalize={autoCapitalize}
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