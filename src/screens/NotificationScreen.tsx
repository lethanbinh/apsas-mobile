import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import { s } from 'react-native-size-matters';

const NotificationScreen = () => {
  return (
    <AppSafeView style={styles.container}>
      <ScreenHeader title="Notifications" />
    </AppSafeView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(25),
  },
});
