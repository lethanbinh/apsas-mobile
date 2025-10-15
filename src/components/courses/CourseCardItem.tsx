import React, { ReactNode, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { s } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { useNavigation } from '@react-navigation/native';
import BottomSheet from '../common/BottomSheet';
import SectionHeader from '../common/SectionHeader';
import TestCaseForm from './TestCaseForm';

interface CourseCardItemProps {
  title: string;
  leftIcon: ReactNode;
  backGroundColor: string;
  rightIcon: ReactNode;
  linkTo?: string;
  hasTestCase?: boolean;
  onDownload?: () => void;
  style?: ViewStyle;
  onPress?: () => void; // Thêm prop onPress mới
}

const CourseCardItem = ({
  title = 'Curriculum',
  leftIcon,
  backGroundColor = '',
  rightIcon,
  linkTo,
  hasTestCase = false,
  onDownload,
  style,
  onPress, // Destructure prop mới
}: CourseCardItemProps) => {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);

  // Tạo một hàm xử lý trung gian
  const handlePress = () => {
    // Ưu tiên chạy onPress được truyền từ bên ngoài
    if (onPress) {
      onPress();
      return;
    }

    // Nếu không có onPress, chạy logic cũ
    if (onDownload) {
      onDownload();
      return;
    }

    if (linkTo && !hasTestCase) {
      navigation.navigate(linkTo as never);
    }

    if (hasTestCase) {
      setOpen(true);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress} // Sử dụng hàm xử lý mới
      style={[
        styles.container,
        {
          backgroundColor: backGroundColor,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {leftIcon}
        <AppText style={{ marginLeft: s(15) }}>{title}</AppText>
      </View>
      <View>{rightIcon}</View>

      <BottomSheet visible={open} onClose={() => setOpen(false)}>
        <SectionHeader
          title="Test Case"
          textVariant="h2"
          hasButton
          style={{}}
        />
        <TestCaseForm />
      </BottomSheet>
    </TouchableOpacity>
  );
};

export default CourseCardItem;

const styles = StyleSheet.create({
  container: {
    padding: s(15),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: s(15),
    justifyContent: 'space-between',
  },
});