import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { NavigationIcon } from '../../assets/icons/courses';
import { TestCaseIcon } from '../../assets/icons/icon';
import {
  RubricItemData,
  getRubricItemsByQuestionId,
} from '../../api/rubricItemService';
import { Question } from '../../screens/ApprovalScreen';
import { AppColors } from '../../styles/color';
import CriteriaBottomSheet from '../assessments/CriteriaBottomSheet';
import CourseCardItem from '../courses/CourseCardItem';
import AppText from '../texts/AppText';

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
  const [fetchedRubrics, setFetchedRubrics] = useState<RubricItemData[] | null>(
    null,
  );
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  console.log(question);
  const handleOpenCriteria = async () => {
    if (fetchedRubrics) {
      setCriteriaVisible(true);
      return;
    }

    setIsLoadingCriteria(true);
    try {
      const rubrics = await getRubricItemsByQuestionId(question.id);
      setFetchedRubrics(rubrics); // Lưu rubrics
      setCriteriaVisible(true); // Mở bottom sheet
    } catch (error) {
      console.error('Failed to fetch rubrics:', error);
      Alert.alert('Error', 'Could not load criteria.');
    } finally {
      setIsLoadingCriteria(false); // Dừng loading
    }
  };

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
            {!!question.imageUrl && (
              <Image source={{ uri: question.imageUrl }} style={styles.image} />
            )}
            <CourseCardItem
              title={'Criteria'}
              leftIcon={<TestCaseIcon />}
              backGroundColor={AppColors.pr100}
              rightIcon={
                isLoadingCriteria ? (
                  <ActivityIndicator size="small" color={AppColors.pr500} />
                ) : (
                  <NavigationIcon color={AppColors.pr500} />
                )
              }
              onPress={handleOpenCriteria} // <-- SỬA ONPRESS
            />
          </View>
        )}
      </View>

      <CriteriaBottomSheet
        visible={isCriteriaVisible}
        onClose={() => setCriteriaVisible(false)}
        questionNumber={index + 1}
        rubrics={fetchedRubrics || []} // <-- TRUYỀN DỮ LIỆU ĐÃ FETCH
        isEditable={false} // Vì đây là màn hình Approval
      />
    </>
  );
};

// ... styles không đổi
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
