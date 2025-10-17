import React, { useState } from 'react';
import { Control } from 'react-hook-form';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { NavigationIcon } from '../../assets/icons/courses';
import { SubmissionIcon, TestCaseIcon } from '../../assets/icons/icon';
import { AppColors } from '../../styles/color';
import CourseCardItem from '../courses/CourseCardItem';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';
import CriteriaBottomSheet from './CriteriaBottomSheet';

interface QuestionItemProps {
  question: { id: string; fileUri: string | null; };
  index: number;
  isExpanded: boolean;
  control: Control<any>;
  onToggle: () => void;
  onFileUpload: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

const QuestionItem = ({
  question,
  index,
  isExpanded,
  control,
  onToggle,
  onFileUpload,
  onRemove,
  canRemove,
}: QuestionItemProps) => {
  const [isCriteriaSheetVisible, setCriteriaSheetVisible] = useState(false);

  return (
    <>
      <View style={styles.questionContainer}>
        <TouchableOpacity style={styles.questionHeader} onPress={onToggle}>
          <AppText variant="body14pxBold" style={styles.questionTitle}>
            Question {index + 1}
          </AppText>
          <View style={styles.headerActions}>
            {canRemove && (
              <TouchableOpacity
                onPress={onRemove}
                style={{ marginRight: s(10) }}
              >
                <AppText style={styles.removeButtonText}>Remove</AppText>
              </TouchableOpacity>
            )}
            <View style={styles.expandIcon}>
              <AntDesign
                name={isExpanded ? 'caretup' : 'caretdown'}
                size={10}
                color={AppColors.black}
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.questionBody}>
            <AppTextInputController
              control={control}
              name={`questions.${index}.title`}
              label="Title"
              placeholder="Enter question title..."
            />
            <AppTextInputController
              control={control}
              name={`questions.${index}.content`}
              label="Content"
              placeholder="Enter question content..."
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.uploadBox} onPress={onFileUpload}>
              {question.fileUri ? (
                <Image
                  source={{ uri: question.fileUri }}
                  style={styles.previewImage}
                />
              ) : (
                <>
                  <SubmissionIcon />
                  <AppText variant="body14pxBold" style={{ marginTop: vs(8) }}>
                    Click here to Upload
                  </AppText>
                  <AppText
                    variant="body12pxRegular"
                    style={{ color: AppColors.n600, marginTop: vs(4) }}
                  >
                    Upload Image file. Size must be less than 5mb
                  </AppText>
                </>
              )}
            </TouchableOpacity>

            <CourseCardItem
              title={'Criteria'}
              leftIcon={<TestCaseIcon />}
              backGroundColor={AppColors.pr100}
              rightIcon={<NavigationIcon color={AppColors.pr500} />}
              onPress={() => setCriteriaSheetVisible(true)}
              style={styles.criteriaCard}
            />
          </View>
        )}
      </View>
      <CriteriaBottomSheet
        visible={isCriteriaSheetVisible}
        onClose={() => setCriteriaSheetVisible(false)}
        questionNumber={index + 1}
        questionIndex={index}
        control={control}
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
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    questionTitle: {
      color: AppColors.n900,
    },
    questionBody: {
      paddingBottom: vs(16),
    },
    removeButtonText: {
      color: AppColors.errorColor,
      fontSize: s(12),
    },
    expandIcon: {
      marginLeft: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadBox: {
      borderWidth: 1,
      borderColor: AppColors.n200,
      borderRadius: 10,
      padding: vs(20),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: vs(16),
      overflow: 'hidden',
    },
    criteriaCard: {
      marginTop: vs(16),
    },
    previewImage: {
      width: '100%',
      height: vs(150),
      borderRadius: 10,
    },
  });
  
export default QuestionItem;