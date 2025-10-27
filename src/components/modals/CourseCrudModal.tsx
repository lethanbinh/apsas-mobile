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
  createSemesterCourse,
} from '../../api/semester';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { CourseCrudPayload, CourseData, createCourse, updateCourse } from '../../api/courseService';
import { findHoDByAccountId } from '../../api/hodService';

type FormData = CourseCrudPayload;

const schema = yup
  .object({
    name: yup.string().required('Course name is required'),
    description: yup.string().required('Description is required'),
    code: yup.string().required('Course code is required'),
  })
  .required();

interface CourseCrudModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: CourseData | null;
  semesterId: string;
}

const CourseCrudModal: React.FC<CourseCrudModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  semesterId,
}) => {
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
        code: initialData?.code ?? '',
      }),
      [initialData],
    ),
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

  const isEditMode = !!initialData;

  const userAccountId = useSelector(
    (state: RootState) => state.userSlice.profile?.id,
  );

  const onSubmit = async (data: FormData) => {
    try {
      let successMessage = isEditMode ? 'Course updated' : 'Course created';
      let courseId = initialData?.id;

      if (isEditMode && initialData) {
        await updateCourse(initialData.id, data);
      } else {
        const createCourseResponse = await createCourse(data);
        if (!createCourseResponse.result?.id) {
          throw new Error('Failed to create course or get new course ID.');
        }
        courseId = createCourseResponse.result.id;

        if (!userAccountId) {
          throw new Error(
            'HOD Account ID not found. Cannot add course to semester.',
          );
        }
        const hodProfile = await findHoDByAccountId(userAccountId);
        if (!hodProfile || !hodProfile.hoDId) {
          throw new Error(
            'Could not find matching HOD profile for the current user.',
          );
        }
        const createdByHODId = hodProfile.hoDId; // Đây là ID (ví dụ: "1") mà API cần

        await createSemesterCourse({
          semesterId: semesterId,
          courseId: courseId,
          createdByHODId: createdByHODId, // Gửi HoDId (ví dụ: "1")
        });

        successMessage = 'Course created and added to plan';
      }

      showSuccessToast('Success', `${successMessage} successfully.`);
      onSuccess();
      onClose();
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
          contentContainerStyle={styles.scrollContentContainer}
        >
          <AppText style={styles.modalTitle} variant="h3">
            {isEditMode ? 'Edit Course' : 'Create New Course'}
          </AppText>

          <AppTextInputController
            name="code"
            control={control}
            label="Course Code"
            placeholder="Enter course code (e.g., CS101)"
            autoCapitalize="characters"
          />
          <AppTextInputController
            name="name"
            control={control}
            label="Course Name"
            placeholder="Enter course name"
            autoCapitalize="words"
          />
          <AppTextInputController
            name="description"
            control={control}
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
              style={{
                width: s(120),
                borderColor: AppColors.pr500,
                minWidth: 0,
              }}
              textColor={AppColors.pr500}
              disabled={isSubmitting}
            />
            <AppButton
              size="medium"
              title={isEditMode ? 'Update' : 'Create'}
              onPress={handleSubmit(onSubmit)}
              style={{ width: s(120), minWidth: 0 }}
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

export default CourseCrudModal;
