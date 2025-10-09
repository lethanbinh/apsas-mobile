import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import {
  CurriculumIcon,
  DownloadIcon,
  NavigationIcon,
} from '../assets/icons/courses';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import CourseCardItem from '../components/courses/CourseCardItem';
import CurriculumItem from '../components/courses/CurriculumItem';
import AppTextInputController from '../components/inputs/AppTextInputController';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import AppTextInput from '../components/inputs/AppTextInput';
import { HistoryIcon } from '../assets/icons/icon';

// ✅ Schema Criteria Mode
const schema = yup.object({
  criteria1: yup.string().required('Criteria 1 is required'),
  reason1: yup.string().required('Reason 1 is required'),
  criteria2: yup.string().required('Criteria 2 is required'),
  reason2: yup.string().required('Reason 2 is required'),
  feedback: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

const ScoreDetailTeacherHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      criteria1: '',
      reason1: '',
      criteria2: '',
      reason2: '',
      feedback: '',
    },
  });

  const handleSaveGrade = (formData: FormData) => {
    console.log('Submitted:', formData);
  };

  return (
    <AppSafeView>
      <ScreenHeader
        title="Assessment by Criteria"
        rightIcon={
          <HistoryIcon fill={AppColors.pr500} stroke={AppColors.pr500} />
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingVertical: s(20),
          paddingHorizontal: s(25),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* File Submit */}
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

        {/* Result */}
        <SectionHeader
          title="Criteria Evaluation"
          style={{ marginBottom: vs(20) }}
        />

        {/* Criteria 1 */}
        <AppTextInputController
          control={control}
          name="criteria1"
          label="Criteria 1"
          placeholder="Enter details for Criteria 1..."
        />

        <AppTextInputController
          name="reason1"
          control={control}
          label="Reason 1"
          placeholder="Enter reason..."
          multiline
          numberOfLines={4}
        />

        {/* Criteria 2 */}
        <AppTextInputController
          control={control}
          name="criteria2"
          label="Criteria 2"
          placeholder="Enter details for Criteria 2..."
        />

        <AppTextInputController
          name="reason2"
          control={control}
          label="Reason 2"
          placeholder="Enter reason..."
          multiline
          numberOfLines={4}
        />

        {/* Total Grade */}
        <AppTextInput
          label="Total Grade"
          placeholder="e.g. 5/10"
          style={{ marginBottom: vs(15) }}
        />

        {/* Feedback link */}
        <CourseCardItem
          title={'Feedback'}
          leftIcon={<CurriculumIcon />}
          backGroundColor={AppColors.pr100}
          rightIcon={<NavigationIcon color={AppColors.b500} />}
          linkTo={'FeedbackTeacherScreen'}
        />
      </ScrollView>
    </AppSafeView>
  );
};

export default ScoreDetailTeacherHistoryScreen;

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
