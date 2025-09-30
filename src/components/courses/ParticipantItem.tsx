import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';

interface ParticipantItemProps {
  avatar?: ReactNode;
  title: string;
  className: string;
  joinDate: string;
  role: string;
}
const ParticipantItem = ({
  avatar,
  title,
  className,
  joinDate,
  role,
}: ParticipantItemProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View
          style={[
            styles.avatar,
            avatar
              ? {
                  backgroundColor: AppColors.white,
                }
              : {},
          ]}
        >
          {avatar}
        </View>
        <View style={styles.content}>
          <AppText
            style={{ color: '#000', marginBottom: vs(3) }}
            variant="body16pxBold"
          >
            {title}
          </AppText>
          <AppText style={{ marginBottom: vs(3) }} variant="label14pxBold">
            {className}
          </AppText>
          <AppText style={{ color: '#000' }} variant="body12pxBold">
            {joinDate}
          </AppText>
        </View>
      </View>
      <View style={styles.roleContainer}>
        <AppText>{role}</AppText>
      </View>
    </View>
  );
};

export default ParticipantItem;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(25),
    paddingVertical: vs(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentContainer: {
    flexDirection: 'row',
  },
  avatar: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: AppColors.black,
    marginRight: s(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {},
  roleContainer: {},
});
