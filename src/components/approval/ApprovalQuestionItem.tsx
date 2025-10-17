import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { NavigationIcon } from '../../assets/icons/courses';
import { TestCaseIcon } from '../../assets/icons/icon';
import { AppColors } from '../../styles/color';
import CourseCardItem from '../courses/CourseCardItem';
import AppText from '../texts/AppText';
import { Question } from '../../screens/ApprovalScreen';
import CriteriaBottomSheet from '../assessments/CriteriaBottomSheet';

interface ApprovalQuestionItemProps {
  question: Question;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const ApprovalQuestionItem = ({
  question,
  index,
  isExpanded,
  onToggle,
}: ApprovalQuestionItemProps) => {
  const [isCriteriaVisible, setCriteriaVisible] = useState(false);
  const { control } = useForm({
    defaultValues: {
      questions: [{ criteria: (question as any).criteria || [] }],
    },
  });

  return (
    <>
      <View style={styles.questionContainer}>
        <TouchableOpacity style={styles.questionHeader} onPress={onToggle}>
          <AppText variant="body14pxBold" style={styles.questionTitle}>
            Question {index + 1}: {question.title}
          </AppText>
          <View style={styles.expandIcon}>
            <AntDesign
              name={isExpanded ? 'up' : 'down'}
              size={12}
              color={AppColors.black}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.questionBody}>
            <AppText style={styles.description}>{question.content}</AppText>
            <Image source={{ uri: question.imageUrl }} style={styles.image} />
            <CourseCardItem
              title={'Criteria'}
              leftIcon={<TestCaseIcon />}
              backGroundColor={AppColors.pr100}
              rightIcon={<NavigationIcon color={AppColors.pr500} />}
              onPress={() => setCriteriaVisible(true)}
            />
          </View>
        )}
      </View>

      <CriteriaBottomSheet
        visible={isCriteriaVisible}
        onClose={() => setCriteriaVisible(false)}
        questionNumber={index + 1}
        questionIndex={0}
        control={control}
        isEditable={false}
      />
    </>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
    marginBottom: vs(16),
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(4),
    paddingBottom: vs(16),
  },
  questionTitle: {
    color: AppColors.n900,
    flex: 1,
  },
  questionBody: {
    paddingBottom: vs(16),
  },
  expandIcon: {
    marginLeft: s(10),
  },
  description: {
    color: AppColors.n600,
    marginBottom: vs(12),
    lineHeight: 20,
  },
  image: {
    width: '100%',
    height: vs(150),
    borderRadius: 10,
    marginBottom: vs(16),
  },
});

export default ApprovalQuestionItem;
