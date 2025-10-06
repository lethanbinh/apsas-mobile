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
  NavigationIcon,
} from '../assets/icons/courses';
import AppButton from '../components/buttons/AppButton';
import AppDropdownController from '../components/common/AppDropdownController';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import CourseCardItem from '../components/courses/CourseCardItem';
import CurriculumItem from '../components/courses/CurriculumItem';
import AppTextInputController from '../components/inputs/AppTextInputController';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

// Schema
const schema = yup.object({
  testcase1: yup.string().required('Result is required'),
  testcase2: yup.string().required('Result is required'),
  totalGrade: yup
    .string()
    .required('Grade is required')
    .matches(/^\d+\/\d+$/, 'Format must be like 5/10'),
  feedback: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

const AssessmentDetailScreen: React.FC = () => {
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
      <ScreenHeader title="Assessment Detail" />
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
          buttonText="View Detail"
          onPress={() => {
            navigation.navigate('ScoreDetailTeacherScreen' as never);
          }}
        />

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
          backGroundColor={AppColors.pr100}
          rightIcon={<NavigationIcon color={AppColors.pr500} />}
          linkTo={'FeedbackTeacherScreen'}
        />

        {/* Save button */}
        <AppButton
          title="Save Grade"
          onPress={handleSubmit(handleSaveGrade)}
          style={{ marginTop: vs(25), width: '100%' }}
        />
      </View>
    </AppSafeView>
  );
};

export default AssessmentDetailScreen;

const styles = StyleSheet.create({
  picker: {
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: 8,
    backgroundColor: AppColors.white,
  },
  errorText: {
    color: AppColors.r500,
    fontSize: 12,
    marginTop: 4,
  },
});
