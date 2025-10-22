import React, { useRef, useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';

interface OtpInputProps {
  otpValue: string;
  onOtpChange: (value: string) => void;
  error?: string;
}

export default function OtpInput({
  otpValue,
  onOtpChange,
  error,
}: OtpInputProps) {
  const numInputs = 6;
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [lastValue, setLastValue] = useState(otpValue);

  const otpArray = otpValue
    .split('')
    .concat(Array(numInputs - otpValue.length).fill(''));

  const focusInput = (index: number) => {
    if (index >= 0 && index < numInputs) {
      setTimeout(() => inputsRef.current[index]?.focus(), 10);
    }
  };

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, ''); // chỉ cho phép số
    const newOtp = [...otpArray];

    // 🟢 Khi người dùng nhập số
    if (cleanText.length === 1) {
      newOtp[index] = cleanText;
      onOtpChange(newOtp.join(''));
      if (index < numInputs - 1) focusInput(index + 1);
    }

    // 🔴 Khi người dùng xóa trong cùng ô
    if (cleanText.length === 0 && otpArray[index] !== '') {
      newOtp[index] = '';
      onOtpChange(newOtp.join(''));
    }

    setLastValue(newOtp.join(''));
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otpArray];
      if (otpArray[index] === '' && index > 0) {
        // Xóa ký tự trước nếu ô hiện tại trống
        newOtp[index - 1] = '';
        onOtpChange(newOtp.join(''));
        focusInput(index - 1);
      }
    }
  };

  return (
    <View style={styles.container}>
      {otpArray.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref: TextInput | null) => {
            inputsRef.current[index] = ref;
          }}
          style={[styles.input, error ? styles.inputError : null]}
          keyboardType="default" // 👈 Để backspace hoạt động trên Android thật
          maxLength={1}
          value={digit}
          onChangeText={text => handleChangeText(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          textContentType="oneTimeCode"
          importantForAutofill="no"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 45,
    height: 55,
    textAlign: 'center',
    fontSize: 22,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  inputError: {
    borderColor: 'red',
  },
});
