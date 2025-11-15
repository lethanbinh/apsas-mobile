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
import { AssessmentPaper } from '../../api/assessmentPaperServiceWrapper';
import { assessmentPaperService } from '../../api/assessmentPaperServiceWrapper';

type FormData = {
  name: string;
  description: string;
};

const schema = yup
  .object({
    name: yup.string().required('Paper name is required'),
    description: yup.string(),
  })
  .required();

interface PaperFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AssessmentPaper | null;
  isEditable: boolean;
  templateId: number;
}

const PaperFormModal: React.FC<PaperFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  isEditable,
  templateId,
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
        name: initialData?.name ?? '',
        description: initialData?.description ?? '',
      }),
      [initialData],
    ),
  });

  useEffect(() => {
    if (visible) {
      reset({
        name: initialData?.name ?? '',
        description: initialData?.description ?? '',
      });
    }
  }, [visible, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && initialData) {
        await assessmentPaperService.updateAssessmentPaper(
          initialData.id,
          data,
        );
        showSuccessToast('Success', 'Paper updated successfully');
      } else {
        await assessmentPaperService.createAssessmentPaper({
          ...data,
          assessmentTemplateId: templateId,
        });
        showSuccessToast('Success', 'Paper created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save paper:', error);
      showErrorToast('Error', error.message || 'Failed to save paper');
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
            {isEditMode ? 'Edit Paper' : 'Create Paper'}
          </AppText>

          <AppTextInputController
            name="name"
            control={control}
            label="Paper Name"
            placeholder="Enter paper name"
            disabled={!isEditable}
          />

          <AppTextInputController
            name="description"
            control={control}
            label="Description"
            placeholder="Enter paper description (optional)"
            multiline
            numberOfLines={4}
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
                title={isEditMode ? 'Save Changes' : 'Create Paper'}
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

export default PaperFormModal;

