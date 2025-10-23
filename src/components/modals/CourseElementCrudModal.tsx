import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { s, vs } from 'react-native-size-matters';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import {
  createCourseElement,
  updateCourseElement,
  CourseElementData,
} from '../../api/semester';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';

type FormData = {
  name: string;
  description: string;
  weight: number;
};

const schema = yup
  .object({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required'),
    weight: yup
      .number()
      .typeError('Weight must be a number')
      .required('Weight is required')
      .min(0, 'Weight must be >= 0')
      .max(100, 'Weight must be <= 100'),
  })
  .required();

interface CourseElementCrudModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: CourseElementData | null;
  semesterCourseId: string | number;
}

const CourseElementCrudModal: React.FC<CourseElementCrudModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  semesterCourseId,
}) => {
  const isEditMode = !!initialData;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: useMemo(
      () => ({
        name: initialData?.name ?? '',
        description: initialData?.description ?? '',
        weight: initialData?.weight ?? 0,
      }),
      [initialData],
    ),
  });

  useEffect(() => {
    if (visible) {
      reset({
        name: initialData?.name ?? '',
        description: initialData?.description ?? '',
        weight: initialData?.weight ?? 0,
      });
    }
  }, [visible, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const successMessage = isEditMode
        ? 'Assignment updated'
        : 'Assignment created';

      const payload = {
        ...data,
        semesterCourseId: Number(semesterCourseId),
      };

      if (isEditMode && initialData) {
        await updateCourseElement(initialData.id, payload);
      } else {
        await createCourseElement(payload);
      }
      showSuccessToast('Success', `${successMessage} successfully.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      showErrorToast(
        'Error',
        error.message ||
          `Failed to ${isEditMode ? 'save' : 'create'} assignment.`,
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContentContainer}
        >
          <AppText style={styles.modalTitle} variant="h5">
            {isEditMode ? 'Edit Assignment' : 'Create Assignment'}
          </AppText>

          <AppTextInputController
            name="name"
            control={control}
            label="Name"
            placeholder="Enter assignment name"
            autoCapitalize="words"
          />
          <AppTextInputController
            name="description"
            control={control}
            label="Description"
            placeholder="Enter description"
            multiline
            numberOfLines={3}
          />
          <AppTextInputController
            name="weight"
            control={control}
            label="Weight (%)"
            placeholder="Enter weight (e.g., 100)"
            keyboardType="number-pad"
          />

          <View style={styles.modalButtonRow}>
            <AppButton
              size="medium"
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={{ width: s(120), borderColor: AppColors.pr500 }}
              textColor={AppColors.pr500}
              disabled={isSubmitting}
            />
            <AppButton
              size="medium"
              title={isEditMode ? 'Update' : 'Create'}
              onPress={handleSubmit(onSubmit)}
              style={{ width: s(120) }}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginHorizontal: s(20),
    maxHeight: '85%',
    overflow: 'hidden',
  },
  scrollContentContainer: {
    paddingVertical: vs(20),
    paddingHorizontal: s(20),
  },
  modalTitle: {
    marginBottom: vs(15),
    textAlign: 'center',
    color: AppColors.n800,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(15),
    marginTop: vs(20),
  },
});

export default CourseElementCrudModal;
