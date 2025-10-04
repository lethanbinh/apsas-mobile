import React from 'react';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { ClockIcon, LecturerIcon } from '../../assets/icons/courses';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';

interface AssignmentCardInfoProps {
  assignmentType?: string;
  assignmentTitle?: string;
  dueDate?: string;
  lecturerName?: string;
  description?: string;
  onSubmitPress: () => void;
  isSubmitted?: boolean;
}

const AssignmentCardInfo = ({
  assignmentType = 'Basic Assignment',
  assignmentTitle = 'Assignment 1',
  dueDate = '18/10/2025',
  lecturerName = 'NguyenNT',
  description = 'Graphic Design now a popular profession graphic design by off your carrer about tantas regiones barbarorum pedibus obiit Graphic Design now a popular profession graphic design by off your carrer about tantas regiones barbarorum pedibus obiit...',
  onSubmitPress,
  isSubmitted = false,
}: AssignmentCardInfoProps) => {
  return (
    <View style={styles.classInfoContainer}>
      <View
        style={{
          padding: s(20),
          paddingBottom: vs(10),
        }}
      >
        <View
          style={{
            position: 'absolute',
            right: s(20),
            top: vs(15),
            backgroundColor: isSubmitted ? AppColors.g100 : AppColors.r100,
            paddingHorizontal: s(10),
            paddingVertical: vs(5),
            borderRadius: s(10),
          }}
        >
          <AppText
            variant="label12pxRegular"
            style={{
              color: isSubmitted ? AppColors.g500 : AppColors.r500,
            }}
          >
            {isSubmitted ? 'Submitted' : 'Not Submitted'}
          </AppText>
        </View>
        <AppText
          style={{ color: AppColors.tagColor, marginBottom: vs(3) }}
          variant="label12pxBold"
        >
          {assignmentType}
        </AppText>
        <AppText variant="h4" style={{ marginBottom: vs(10) }}>
          {assignmentTitle}
        </AppText>
        <View style={styles.tagContainer}>
          <View style={styles.tagWrapper}>
            <ClockIcon />
            <AppText
              style={{ color: '#202244', marginLeft: vs(5) }}
              variant="label12pxBold"
            >
              {dueDate}
            </AppText>
          </View>
          <View style={styles.tagWrapper}>
            <LecturerIcon />
            <AppText
              style={{ color: '#202244', marginLeft: vs(5) }}
              variant="label12pxBold"
            >
              {lecturerName}
            </AppText>
          </View>
        </View>
      </View>
      <View style={styles.descriptionContainer}>
        <AppText>
          {description}...{' '}
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
        onPress={onSubmitPress}
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
