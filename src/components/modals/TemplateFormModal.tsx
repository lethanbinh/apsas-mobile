import React, { useEffect, useMemo } from 'react';
import { Modal, Portal } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { s, vs } from 'react-native-size-matters';
import { StyleSheet, View, ScrollView } from 'react-native';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import RadioWithTitle from '../inputs/RadioWithTitle';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import { AssessmentTemplate } from '../../api/assessmentTemplateServiceWrapper';
import { assessmentTemplateService } from '../../api/assessmentTemplateServiceWrapper';

type FormData = {
  name: string;
  description: string;
  templateType: number;
};

const schema = yup
  .object({
    name: yup.string().required('Template name is required'),
    description: yup.string(),
    templateType: yup.number().required('Template type is required'),
  })
  .required();

interface TemplateFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AssessmentTemplate | null;
  isEditable: boolean;
  assignRequestId: number;
  lecturerId: number;
  assignedToHODId: number;
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  isEditable,
  assignRequestId,
  lecturerId,
  assignedToHODId,
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
        templateType: initialData?.templateType ?? 0,
      }),
      [initialData],
    ),
  });

  useEffect(() => {
    if (visible) {
      reset({
        name: initialData?.name ?? '',
        description: initialData?.description ?? '',
        templateType: initialData?.templateType ?? 0,
      });
    }
  }, [visible, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && initialData) {
        await assessmentTemplateService.updateAssessmentTemplate(
          initialData.id,
          {
            name: data.name,
            description: data.description,
            templateType: data.templateType,
            assignedToHODId: assignedToHODId,
          },
        );
        showSuccessToast('Success', 'Template updated successfully');
      } else {
        await assessmentTemplateService.createAssessmentTemplate({
          name: data.name,
          description: data.description,
          templateType: data.templateType,
          assignRequestId: assignRequestId,
          createdByLecturerId: lecturerId,
          assignedToHODId: assignedToHODId,
        });
        showSuccessToast('Success', 'Template created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save template:', error);
      showErrorToast(
        'Error',
        error.message || 'Failed to save template',
      );
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
            {isEditMode ? 'Edit Template' : 'Create Template'}
          </AppText>

          <AppTextInputController
            name="name"
            control={control}
            label="Template Name"
            placeholder="Enter template name"
            disabled={!isEditable}
          />

          <AppTextInputController
            name="description"
            control={control}
            label="Description"
            placeholder="Enter template description (optional)"
            multiline
            numberOfLines={4}
            disabled={!isEditable}
          />

          <View style={styles.radioContainer}>
            <AppText variant="body14pxBold" style={styles.radioLabel}>
              Template Type
            </AppText>
            <RadioWithTitle
              name="templateType"
              control={control}
              options={[
                { label: 'DSA', value: 0 },
                { label: 'WEBAPI', value: 1 },
              ]}
              disabled={!isEditable}
            />
          </View>

          <View style={styles.buttonContainer}>
            <AppButton
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            {isEditable && (
              <AppButton
                title={isEditMode ? 'Save Changes' : 'Create Template'}
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
  radioContainer: {
    marginTop: vs(12),
    marginBottom: vs(20),
  },
  radioLabel: {
    marginBottom: vs(8),
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

export default TemplateFormModal;

