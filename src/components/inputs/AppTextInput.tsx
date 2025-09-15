import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';
import { EmailInputIcon } from '../../assets/icons/input-icon';

interface AppTextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  style?: object;
  securityTextEntry?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

const AppTextInput = ({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  securityTextEntry,
  style,
  label,
  icon,
}: AppTextInputProps) => {
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
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={securityTextEntry}
        style={[styles.input, style]}
      />
      {icon && <View style={styles.icon}>{icon}</View>}
    </View>
  );
};

export default AppTextInput;
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: vs(40),
    borderRadius: s(6),
    borderColor: AppColors.n300,
    paddingHorizontal: s(15),
    borderWidth: 1,
    fontSize: s(14),
    backgroundColor: AppColors.white,
    marginBottom: vs(10),
    position: 'relative',
  },

  icon: {
    position: 'absolute',
    right: s(15),
    top: "50%",
    transform: [{ translateY: -5 }],
  }
});
