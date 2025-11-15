import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import { ClassDetailData } from '../../api/class';
import { createClass, updateClass } from '../../api/classService';
import { fetchLecturerList, LecturerListData } from '../../api/lecturerService';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';

const schema = yup
  .object({
    classCode: yup.string().required('Class code is required'),
    totalStudent: yup
      .string()
      .required('Total students is required')
      .matches(/^[0-9]+$/, 'Total students must be a valid number'),
    description: yup.string().nullable().notRequired(),
    lecturerId: yup.number().nullable().required('Lecturer is required'),
    semesterCourseId: yup.number().nullable().required('Course is required'),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

interface ClassCrudModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ClassDetailData | null;
  semesterCourses: { id: string; courseName: string; code: string }[];
  currentSemesterCourseId?: string | number | null; // <-- THÊM PROP NÀY
}
const toNumberOrNull = (
  value: string | number | null | undefined,
): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};
const ClassCrudModal: React.FC<ClassCrudModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  semesterCourses,
  currentSemesterCourseId = null,
}) => {
  const isEditMode = !!initialData;
  const [lecturers, setLecturers] = useState<LecturerListData[]>([]);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: useMemo(
      () => ({
        classCode: initialData?.classCode ?? '',
        totalStudent: String(initialData?.totalStudent ?? 0),
        description: initialData?.description ?? null,
        lecturerId: toNumberOrNull(initialData?.lecturer.id) ?? undefined,
        semesterCourseId: toNumberOrNull(currentSemesterCourseId) ?? undefined,
      }),
      [initialData, currentSemesterCourseId],
    ),
  });

  useEffect(() => {
    if (visible) {
      fetchLecturerList()
        .then(data => setLecturers(data))
        .catch(err => showErrorToast('Error', 'Failed to load lecturers.'));
      reset({
        classCode: initialData?.classCode ?? '',
        totalStudent: String(initialData?.totalStudent ?? 0),
        description: initialData?.description ?? null,
        lecturerId: toNumberOrNull(initialData?.lecturer.id) ?? undefined,
        semesterCourseId: toNumberOrNull(currentSemesterCourseId) ?? undefined,
      });
    }
  }, [visible, initialData, reset, currentSemesterCourseId]); // <-- Thêm dependency

  const onSubmit = async (data: FormData) => {
    try {
      const successMessage = isEditMode ? 'Class updated' : 'Class created';

      const payload = {
        classCode: data.classCode,
        totalStudent: Number(data.totalStudent),
        description: data.description ?? null,
        lecturerId: String(data.lecturerId ?? ''),
        semesterCourseId: String(data.semesterCourseId ?? ''),
      };

      if (isEditMode && initialData) {
        await updateClass(initialData.id, payload);
      } else {
        await createClass(payload);
      }
      showSuccessToast('Success', `${successMessage} successfully.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      showErrorToast(
        'Error',
        error.message || `Failed to ${isEditMode ? 'save' : 'create'} class.`,
      );
    }
  };
  const courseOptions = semesterCourses.map(sc => ({
    label: `${sc.code} - ${sc.courseName}`,
    value: Number(sc.id), // <-- SỬA: Bắt buộc là Number()
  }));
  const lecturerOptions = lecturers.map(l => ({
    label: `${l.fullName} (${l.accountCode})`,
    value: Number(l.lecturerId), // <-- SỬA: Bắt buộc là Number()
  }));

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
            {isEditMode ? 'Edit Class' : 'Create New Class'}
          </AppText>

          <AppTextInputController
            name="classCode"
            control={control}
            label="Class Code"
            placeholder="Enter class code"
          />

          <AppText style={styles.label} variant="label16pxBold">
            Course
          </AppText>
          <Controller
            name="semesterCourseId"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <RNPickerSelect
                  onValueChange={onChange}
                  items={courseOptions}
                  value={value}
                  style={pickerSelectStyles}
                  placeholder={{ label: 'Select a course...', value: null }}
                />
                {error && (
                  <AppText style={styles.textError}>{error.message}</AppText>
                )}
              </View>
            )}
          />

          <AppText style={styles.label} variant="label16pxBold">
            Lecturer
          </AppText>
          <Controller
            name="lecturerId"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <RNPickerSelect
                  onValueChange={onChange}
                  items={lecturerOptions}
                  value={value}
                  style={pickerSelectStyles}
                  placeholder={{ label: 'Select a lecturer...', value: null }}
                />
                {error && (
                  <AppText style={styles.textError}>{error.message}</AppText>
                )}
              </View>
            )}
          />

          <AppTextInputController
            name="totalStudent"
            control={control}
            label="Total Students"
            placeholder="Enter total students"
            keyboardType="number-pad"
          />
          <AppTextInputController
            name="description"
            control={control}
            label="Description"
            placeholder="Enter description"
            multiline
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
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginHorizontal: s(20),
    maxHeight: '85%',
    overflow: 'hidden',
  },
  scrollContentContainer: { paddingVertical: vs(20), paddingHorizontal: s(20) },
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
  label: { color: AppColors.n700, marginBottom: vs(4), marginTop: vs(5) },
  textError: {
    color: AppColors.errorColor,
    fontSize: s(12),
    marginTop: -vs(5),
    marginBottom: vs(10),
  },
  button: { width: s(120), borderColor: AppColors.pr500, minWidth: 0 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: s(14),
    paddingVertical: vs(10),
    paddingHorizontal: s(15),
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(6),
    color: AppColors.n800,
    paddingRight: s(30),
    marginBottom: vs(10),
  },
  inputAndroid: {
    fontSize: s(14),
    paddingVertical: vs(10),
    paddingHorizontal: s(15),
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(6),
    color: AppColors.n800,
    paddingRight: s(30),
    marginBottom: vs(10),
  },
  placeholder: {
    color: AppColors.n400,
  },
});

export default ClassCrudModal;
