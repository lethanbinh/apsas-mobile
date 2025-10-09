import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import {
  CurriculumIcon,
  DownloadIcon,
  NavigationIcon
} from '../assets/icons/courses';
import { HistoryIcon } from '../assets/icons/icon';
import AppDropdownController from '../components/common/AppDropdownController';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import CourseCardItem from '../components/courses/CourseCardItem';
import CurriculumItem from '../components/courses/CurriculumItem';
import AppTextInputController from '../components/inputs/AppTextInputController';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

const isCriteriaMode = true;

const schema = yup.object({
  testcase1: isCriteriaMode
    ? yup.string().required('Criteria 1 is required')
    : yup.string().required('Result is required'),
  testcase2: isCriteriaMode
    ? yup.string().required('Criteria 2 is required')
    : yup.string().required('Result is required'),
  totalGrade: yup
    .string()
    .required('Grade is required')
    .matches(/^\d+\/\d+$/, 'Format must be like 5/10'),
  feedback: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

const HistoryDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      testcase1: '',
      testcase2: '',
      totalGrade: '',
      feedback: '',
    },
  });

  const handleSaveGrade = (formData: FormData) => {
    console.log('Submitted:', formData);
  };

  return (
    <AppSafeView>
      <ScreenHeader
        onRightIconPress={() =>
          navigation.navigate('GradingHistoryScreen' as never)
        }
        rightIcon={
          <HistoryIcon fill={AppColors.pr500} stroke={AppColors.pr500} />
        }
        title={isCriteriaMode ? 'Assessment by Criteria' : 'Assessment Detail'}
      />
      <View style={{ paddingVertical: s(20), paddingHorizontal: s(25) }}>
        <SectionHeader
          title="File Submit - LeThanhBinh - SE1720"
          style={{ marginBottom: vs(20) }}
        />
        <CurriculumItem
          id={1}
          number={'01'}
          title={'File Submit'}
          linkFile={'lethanhbinh.zip'}
          rightIcon={<DownloadIcon />}
          detailNavigation={''}
          onAction={() => {}}
        />

        <SectionHeader
          title="Result"
          style={{ marginBottom: vs(20) }}
          buttonText={isCriteriaMode ? 'View Detail' : undefined}
          onPress={() => {
            isCriteriaMode &&
              navigation.navigate('ScoreDetailTeacherHistoryScreen' as never);
          }}
        />

        {/* 🔁 Chuyển điều kiện render */}
        {isCriteriaMode ? (
          <>
            <AppTextInputController
              control={control}
              name="testcase1"
              label="Criteria 1"
              placeholder="Enter criteria 1 details..."
            />
            <AppTextInputController
              control={control}
              name="testcase2"
              label="Criteria 2"
              placeholder="Enter criteria 2 details..."
              style={{ marginBottom: vs(15) }}
            />
          </>
        ) : (
          <>
            <AppDropdownController
              control={control}
              name="testcase1"
              label="Testcase 1"
              options={[
                { label: 'Select result...', value: '' },
                { label: 'Pass', value: 'Pass' },
                { label: 'Failed', value: 'Failed' },
              ]}
            />
            <AppDropdownController
              control={control}
              name="testcase2"
              label="Testcase 2"
              options={[
                { label: 'Select result...', value: '' },
                { label: 'Pass', value: 'Pass' },
                { label: 'Failed', value: 'Failed' },
              ]}
            />
          </>
        )}

        {/* Total Grade */}
        <AppTextInputController
          name="totalGrade"
          control={control}
          label="Total Grade"
          placeholder="e.g. 5/10"
          style={{ marginBottom: vs(15) }}
        />

        <CourseCardItem
          title={'Feedback'}
          leftIcon={<CurriculumIcon />}
          backGroundColor={AppColors.b100}
          rightIcon={<NavigationIcon color={AppColors.b500} />}
          linkTo={'FeedbackScreen'}
        />
      </View>
    </AppSafeView>
  );
};

export default HistoryDetailScreen;

const styles = StyleSheet.create({});
