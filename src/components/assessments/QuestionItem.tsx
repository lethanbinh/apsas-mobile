import React, { useEffect, useState } from 'react'; // <-- Import useEffect
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
  // question: { id: string; fileUri: string | null }; // <-- Bỏ prop này
  index: number;
  isExpanded: boolean;
  control: Control<any>; // Nên dùng kiểu cụ thể hơn nếu có AssessmentFormData
  onToggle: () => void;
  onFileUpload: () => void;
  onRemove: () => void;
  canRemove: boolean;
  initialFileUri: string | null | undefined; // <-- Thêm prop này
}

const QuestionItem = ({
  index,
  isExpanded,
  control,
  onToggle,
  onFileUpload,
  onRemove,
  canRemove,
  initialFileUri, // <-- Nhận prop
}: QuestionItemProps) => {
  const [isCriteriaSheetVisible, setCriteriaSheetVisible] = useState(false);
  // State để lưu file URI (vì useWatch có thể chậm)
  const [currentFileUri, setCurrentFileUri] = useState(initialFileUri);

  // Cập nhật state nội bộ khi prop initialFileUri thay đổi
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
            {canRemove && (
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
              rules={{ required: 'Title is required' }} // Thêm rule
            />
            {/* Tạm ẩn content vì đã có sample input/output */}
            {/* <AppTextInputController
              control={control}
              name={`questions.${index}.content`}
              label="Content"
              placeholder="Enter question content..."
              multiline
              numberOfLines={4}
            /> */}
            <AppTextInputController
              control={control}
              name={`questions.${index}.sampleInput`} // <-- Input mới
              label="Sample Input"
              placeholder="Enter sample input..."
              multiline
            />
            <AppTextInputController
              control={control}
              name={`questions.${index}.sampleOutput`} // <-- Input mới
              label="Sample Output"
              placeholder="Enter sample output..."
              multiline
            />
            <AppTextInputController
              control={control}
              name={`questions.${index}.score`} // <-- Input mới
              label="Score"
              placeholder="Enter score (e.g., 10)"
              keyboardType="numeric"
              rules={{
                required: 'Score is required',
                pattern: { value: /^\d+$/, message: 'Score must be a number' },
              }} // Thêm rule
            />
            <TouchableOpacity style={styles.uploadBox} onPress={onFileUpload}>
              {currentFileUri ? ( // <-- Dùng state nội bộ
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
        // rubrics={[]} // Bỏ prop rubrics
        // Thêm control và questionIndex
        control={control}
        questionIndex={index}
        isEditable={true} // Lecturer có thể sửa criteria
      />
    </>
  );
};

// Styles giữ nguyên
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