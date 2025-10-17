import React, { useRef } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';

interface OtpInputProps {
  otpValue: string;
  onOtpChange: (otp: string) => void;
  error?: string;
}

const LENGTH = 6;

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
    if (idx < 0 || idx >= LENGTH) return;
    // Dùng setTimeout để đảm bảo focus được thực hiện sau các event khác
    setTimeout(() => {
      inputRefs.current[idx]?.focus();
    }, 10);
  };

  const handleChange = (text: string, index: number) => {
    // Chỉ xử lý khi có ký tự mới được nhập (không xử lý xóa)
    // Lọc bỏ ký tự không phải số
    const newText = text.replace(/\D/g, '');

    if (newText.length > 0) {
      const newOtp = [...otpArray];
      newOtp[index] = newText.charAt(0); // Chỉ lấy ký tự đầu tiên
      onOtpChange(newOtp.join(''));

      // Tự động nhảy tới ô tiếp theo
      if (index < LENGTH - 1) {
        focusInput(index + 1);
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otpArray];
      
      // Nếu ô hiện tại có ký tự, chỉ cần xóa nó đi.
      // Dù onChangeText cũng có thể xử lý, nhưng onKeyPress sẽ đảm bảo lùi về ô trước ngay lập tức.
      if (newOtp[index]) {
        newOtp[index] = '';
        onOtpChange(newOtp.join(''));
      }
      // Luôn lùi về ô trước đó nếu không phải ô đầu tiên
      else if (index > 0) {
        focusInput(index - 1);
      }
    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={styles.inputContainer}>
        {otpArray.map((value, index) => (
          <TextInput
            key={index}
            ref={el => {
              inputRefs.current[index] = el;
            }}
            style={[styles.input, error ? { borderColor: 'red' } : null]}
            value={value}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1} // Quan trọng: Chỉ cho phép nhập 1 ký tự mỗi ô
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
    width: s(40),
    height: vs(40),
    marginHorizontal: s(4),
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 12,
  },
});