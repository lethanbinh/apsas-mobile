import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { useNavigation } from '@react-navigation/native';

interface CourseCardItemProps {
  title: string;
  leftIcon: ReactNode;
  backGroundColor: string;
  rightIcon: ReactNode;
  linkTo: string;
}

const CourseCardItem = ({
  title = 'Curriculum',
  leftIcon,
  backGroundColor = '',
  rightIcon,
  linkTo,
}: CourseCardItemProps) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate(linkTo as never)}
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
