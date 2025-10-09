import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import ParticipantItem from '../courses/ParticipantItem';

const GradeBySection = () => {
  return (
    <View style={styles.container}>
      <AppText style={{ color: AppColors.pr500 }} variant="h4">
        Grade By
      </AppText>
      <ParticipantItem
        title={'NguyenNT'}
        joinDate={'Grade at 12:00 26/09/2025'}
        role={'Lecturer'}
        containerStyle={{
          paddingHorizontal: 0,
        }}
      />
    </View>
  );
};

export default GradeBySection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(20),
  },
});
