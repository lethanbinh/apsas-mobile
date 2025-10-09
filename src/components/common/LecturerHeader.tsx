import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppText from '../texts/AppText';
import { UserAvatarDemoIcon } from '../../assets/icons/icon';
import { s, vs } from 'react-native-size-matters';

interface LecturerHeaderProps {
  title: string;
  role: string;
}

const LecturerHeader = ({ title, role }: LecturerHeaderProps) => {
  return (
    <View style={styles.container}>
      <View>
        <AppText variant="h3">{title}</AppText>
        <AppText variant="body12pxRegular">{role}</AppText>
      </View>
      <View>
        <UserAvatarDemoIcon />
      </View>
    </View>
  );
};

export default LecturerHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(25),
    marginBottom: vs(20)
  },
});
