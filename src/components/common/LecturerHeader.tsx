import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppText from '../texts/AppText';
import { UserAvatarDemoIcon } from '../../assets/icons/icon';
import { s } from 'react-native-size-matters';

const LecturerHeader = () => {
  return (
    <View style={styles.container}>
      <View>
        <AppText variant='h3'>Hi, Binh</AppText>
        <AppText variant='body12pxRegular'>Teacher</AppText>
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
    padding: s(25),
  },
});
