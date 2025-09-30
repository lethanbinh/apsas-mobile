import React from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { notificationData } from '../../data/notificationData';
import NotificationItem from './NotificationItem';

const NotificationContent = () => {
  const sections = [
    { title: 'Today', data: notificationData },
    { title: 'Yesterday', data: notificationData },
  ];

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      sections={sections}
      keyExtractor={(item, index) =>
        item.id ? String(item.id) : String(index)
      }
      renderSectionHeader={({ section: { title } }) => (
        <AppText
          variant="h4"
          style={{ marginBottom: vs(10), marginTop: vs(20) }}
        >
          {title}
        </AppText>
      )}
      renderItem={({ item }) => <NotificationItem item={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 20 }}></View>}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default NotificationContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: s(25),
  },
});
