import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import AppText from '../texts/AppText';
import { s } from 'react-native-size-matters';

interface SectionHeaderProps {
  title: string;
  buttonText: string;
  onPress?: () => void;
}
const SectionHeader = ({ title, buttonText, onPress }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <AppText variant="h4">{title}</AppText>
      <TouchableOpacity onPress={onPress}>
        <AppText variant="label14pxRegular">{buttonText}</AppText>
      </TouchableOpacity>
    </View>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(25),
  },
});
