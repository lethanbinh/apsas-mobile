import React from 'react';
import { StyleSheet } from 'react-native';
import ScreenHeader from '../components/common/ScreenHeader';
import NotificationContent from '../components/notifications/NotificationContent';
import AppSafeView from '../components/views/AppSafeView';

const NotificationScreen = () => {
  return (
    <AppSafeView style={styles.container}>
      <ScreenHeader title="Notifications" />
      {/* <NotificationEmpty /> */}
      <NotificationContent />
    </AppSafeView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {},
});
