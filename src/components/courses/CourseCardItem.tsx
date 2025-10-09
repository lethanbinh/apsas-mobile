import React, { ReactNode, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  linkTo: string;
  hasTestCase?: boolean;
  onDownload?: () => void;
}

const CourseCardItem = ({
  title = 'Curriculum',
  leftIcon,
  backGroundColor = '',
  rightIcon,
  linkTo,
  hasTestCase = false,
  onDownload,
}: CourseCardItemProps) => {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => {
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
      }}
      style={[
        styles.container,
        {
          backgroundColor: backGroundColor,
        },
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
