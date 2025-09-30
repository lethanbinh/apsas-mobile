import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { RingIcon } from '../../assets/icons/notification-icon';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';

interface NotificationItemProps {
  item: {
    id?: string | undefined;
    title: string;
    description: string;
    date: string;
    numNotification?: number;
    backgroundColor: string;
    iconColor: string;
  };
}

const NotificationItem = ({
  item: {
    id,
    title,
    description,
    date,
    numNotification,
    backgroundColor,
    iconColor,
  },
}: NotificationItemProps) => {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: backgroundColor,
          },
        ]}
      >
        <RingIcon color={iconColor} />
      </View>
      <View>
        <View style={styles.titleWrapper}>
          <AppText style={{ color: AppColors.black }} variant="body14pxBold">
            {title}
          </AppText>
          <AppText style={{ color: '#515978' }} variant="body12pxBold">
            {date}
          </AppText>
        </View>
        <AppText
          style={{ width: '60%', marginStart: s(10), color: '#515978' }}
          variant="body12pxRegular"
        >
          {description}
        </AppText>
        {numNotification && (
          <View style={styles.numNotifications}>
            <Text style={styles.numText}>{numNotification}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: '#EBEBEB',
    paddingVertical: vs(12),
    paddingHorizontal: s(15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: s(48),
    height: s(48),
    borderRadius: s(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '85%',
    marginStart: s(10),
  },
  numNotifications: {
    width: 20,
    height: 20,
    backgroundColor: AppColors.pr500,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: s(20),
    bottom: s(-5),
  },
  numText: {
    color: AppColors.white,
    fontSize: s(10),
  },
});
