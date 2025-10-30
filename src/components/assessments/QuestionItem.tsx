import React, { useEffect, useState } from 'react';
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
  index: number;
  isExpanded: boolean;
  control: Control<any>;
  onToggle: () => void;
  onFileUpload: () => void;
  onRemove: () => void;
  canRemove: boolean;
  initialFileUri: string | null | undefined;
  isEditable?: boolean; // <-- Thêm prop
}

const QuestionItem = ({
  index,
  isExpanded,
  control,
  onToggle,
  onFileUpload,
  onRemove,
  canRemove,
  initialFileUri,
  isEditable = true,
}: QuestionItemProps) => {
  const [isCriteriaSheetVisible, setCriteriaSheetVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState(initialFileUri);

  useEffect(() => {
    setCurrentFileUri(initialFileUri);
  }, [initialFileUri]);

  return (
    <>
      <View style={styles.questionContainer}>
        <TouchableOpacity style={styles.questionHeader} onPress={onToggle}>
          <AppText variant="body14pxBold" style={styles.questionTitle}>
            Question {index + 1}
          </AppText>
          <View style={styles.headerActions}>
            {/* Chỉ hiển thị nút Remove khi 'canRemove' và 'isEditable' */}
            {canRemove && isEditable && (
              <TouchableOpacity
                onPress={onRemove}
                style={{ marginRight: s(10) }}>
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
              rules={{ required: 'Title is required' }}
              editable={isEditable} // <-- Truyền prop
            />
            <AppTextInputController
              control={control}
              name={`questions.${index}.sampleInput`}
              label="Sample Input"
              placeholder="Enter sample input..."
              multiline
              editable={isEditable} // <-- Truyền prop
            />
            <AppTextInputController
              control={control}
              name={`questions.${index}.sampleOutput`}
              label="Sample Output"
              placeholder="Enter sample output..."
              multiline
              editable={isEditable} // <-- Truyền prop
            />
            <AppTextInputController
              control={control}
              name={`questions.${index}.score`}
              label="Score"
              placeholder="Enter score (e.g., 10)"
              keyboardType="numeric"
              rules={{
                required: 'Score is required',
                pattern: { value: /^\d+(\.\d+)?$/, message: 'Score must be a number' }, // <-- Sửa pattern
              }}
              editable={isEditable} // <-- Truyền prop
            />
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={onFileUpload}
              disabled={!isEditable} // <-- Thêm disabled
            >
              {currentFileUri ? (
                <Image
                  source={{ uri: currentFileUri }}
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
                    style={{ color: AppColors.n600, marginTop: vs(4) }}>
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
        control={control}
        questionIndex={index}
        isEditable={isEditable} // <-- Truyền prop
      />
    </>
  );
};

// ... (styles) ...
const styles = StyleSheet.create({
  questionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
    marginBottom: vs(16),
    backgroundColor: AppColors.white, // Thêm nền trắng
    borderRadius: 8, // Bo góc
    padding: s(12), // Thêm padding
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingVertical: vs(4), // Bỏ padding dọc
    // paddingBottom: vs(16), // Bỏ padding dưới
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionTitle: {
    color: AppColors.n900,
    flex: 1, // Để title chiếm hết phần còn lại
    marginRight: s(8), // Khoảng cách với nút remove/expand
  },
  questionBody: {
    paddingTop: vs(12), // Thêm padding top
    // paddingBottom: vs(16), // Giữ padding dưới
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
    backgroundColor: AppColors.n100,
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