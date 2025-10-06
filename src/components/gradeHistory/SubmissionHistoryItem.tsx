import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import AppText from '../texts/AppText';
import { ClockTimeIcon, SmallDownloadIcon } from '../../assets/icons/courses';
import { AppColors } from '../../styles/color';
import { s, vs } from 'react-native-size-matters';
import { DetailHistoryIcon } from '../../assets/icons/icon';

interface SubmissionHistoryItemProps {
  backgroundColor?: string;
  submissionTime: string;
  courseCode: string;
  courseName: string;
  assignmentTitle: string;
  teacherName: string;
  fileName: string;
  status: 'On time' | 'Late' | 'Missing';
  timeSubmit?: string;
  onNavigate?: () => void;
}

const SubmissionHistoryItem = ({
  backgroundColor,
  submissionTime,
  courseCode,
  courseName,
  assignmentTitle,
  teacherName,
  fileName,
  status,
  timeSubmit,
  onNavigate = () => {},
}: SubmissionHistoryItemProps) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || AppColors.pr100,
        },
      ]}
    >
      <View>
        <AppText
          style={{
            color: AppColors.secondaryBlack,
          }}
          variant="body14pxBold"
        >
          {timeSubmit}
        </AppText>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <AppText
            variant="label12pxBold"
            style={{
              color: AppColors.pr500,
            }}
          >
            {courseCode} – {courseName}
          </AppText>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SmallDownloadIcon />
            <AppText
              style={{
                fontSize: 8,
                justifyContent: 'center',
              }}
            >
              {fileName}
            </AppText>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <AppText
            style={{ color: AppColors.black, marginTop: vs(5) }}
            variant="body16pxBold"
          >
            {assignmentTitle}
          </AppText>
          <AppText style={{ color: AppColors.black }}>
            By:{' '}
            <AppText style={{ color: AppColors.pr500 }}>{teacherName}</AppText>
          </AppText>
        </View>
        <TouchableOpacity onPress={onNavigate}>
          <DetailHistoryIcon />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: s(5),
          marginTop: vs(10),
        }}
      >
        <ClockTimeIcon />
        <AppText>{submissionTime}</AppText>
        <AppText
          style={{
            color:
              status === 'On time'
                ? AppColors.g500
                : status === 'Late'
                ? AppColors.r500
                : AppColors.r500,
          }}
        >
          {status}
        </AppText>
      </View>
    </View>
  );
};

export default SubmissionHistoryItem;

const styles = StyleSheet.create({
  container: {
    borderRadius: s(25),
    padding: s(20),
  },
});
