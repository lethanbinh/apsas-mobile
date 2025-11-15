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
import { RubricItem } from '../../api/rubricItemServiceWrapper';
import { rubricItemService } from '../../api/rubricItemServiceWrapper';

type FormData = {
  description: string;
  input: string;
  output: string;
  score: number;
};

const schema = yup
  .object({
    description: yup.string().required('Description is required'),
    input: yup.string(),
    output: yup.string(),
    score: yup.number().required('Score is required'),
  })
  .required();

interface RubricFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: RubricItem | null;
  isEditable: boolean;
  questionId?: number;
}

const RubricFormModal: React.FC<RubricFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  isEditable,
  questionId,
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
        description: initialData?.description ?? '',
        input: initialData?.input ?? '',
        output: initialData?.output ?? '',
        score: initialData?.score ?? 0,
      }),
      [initialData],
    ),
  });

  useEffect(() => {
    if (visible) {
      reset({
        description: initialData?.description ?? '',
        input: initialData?.input ?? '',
        output: initialData?.output ?? '',
        score: initialData?.score ?? 0,
      });
    }
  }, [visible, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && initialData) {
        await rubricItemService.updateRubricItem(initialData.id, data);
        showSuccessToast('Success', 'Rubric updated successfully');
      } else {
        if (!questionId) {
          showErrorToast('Error', 'Question ID is required');
          return;
        }
        await rubricItemService.createRubricItem({
          ...data,
          assessmentQuestionId: questionId,
        });
        showSuccessToast('Success', 'Rubric created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save rubric:', error);
      showErrorToast('Error', error.message || 'Failed to save rubric');
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
            {isEditMode ? 'Edit Rubric' : 'Create Rubric'}
          </AppText>

          <AppTextInputController
            name="description"
            control={control}
            label="Description"
            placeholder="Enter rubric description"
            multiline
            numberOfLines={3}
            disabled={!isEditable}
          />

          <AppTextInputController
            name="input"
            control={control}
            label="Input"
            placeholder="Enter input (optional)"
            multiline
            numberOfLines={3}
            disabled={!isEditable}
          />

          <AppTextInputController
            name="output"
            control={control}
            label="Output"
            placeholder="Enter output (optional)"
            multiline
            numberOfLines={3}
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
                title={isEditMode ? 'Save Changes' : 'Create Rubric'}
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

export default RubricFormModal;

