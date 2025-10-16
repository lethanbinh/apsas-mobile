import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react'; // << Thêm useState
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native'; // << Thêm ScrollView
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import {
  AutoGradeIcon,
  CurriculumIcon,
  DownloadIcon,
  NavigationIcon,
} from '../assets/icons/courses';
import { CheckTickIcon, HistoryIcon } from '../assets/icons/icon';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import CourseCardItem from '../components/courses/CourseCardItem';
import CurriculumItem from '../components/courses/CurriculumItem';
import ParticipantItem from '../components/courses/ParticipantItem';
import ScoreQuestionAccordion from '../components/scoring/ScoreQuestionAccordion'; // << Import component mới
import AppText from '../components/texts/AppText'; // << Import AppText
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { globalStyles } from '../styles/shareStyles';

// Dữ liệu giả cho phần Score
const MOCK_SCORE_DATA = [
  {
    id: 1,
    title: 'Question 1',
    score: 5,
    maxScore: 10,
    criteria: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
  },
  { id: 2, title: 'Question 2', score: 5, maxScore: 10, criteria: [] },
  { id: 3, title: 'Question 3', score: 5, maxScore: 10, criteria: [] },
];

// Cập nhật schema để phù hợp với cấu trúc điểm mới
const schema = yup.object({
  questions: yup.array().of(
    yup.object({
      criteria: yup.array().of(
        yup.object({
          score: yup.string().required('Score is required'),
          comment: yup.string(),
        })
      ),
    })
  ),
});

const AssessmentDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(1);

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    // Cập nhật defaultValues
    defaultValues: {
      questions: MOCK_SCORE_DATA.map(q => ({
        criteria: q.criteria.map(() => ({ score: '', comment: '' })),
      })),
    },
  });

  const handleSaveGrade = (formData: any) => {
    console.log('Submitted Scores:', formData);
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
        title={'Score'}
      />
      {/* << BỌC TẤT CẢ TRONG SCROLLVIEW >> */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* === PHẦN SUBMIT FILE (GIỮ NGUYÊN) === */}
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
        <SectionHeader title="Score" style={{ marginBottom: vs(10) }} />

        {MOCK_SCORE_DATA.map((question, index) => (
          <ScoreQuestionAccordion
            key={question.id}
            question={question}
            index={index}
            isExpanded={expandedQuestionId === question.id}
            onToggle={() =>
              setExpandedQuestionId(prevId =>
                prevId === question.id ? null : question.id
              )
            }
            control={control}
          />
        ))}

        <View style={styles.totalGradeBar}>
          <AppText variant="label16pxBold">Total Grade</AppText>
          <View style={styles.totalScoreBadge}>
            <AppText variant="body14pxBold" style={{ color: AppColors.r500 }}>
              5/10
            </AppText>
          </View>
        </View>

        {/* === PHẦN FEEDBACK VÀ NÚT BẤM (GIỮ NGUYÊN) === */}
        <CourseCardItem
          title={'Feedback'}
          leftIcon={<CurriculumIcon />}
          backGroundColor={AppColors.b100}
          rightIcon={<NavigationIcon color={AppColors.b500} />}
          linkTo={'FeedbackTeacherScreen'}
          style={{ marginTop: vs(25) }}
        />

        <View
          style={[
            globalStyles.flexRowStyle,
            { marginTop: vs(25), justifyContent: 'center', gap: 10 },
          ]}
        >
          <AppButton
            title="Save Grade"
            onPress={handleSubmit(handleSaveGrade)}
            style={{
              width: s(100),
            }}
            textVariant="body14pxRegular"
            leftIcon={<CheckTickIcon />}
          />
          <AppButton
            title="Auto Grade"
            onPress={() => {}}
            style={{
              width: s(100),
            }}
            textVariant="body14pxRegular"
            variant="secondary"
            textColor={AppColors.black}
            leftIcon={<AutoGradeIcon color={AppColors.black} />}
          />
        </View>
      </ScrollView>
    </AppSafeView>
  );
};

export default AssessmentDetailScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: s(20),
    paddingHorizontal: s(25),
  },
  totalGradeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.n100,
    borderRadius: 12,
    padding: s(15),
    marginTop: vs(10),
  },
  totalScoreBadge: {
    backgroundColor: AppColors.r100,
    paddingHorizontal: s(12),
    paddingVertical: vs(5),
    borderRadius: 6,
  },
});