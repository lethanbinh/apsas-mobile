import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import {
  AutoGradeIcon,
  ClockIcon,
  DashboardIcon,
  LecturerIcon,
} from '../../assets/icons/courses';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';
import { EditAssessmentIcon } from '../../assets/icons/icon';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface AssignmentCardInfoProps {
  assignmentType?: string;
  assignmentTitle?: string;
  dueDate?: string;
  lecturerName?: string;
  description?: string;
  onSubmitPress: () => void;
  isSubmitted?: boolean;
  isAssessment?: boolean;
  onAutoGradePress?: () => void;
  onDashboardPress?: () => void;
  onDeadlineChange?: (date: string) => void;
}

const AssignmentCardInfo = ({
  assignmentType = 'Basic Assignment',
  assignmentTitle = 'Assignment 1',
  dueDate = '18/10/2025',
  lecturerName = 'NguyenNT',
  description = 'Graphic Design now a popular profession graphic design by off your carrer...',
  onSubmitPress,
  isSubmitted = false,
  isAssessment = false,
  onAutoGradePress,
  onDashboardPress,
  onDeadlineChange,
}: AssignmentCardInfoProps) => {
  const [selectedDate, setSelectedDate] = useState(dueDate);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    setSelectedDate(dueDate);
  }, [dueDate]);

  const handleConfirm = (date: Date) => {
    const formatted = dayjs(date).format('DD/MM/YYYY');
    setSelectedDate(formatted);
    setDatePickerVisible(false);
    if (onDeadlineChange) {
      onDeadlineChange(formatted);
    }
  };

  return (
    <View style={styles.classInfoContainer}>
      <View style={{ padding: s(20), paddingBottom: vs(10) }}>
        {!isAssessment && (
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
              style={{ color: isSubmitted ? AppColors.g500 : AppColors.r500 }}
            >
              {isSubmitted ? 'Submitted' : 'Not Submitted'}
            </AppText>
          </View>
        )}

        {isAssessment && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: s(0),
              top: vs(-20),
            }}
            onPress={() => setDatePickerVisible(true)}
          >
            <EditAssessmentIcon />
          </TouchableOpacity>
        )}

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
              {selectedDate}
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
          {description}{' '}
        </AppText>
      </View>

      {!isAssessment && (
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
      )}

      {isAssessment && (
        <View style={{ flexDirection: 'row', gap: s(10) }}>
          <AppButton
            style={{
              width: s(110),
              alignSelf: 'start',
              marginTop: vs(10),
              left: 20,
              borderRadius: s(10),
            }}
            textVariant="body14pxRegular"
            size="small"
            title="Auto Grade"
            onPress={onAutoGradePress ?? (() => {})}
            leftIcon={<AutoGradeIcon />}
          />
          <AppButton
            style={{
              width: s(110),
              alignSelf: 'start',
              marginTop: vs(10),
              left: 20,
              borderRadius: s(10),
            }}
            textVariant="body14pxRegular"
            size="small"
            title="Dashboard"
            variant="secondary"
            textColor={AppColors.black}
            onPress={onDashboardPress ?? (() => {})}
            leftIcon={<DashboardIcon />}
          />
        </View>
      )}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisible(false)}
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
    height: s(200),
    borderRadius: s(30),
    backgroundColor: AppColors.white,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
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
