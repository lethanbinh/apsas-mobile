import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons/icon';
import AppText from '../texts/AppText';

interface ScreenHeaderProps {
  title: string;
}
const ScreenHeader = ({ title }: ScreenHeaderProps) => {
  return (
    <View style={styles.container}>
      <ArrowLeftIcon />
      <AppText variant="h4">{title}</AppText>
      <ArrowRightIcon />
    </View>
  );
};

export default ScreenHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
