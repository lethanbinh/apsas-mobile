import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NotificationEmptyIcon } from '../../assets/icons/notification-icon';
import AppText from '../texts/AppText';
import { s, vs } from 'react-native-size-matters';

const NotificationEmpty = () => {
  return (
    <View style={styles.container}>
      <NotificationEmptyIcon />
      <View style={{ paddingHorizontal: s(25) }}>
        <AppText
          style={{ textAlign: 'center', marginBottom: vs(5) }}
          variant="h3"
        >
          Oops! No notifications yet
        </AppText>
        <AppText style={{ textAlign: 'center' }}>
          It seems that you're you got a blank state. We’ll let you know when
          updates arrive!
        </AppText>
      </View>
    </View>
  );
};

export default NotificationEmpty;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
