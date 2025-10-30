import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';

interface RadioWithTitle {
  selected: boolean;
  title: string;
  onPress: () => void;
  disabled?: boolean; // <-- Thêm prop
}

const RadioWithTitle = ({
  selected,
  title,
  onPress,
  disabled = false, // <-- Lấy prop và gán giá trị mặc định
}: RadioWithTitle) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabledContainer]} // <-- Thêm style disabled
      onPress={onPress}
      disabled={disabled} // <-- Thêm disabled
    >
      <View
        style={[
          styles.circle,
          selected && styles.selectedCircle,
          disabled && styles.disabledCircle,
        ]}
      >
        {selected && (
          <View
            style={[
              styles.innerCircle,
              disabled && styles.disabledInnerCircle,
            ]}
          ></View>
        )}
      </View>
      <AppText
        variant="body14pxRegular"
        style={[
          styles.title,
          selected && !disabled && styles.selectedTitle,
          disabled && styles.disabledTitle,
        ]}
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

export default RadioWithTitle;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(3),
  },
  disabledContainer: { // <-- Thêm style
    opacity: 0.5,
  },
  circle: {
    height: s(15),
    width: s(15),
    borderRadius: "50%", // <-- Sửa '50%' thành 50
    borderWidth: 2,
    borderColor: AppColors.n300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: { // <-- Thêm style
    borderColor: AppColors.pr500,
  },
  disabledCircle: { // <-- Thêm style
    borderColor: AppColors.n200,
  },
  innerCircle: {
    height: s(10),
    width: s(10),
    borderRadius: 50, // <-- Sửa '50%' thành 50
    backgroundColor: AppColors.pr500,
  },
  disabledInnerCircle: { // <-- Thêm style
    backgroundColor: AppColors.n300,
  },
  title: {
    marginStart: s(7),
  },
  selectedTitle: { // <-- Đổi tên từ 'selected'
    color: AppColors.pr500,
  },
  disabledTitle: { // <-- Thêm style
    color: AppColors.n500,
  },
});