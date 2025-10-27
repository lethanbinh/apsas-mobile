import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import { ClassDetailData } from '../../api/class';
import {
  createStudentEnrollment,
  StudentGroupData,
  updateStudentEnrollment,
} from '../../api/studentGroupService';
import { fetchStudentList, StudentListData } from '../../api/studentService';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';

type FormData = {
  classId: string | null; // <-- SỬA
  studentId: string | null; // <-- SỬA
  description: string; // <-- SỬA
};
const schema = yup
  .object({
    classId: yup.string().nullable().required('Class is required'), // <-- SỬA
    studentId: yup.string().nullable().required('Student is required'), // <-- SỬA
    description: yup.string().nullable(), // <-- SỬA
  })
  .required();

interface StudentEnrollmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: StudentGroupData | null; // Use StudentGroupData for editing
  planClasses: ClassDetailData[]; // Pass available classes
}

const StudentEnrollmentModal: React.FC<StudentEnrollmentModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  planClasses,
}) => {
  const isEditMode = !!initialData;
  const [allStudents, setAllStudents] = useState<StudentListData[]>([]); // Sửa: Dùng StudentListData
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: useMemo(
      () => ({
        classId: initialData?.classId ?? null, // <-- SỬA
        studentId: initialData?.studentId ?? null, // <-- SỬA
        description: initialData?.description ?? '', // <-- SỬA
      }),
      [initialData],
    ),
  });

  useEffect(() => {
    if (visible) {
      setIsLoadingStudents(true);
      fetchStudentList()
        .then(data => setAllStudents(data))
        .catch(err => showErrorToast('Error', 'Failed to load student list.'))
        .finally(() => setIsLoadingStudents(false));

      reset({
        classId: initialData?.classId ?? null, // <-- SỬA
        studentId: initialData?.studentId ?? null, // <-- SỬA
        description: initialData?.description ?? '', // <-- SỬA
      });
    }
  }, [visible, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const successMessage = isEditMode
        ? 'Enrollment updated'
        : 'Student enrolled';

      if (isEditMode && initialData) {
        const payload = {
          description: data.description || null,
        };
        await updateStudentEnrollment(initialData.id, payload);
      } else {
        const payload = {
          classId: String(data.classId),
          studentId: String(data.studentId), // Đây là Student ID (ví dụ: "1")
          description: data.description || null,
          enrollmentDate: dayjs().utc().toISOString(),
        };
        await createStudentEnrollment(payload);
      }
      showSuccessToast('Success', `${successMessage} successfully.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      showErrorToast(
        'Error',
        error.message ||
          `Failed to ${isEditMode ? 'update' : 'enroll'} student.`,
      );
    }
  };

  const classOptions = planClasses.map(cls => ({
    label: cls.classCode,
    value: String(cls.id),
  }));

  const studentOptions = allStudents.map(s => ({
    label: `${s.fullName} (${s.accountCode})`,
    value: String(s.id),
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
            {isEditMode ? 'Edit Enrollment' : 'Enroll Student'}
          </AppText>

          <AppText style={styles.label} variant="label16pxBold">
            Class
          </AppText>
          <Controller
            name="classId"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <RNPickerSelect
                  onValueChange={onChange}
                  items={classOptions}
                  value={value}
                  style={pickerSelectStyles}
                  placeholder={{ label: 'Select a class...', value: null }}
                  disabled={isEditMode}
                />
                {error && (
                  <AppText style={styles.textError}>{error.message}</AppText>
                )}
              </View>
            )}
          />

          <AppText style={styles.label} variant="label16pxBold">
            Student
          </AppText>
          <Controller
            name="studentId"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <RNPickerSelect
                  onValueChange={onChange}
                  items={studentOptions}
                  value={value}
                  style={pickerSelectStyles}
                  placeholder={{
                    label: isLoadingStudents
                      ? 'Loading students...'
                      : 'Select a student...',
                    value: null,
                  }}
                  disabled={isEditMode || isLoadingStudents}
                />
                {error && (
                  <AppText style={styles.textError}>{error.message}</AppText>
                )}
              </View>
            )}
          />

          <AppTextInputController
            name="description"
            control={control} // <-- SỬA
            label="Description (Optional)"
            placeholder="Enter description (e.g., enrollment reason)"
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
              title={isEditMode ? 'Update' : 'Enroll'}
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
  placeholder: { color: AppColors.n400 },
});

export default StudentEnrollmentModal;
