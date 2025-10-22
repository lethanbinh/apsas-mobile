import React from 'react';
import { StyleSheet, TextInput, View, TextInputProps } from 'react-native'; // Import TextInputProps
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';
import { SearchIcon } from '../../assets/icons/icon';

interface AppTextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType']; // Use standard type
  style?: object;
  secureTextEntry?: boolean; // Renamed for consistency
  label?: string;
  icon?: React.ReactNode;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  searchType?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize']; // Add autoCapitalize prop
}

const AppTextInput = ({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry, // Use renamed prop
  style,
  label,
  icon,
  editable = true,
  multiline = false,
  numberOfLines = 4,
  searchType = false,
  autoCapitalize = 'sentences', // Default to 'sentences'
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
      {searchType && (
        <View style={styles.leftIcon}>
          <SearchIcon />
        </View>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          icon ? styles.inputWithIcon : undefined, // Add padding if icon exists
          searchType && styles.inputWithLeftIcon, // Add padding if search icon exists
          style,
          !editable && styles.disabled,
          multiline && { height: vs(100), textAlignVertical: 'top' },
        ]}
        editable={editable}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        autoCapitalize={autoCapitalize} // Pass down autoCapitalize
        placeholderTextColor={AppColors.n400} // Added placeholder color
      />
      {icon && <View style={styles.icon}>{icon}</View>}
    </View>
  );
};

export default AppTextInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative', // Needed for absolute icon positioning
  },
  input: {
    width: '100%',
    height: vs(40),
    borderRadius: s(6),
    borderColor: AppColors.n300,
    paddingHorizontal: s(15), // Default padding
    borderWidth: 1,
    fontSize: s(14),
    backgroundColor: AppColors.white,
    marginBottom: vs(10),
    color: AppColors.n800, // Added default text color
  },
  inputWithIcon: {
    paddingRight: s(40), // Make space for the right icon
  },
  inputWithLeftIcon: {
    paddingLeft: s(40), // Make space for the left icon
  },
  icon: {
    position: 'absolute',
    right: s(15),
    top: vs(29), // Adjust vertical position based on input height
    height: vs(20), // Ensure icon wrapper has height
    width: s(20), // Ensure icon wrapper has width
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: s(15),
    top: vs(10), // Adjust vertical position
    height: vs(20),
    width: s(20),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure it's above input field background
  },
  disabled: {
    backgroundColor: AppColors.n200,
    borderColor: AppColors.n300, // Use border color for disabled state
    color: AppColors.n500, // Disabled text color
  },
});
