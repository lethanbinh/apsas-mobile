import React from 'react';
import { StyleSheet, View } from 'react-native';
import { s } from 'react-native-size-matters';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';

interface StatusTagProps {
  status: string;
}

const StatusTag = ({ status }: StatusTagProps) => {
  let bg = AppColors.b100;
  let color = AppColors.pr500;
  if (status === 'Pending') {
    bg = '#FEF6E6';
    color = '#FF9900';
  } else if (status === 'Approve') {
    bg = AppColors.g100;
    color = AppColors.g500;
  } else if (status === 'Rejected') {
    bg = AppColors.r100;
    color = AppColors.r500;
  } else if (status === 'Ongoing') {
    bg = AppColors.pr100;
    color = AppColors.pr500;
  } else if (status === 'Ended') {
    bg = AppColors.n200;
    color = AppColors.n700;
  } else if (status === 'Upcoming') {
    bg = '#FEF6E6';
    color = '#FF9900';
  }

  return (
    <View style={[styles.statusTag, { backgroundColor: bg }]}>
      <AppText style={[styles.statusText, { color }]}>{status}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  statusTag: {
    paddingHorizontal: s(8),
    paddingVertical: s(2),
    borderRadius: 6,
    marginLeft: s(8),
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatusTag;