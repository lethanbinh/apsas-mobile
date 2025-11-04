import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { s, vs } from 'react-native-size-matters';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import {
  CourseCrudPayload,
  CourseData,
  createCourse,
  updateCourse,
} from '../../api/courseService';

type FormData = CourseCrudPayload;

interface CourseManageModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: CourseData | null;
  existingCodes: string[];
}

const CourseManageModal: React.FC<CourseManageModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  existingCodes,
}) => {
  const isEditMode = !!initialData;

  const schema = yup
    .object({
      name: yup.string().required('Course name is required'),
      code: yup
        .string()
        .required('Course code is required')
        .test(
          'is-unique',
          'This course code already exists.',
          (value: string | undefined) => {
            if (isEditMode || !value) return true;
            return !existingCodes.includes(value.toLowerCase());
          },
        ),
      description: yup.string().required('Description is required'),
    })
    .required();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        name: initialData?.name ?? '',
        description: initialData?.description ?? '',
        code: initialData?.code ?? '',
      });
    }
  }, [visible, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const successMessage = isEditMode ? 'Course updated' : 'Course created';
      if (isEditMode && initialData) {
        await updateCourse(initialData.id, data);
      } else {
        await createCourse(data);
      }
      showSuccessToast('Success', `${successMessage} successfully.`);
      onSuccess();
    } catch (error: any) {
      showErrorToast(
        'Error',
        error.message || `Failed to ${isEditMode ? 'save' : 'create'} course.`,
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
        >
          <AppText style={styles.modalTitle} variant="h3">
            {isEditMode ? 'Edit Course' : 'Create New Course'}
          </AppText>

          <AppTextInputController
            name="code"
            control={control as any}
            label="Course Code"
            placeholder="Enter course code (e.g., CS101)"
            autoCapitalize="characters"
            editable={!isEditMode}
          />
          <AppTextInputController
            name="name"
            control={control as any}
            label="Course Name"
            placeholder="Enter course name"
            autoCapitalize="words"
          />
          <AppTextInputController
            name="description"
            control={control as any}
            label="Description"
            placeholder="Enter description"
            multiline
            numberOfLines={4}
          />

          <View style={styles.modalButtonRow}>
            <AppButton
              size="medium"
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={styles.button}
              textColor={AppColors.pr500}
              disabled={isSubmitting}
            />
            <AppButton
              size="medium"
              title={isEditMode ? 'Update' : 'Create'}
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
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
    padding: s(20),
    marginHorizontal: s(20),
    maxHeight: '85%',
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
  button: {
    width: s(100),
    borderColor: AppColors.pr500,
    minWidth: 0,
  },
});

export default CourseManageModal;
