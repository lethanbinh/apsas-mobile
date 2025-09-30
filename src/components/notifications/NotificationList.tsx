import React from 'react';
import { FlatList, View } from 'react-native';
import {
  NotificationItemProps
} from '../../data/notificationData';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  items: NotificationItemProps[];
}

const NotificationList = ({ items }: NotificationListProps) => {
  return (
    <FlatList
      data={items}
      keyExtractor={(item, index) =>
        item.id ? String(item.id) : String(index)
      }
      renderItem={({ item }) => {
        return <NotificationItem item={item} />;
      }}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
    />
  );
};

export default NotificationList;
