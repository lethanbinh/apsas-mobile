import React from 'react';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { ClockIcon, LecturerIcon } from '../../assets/icons/courses';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';
import { useNavigation } from '@react-navigation/native';

const AssignmentCardInfo = () => {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.classInfoContainer}>
      <View
        style={{
          padding: s(20),
          paddingBottom: vs(10),
        }}
      >
        <AppText
          style={{ color: AppColors.tagColor, marginBottom: vs(3) }}
          variant="label12pxBold"
        >
          Basic Assignment
        </AppText>
        <AppText variant="h4" style={{ marginBottom: vs(10) }}>
          Assignment 1
        </AppText>
        <View style={styles.tagContainer}>
          <View style={styles.tagWrapper}>
            <ClockIcon />
            <AppText
              style={{ color: '#202244', marginLeft: vs(5) }}
              variant="label12pxBold"
            >
              18/10/2025
            </AppText>
          </View>
          <View style={styles.tagWrapper}>
            <LecturerIcon />
            <AppText
              style={{ color: '#202244', marginLeft: vs(5) }}
              variant="label12pxBold"
            >
              NguyenNT
            </AppText>
          </View>
        </View>
      </View>
      <View style={styles.descriptionContainer}>
        <AppText>
          Graphic Design now a popular profession graphic design by off your
          carrer about tantas regiones barbarorum pedibus obiit Graphic Design
          now a popular profession graphic design by off your carrer about
          tantas regiones barbarorum pedibus obiit...{' '}
          <AppText variant="body14pxBold" style={{ color: AppColors.pr500 }}>
            Read More
          </AppText>
        </AppText>
      </View>
      <AppButton
        style={{
          width: s(100),
          alignSelf: 'start',
          marginTop: vs(10),
          left: 20,
          borderRadius: s(10),
        }}
        textVariant="body14pxRegular"
        size="small"
        title="Submit"
        onPress={() => {
          navigation.navigate('ScoreDetailScreen');
        }}
      />
    </View>
  );
};

export default AssignmentCardInfo;

const styles = StyleSheet.create({
  classInfoContainer: {
    position: 'absolute',
    top: vs(100),
    width: s(300),
    height: s(300),
    borderRadius: s(30),
    backgroundColor: AppColors.white,
    alignSelf: 'center',

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    // Android shadow
    elevation: 2,
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: s(15),
  },
  descriptionContainer: {
    paddingHorizontal: vs(20),
  },
});
