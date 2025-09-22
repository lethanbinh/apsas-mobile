import React, { useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';

interface OtpInputProps {
  otpValue: string;
  onOtpChange: (otp: string) => void;
  error?: string;
}

const LENGTH = 4;

export default function OtpInput({
  otpValue,
  onOtpChange,
  error,
}: OtpInputProps) {
  const otpArray = otpValue
    .split('')
    .concat(Array(LENGTH - otpValue.length).fill(''));

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const focusInput = (idx: number) => {
    setTimeout(() => {
      inputRefs.current[idx]?.focus();
    }, 50);
  };

  const handleChange = (text: string, index: number) => {
    // ✅ Nếu paste nhiều ký tự (vd "1234")
    if (text.length > 1) {
      const chars = text.replace(/\D/g, '').split('').slice(0, LENGTH);
      if (chars.length === 0) return;

      const newOtp = [...otpArray];
      for (let i = 0; i < chars.length; i++) {
        newOtp[i] = chars[i];
      }
      onOtpChange(newOtp.join(''));

      // focus vào ô cuối cùng
      focusInput(Math.min(chars.length, LENGTH - 1));
      return;
    }

    // ✅ nhập 1 ký tự
    if (text) {
      const newOtp = [...otpArray];
      newOtp[index] = text;
      onOtpChange(newOtp.join(''));
      if (index < LENGTH - 1) {
        focusInput(index + 1);
      }
    } else {
      // ✅ xóa trong ô hiện tại → nếu Android thì cũng tự back
      const newOtp = [...otpArray];
      newOtp[index] = '';
      onOtpChange(newOtp.join(''));

      if (index > 0) {
        focusInput(index - 1);
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && otpArray[index] === '' && index > 0) {
      focusInput(index - 1);
    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={styles.inputContainer}>
        {otpArray.map((value, index) => (
          <TextInput
            key={index}
            ref={el => (inputRefs.current[index] = el)}
            style={[styles.input, error ? { borderColor: 'red' } : null]}
            value={value}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={LENGTH} // vẫn cho 4 để detect paste
          />
        ))}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 22,
    textAlign: 'center',
    width: s(50),
    height: vs(40),
    marginHorizontal: s(8),
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 12,
  },
});
