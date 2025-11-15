import React, { useEffect, useMemo } from 'react';
import { Modal, Portal } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { s, vs } from 'react-native-size-matters';
import { StyleSheet, View, ScrollView } from 'react-native';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import { AssessmentQuestion } from '../../api/assessmentQuestionServiceWrapper';
import { assessmentQuestionService } from '../../api/assessmentQuestionServiceWrapper';

type FormData = {
  questionNumber: number;
  questionText: string;
  questionSampleInput: string;
  questionSampleOutput: string;
  score: number;
};

const schema = yup
  .object({
    questionNumber: yup.number().required('Question number is required'),
    questionText: yup.string().required('Question text is required'),
    questionSampleInput: yup.string(),
    questionSampleOutput: yup.string(),
    score: yup.number().required('Score is required'),
  })
  .required();

interface QuestionFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AssessmentQuestion | null;
  isEditable: boolean;
  paperId?: number;
  existingQuestionsCount?: number;
}

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  isEditable,
  paperId,
  existingQuestionsCount = 0,
}) => {
  const isEditMode = !!initialData;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: useMemo(
      () => ({
        questionNumber: initialData?.questionNumber ?? existingQuestionsCount + 1,
        questionText: initialData?.questionText ?? '',
        questionSampleInput: initialData?.questionSampleInput ?? '',
        questionSampleOutput: initialData?.questionSampleOutput ?? '',
        score: initialData?.score ?? 0,
      }),
      [initialData, existingQuestionsCount],
    ),
  });

  useEffect(() => {
    if (visible) {
      reset({
        questionNumber: initialData?.questionNumber ?? existingQuestionsCount + 1,
        questionText: initialData?.questionText ?? '',
        questionSampleInput: initialData?.questionSampleInput ?? '',
        questionSampleOutput: initialData?.questionSampleOutput ?? '',
        score: initialData?.score ?? 0,
      });
    }
  }, [visible, initialData, reset, existingQuestionsCount]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && initialData) {
        await assessmentQuestionService.updateAssessmentQuestion(
          initialData.id,
          data,
        );
        showSuccessToast('Success', 'Question updated successfully');
      } else {
        if (!paperId) {
          showErrorToast('Error', 'Paper ID is required');
          return;
        }
        await assessmentQuestionService.createAssessmentQuestion({
          ...data,
          assessmentPaperId: paperId,
        });
        showSuccessToast('Success', 'Question created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save question:', error);
      showErrorToast('Error', error.message || 'Failed to save question');
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView style={styles.scrollView}>
          <AppText variant="h4" style={styles.title}>
            {isEditMode ? 'Edit Question' : 'Create Question'}
          </AppText>

          <AppTextInputController
            name="questionNumber"
            control={control}
            label="Question Number"
            placeholder="Enter question number"
            keyboardType="numeric"
            disabled={!isEditable || isEditMode}
          />

          <AppTextInputController
            name="questionText"
            control={control}
            label="Question Text"
            placeholder="Enter question text"
            multiline
            numberOfLines={4}
            disabled={!isEditable}
          />

          <AppTextInputController
            name="questionSampleInput"
            control={control}
            label="Sample Input"
            placeholder="Enter sample input (optional)"
            multiline
            numberOfLines={4}
            disabled={!isEditable}
          />

          <AppTextInputController
            name="questionSampleOutput"
            control={control}
            label="Sample Output"
            placeholder="Enter sample output (optional)"
            multiline
            numberOfLines={4}
            disabled={!isEditable}
          />

          <AppTextInputController
            name="score"
            control={control}
            label="Score"
            placeholder="Enter score"
            keyboardType="numeric"
            disabled={!isEditable}
          />

          <View style={styles.buttonContainer}>
            <AppButton
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            {isEditable && (
              <AppButton
                title={isEditMode ? 'Save Changes' : 'Create Question'}
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                style={styles.submitButton}
              />
            )}
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: AppColors.white,
    margin: s(20),
    borderRadius: s(12),
    maxHeight: '90%',
  },
  scrollView: {
    padding: s(20),
  },
  title: {
    marginBottom: vs(20),
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: s(12),
    marginTop: vs(20),
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default QuestionFormModal;

