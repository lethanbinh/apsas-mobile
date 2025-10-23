import React, { useEffect, useMemo, useState } from 'react';
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
import {
  createAssignRequest,
  updateAssignRequest,
  AssignRequestData,
  CourseElementData,
} from '../../api/semester';
import { AccountData, fetchAccounts, RoleNameToIdMap } from '../../api/account';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import RNPickerSelect from 'react-native-picker-select';

type FormData = {
  courseElementId: string;
  assignedLecturerId: string;
  message: string | null;
};

const schema = yup
  .object({
    courseElementId: yup.string().required('Course Element is required'),
    assignedLecturerId: yup.string().required('Lecturer is required'),
    message: yup.string().nullable().optional(),
  })
  .required();

interface AssignRequestCrudModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AssignRequestData | null;
  courseElements: CourseElementData[];
  hodId: string; // HOD ID (e.g., "1"), NOT accountId
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
  const [lecturers, setLecturers] = useState<AccountData[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: useMemo(
      () => ({
        message: initialData?.message ?? null,
        courseElementId: initialData?.courseElementId ?? '',
        assignedLecturerId: initialData?.assignedLecturerId ?? '',
      }),
      [initialData],
    ),
  });

  useEffect(() => {
    if (visible) {
      fetchAccounts(1, 999, RoleNameToIdMap.LECTURER)
        .then(data => setLecturers(data.items))
        .catch(err => showErrorToast('Error', 'Failed to load lecturers.'));

      reset({
        message: initialData?.message ?? null,
        courseElementId: initialData?.courseElementId ?? '',
        assignedLecturerId: initialData?.assignedLecturerId ?? '',
      });
    }
  }, [visible, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const successMessage = isEditMode
        ? 'Assignment updated'
        : 'Assignment created';

      if (isEditMode && initialData) {
        const payload = {
          message: data.message,
          assignedLecturerId: String(data.assignedLecturerId),
        };
        await updateAssignRequest(initialData.id, payload);
      } else {
        const payload = {
          ...data,
          message: data.message || '', // API có thể yêu cầu string
          assignedLecturerId: String(data.assignedLecturerId),
          courseElementId: String(data.courseElementId),
          assignedByHODId: String(hodId),
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

  const elementOptions = courseElements.map(el => ({
    label: `${el.name} (Weight: ${el.weight}%)`,
    value: el.id,
  }));
  const lecturerOptions = lecturers.map(l => ({
    label: `${l.fullName} (${l.accountCode})`,
    value: String(l.id),
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
          <AppText style={styles.modalTitle} variant="h5">
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
                  disabled={isEditMode} // Không cho sửa course element khi edit
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
  button: { width: s(120), borderColor: AppColors.pr500 },
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
