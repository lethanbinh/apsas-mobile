import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import {
  createAssignRequest,
  PlanDetailAssignRequestInitial,
  updateAssignRequest
} from '../../api/assignRequestService';
import { CourseElementData } from '../../api/courseElementService';
import { fetchLecturerList, LecturerListData } from '../../api/lecturerService';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';

const schema = yup
  .object({
    courseElementId: yup.string().required('Course Element is required'),
    assignedLecturerId: yup.string().required('Lecturer is required'),
    message: yup.string().nullable().notRequired(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

interface AssignRequestCrudModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: PlanDetailAssignRequestInitial | null;
  courseElements: CourseElementData[];
  hodId: string;
}

const AssignRequestCrudModal: React.FC<AssignRequestCrudModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  courseElements,
  hodId,
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
        message: initialData?.message ?? null,
        courseElementId: String(initialData?.courseElement?.id ?? ''),
        assignedLecturerId: String(initialData?.lecturer?.id ?? ''),
      }),
      [initialData],
    ),
  });

  useEffect(() => {
    if (visible) {
      console.log(initialData);

      fetchLecturerList()
        .then(data => setLecturers(data))
        .catch(err => showErrorToast('Error', 'Failed to load lecturers.'));

      reset({
        message: initialData?.message ?? null,
        courseElementId: String(initialData?.courseElement?.id ?? ''),
        assignedLecturerId: String(initialData?.lecturer?.id ?? ''),
      });
    }
  }, [visible, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const successMessage = isEditMode
        ? 'Assignment updated'
        : 'Assignment created';

      const assignedLecturerIdNum = Number(data.assignedLecturerId);
      const courseElementIdNum = Number(data.courseElementId);
      const assignedByHODIdNum = Number(hodId);
      console.log('HOD ID Number:', assignedByHODIdNum);

      if (isNaN(assignedLecturerIdNum) || isNaN(courseElementIdNum)) {
        throw new Error('Invalid Lecturer or Course Element ID.');
      }

      if (isEditMode && initialData) {
        if (isNaN(Number(initialData.id))) {
          throw new Error('Invalid Assignment Request ID.');
        }
        const payload = {
          message: data.message || null,
          assignedLecturerId: assignedLecturerIdNum,
          courseElementId: courseElementIdNum,
          assignedByHODId: assignedByHODIdNum,
          status: 1, // Default status for edit mode
          assignedAt: new Date().toISOString(), // Use current timestamp
        };
        await updateAssignRequest(initialData.id, payload);
      } else {
        if (isNaN(assignedByHODIdNum)) {
          throw new Error('Invalid HOD ID.');
        }
        const payload = {
          message: data.message || null,
          assignedLecturerId: assignedLecturerIdNum,
          courseElementId: courseElementIdNum,
          assignedByHODId: assignedByHODIdNum,
          status: 1,
          assignedAt: new Date().toISOString(),
        };
        await createAssignRequest(payload);
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

  const elementOptions = courseElements.map(el => {
    // Convert decimal (0.25) to percentage (25%)
    const weightPercent = typeof el.weight === 'number' ? el.weight * 100 : Number(el.weight) * 100 || 0;
    return {
      label: `${el.name} (Weight: ${weightPercent.toFixed(1)}%)`,
      value: String(el.id),
    };
  });

  const lecturerOptions = lecturers.map(l => ({
    label: `${l.fullName} (${l.accountCode})`,
    value: String(l.lecturerId),
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
            {isEditMode ? 'Edit Assignment' : 'Assign Teacher'}
          </AppText>

          <AppText style={styles.label} variant="label16pxBold">
            Course Element
          </AppText>
          <Controller
            name="courseElementId"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <RNPickerSelect
                  onValueChange={onChange}
                  items={elementOptions}
                  value={value}
                  style={pickerSelectStyles}
                  placeholder={{ label: 'Select an element...', value: null }}
                />
                {error && (
                  <AppText style={styles.textError}>{error.message}</AppText>
                )}
              </View>
            )}
          />

          <AppText style={styles.label} variant="label16pxBold">
            Assign Lecturer
          </AppText>
          <Controller
            name="assignedLecturerId"
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
            name="message"
            control={control}
            label="Message (Optional)"
            placeholder="Enter a message"
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
              title={isEditMode ? 'Update' : 'Assign'}
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

export default AssignRequestCrudModal;
