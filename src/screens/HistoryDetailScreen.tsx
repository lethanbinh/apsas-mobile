import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import {
  CurriculumIcon,
  DownloadIcon,
  NavigationIcon,
} from '../assets/icons/courses';
import { HistoryIcon } from '../assets/icons/icon';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import CourseCardItem from '../components/courses/CourseCardItem';
import CurriculumItem from '../components/courses/CurriculumItem';
import ScoreQuestionAccordion from '../components/scoring/ScoreQuestionAccordion';
import AppText from '../components/texts/AppText';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { useForm } from 'react-hook-form'; // Giữ lại để truyền control
import ParticipantItem from '../components/courses/ParticipantItem';

const MOCK_DATA = [
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

const HistoryDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(
    1,
  );

  // Vẫn cần control để truyền xuống, nhưng không cần validate
  const { control } = useForm({
    defaultValues: {
      questions: MOCK_DATA.map(q => ({
        criteria: q.criteria.map(() => ({ score: '2', comment: 'Good job!' })),
      })),
    },
  });

  return (
    <AppSafeView>
      <ScreenHeader
        onRightIconPress={() =>
          navigation.navigate('GradingHistoryScreen' as never)
        }
        rightIcon={
          <HistoryIcon fill={AppColors.pr500} stroke={AppColors.pr500} />
        }
        title={'Assessment by Criteria'}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        <SectionHeader title="Grade By" />
        <ParticipantItem
          title="NguyenNT"
          joinDate="Grade at 12:00 26/09/2025"
          role="Lecturer"
          containerStyle={{ paddingHorizontal: 0 }}
        />

        <SectionHeader
          title="Score"
          style={{ marginBottom: vs(10) }}
          buttonText={'View Detail'}
          onPress={() => {
            navigation.navigate('ScoreDetailTeacherHistoryScreen' as never);
          }}
        />

        {MOCK_DATA.map((question, index) => (
          <ScoreQuestionAccordion
            key={question.id}
            question={question}
            index={index}
            isExpanded={expandedQuestionId === question.id}
            onToggle={() =>
              setExpandedQuestionId(prevId =>
                prevId === question.id ? null : question.id,
              )
            }
            control={control}
            editable={false} // << VÔ HIỆU HÓA INPUT
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

        <CourseCardItem
          title={'Feedback'}
          leftIcon={<CurriculumIcon />}
          backGroundColor={AppColors.b100}
          rightIcon={<NavigationIcon color={AppColors.b500} />}
          linkTo={'FeedbackScreen'}
          style={{ marginTop: vs(25) }}
        />
      </ScrollView>
    </AppSafeView>
  );
};

export default HistoryDetailScreen;

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
