import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { SvgProps } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

interface CourseCategoryItemProps {
  item: {
    color: string;
    image: (props: SvgProps) => React.JSX.Element;
    title: string;
    courseNumber: string;
    id: string;
  };
}

const CourseCategoryItem = ({
  item: { color, image, title, courseNumber, id },
}: CourseCategoryItemProps) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('CourseByCategoryScreen' as never)}
      style={[
        styles.container,
        {
          backgroundColor: color,
        },
      ]}
    >
      {image({ width: s(75), height: s(75) })}
      <AppText variant="h4">{title}</AppText>
      <AppText>{courseNumber}</AppText>
    </TouchableOpacity>
  );
};

export default CourseCategoryItem;

const styles = StyleSheet.create({
  container: {
    width: s(145),
    height: s(150),
    paddingHorizontal: s(16),
    paddingVertical: vs(16),
    gap: vs(3),
    borderRadius: 15,
  },
});
