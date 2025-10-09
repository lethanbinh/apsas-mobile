import { useNavigation } from '@react-navigation/native';
import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons/icon';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { s, vs } from 'react-native-size-matters';

interface ScreenHeaderProps {
  title: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
}
const ScreenHeader = ({
  title,
  leftIcon,
  rightIcon,
  onRightIconPress,
}: ScreenHeaderProps) => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          {leftIcon ? leftIcon : <ArrowLeftIcon />}
        </TouchableOpacity>
        <AppText variant="h4">{title}</AppText>
        <TouchableOpacity onPress={onRightIconPress}>
          {rightIcon}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ScreenHeader;

const styles = StyleSheet.create({
  container: {
    paddingBottom: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n300,
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: s(25),
    alignItems: "center"
  },
});
