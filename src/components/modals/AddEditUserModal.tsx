import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Modal, Portal } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import {
  AccountData,
  RoleNameToIdMap
} from '../../api/account';
import { CreateExaminerPayload } from '../../api/examinerService';
import { CalendarIcon } from '../../assets/icons/icon';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import RadioWithTitle from '../inputs/RadioWithTitle';
import AppText from '../texts/AppText';

dayjs.extend(utc);
dayjs.extend(timezone);
const baseSchemaFields = {
  username: yup.string().required('Username is required'),
  email: yup.string().required('Email is required').email('Email is invalid'),
  fullName: yup.string().required('Full name is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  address: yup.string().required('Address is required'),
  role: yup
    .mixed()
    .required('Role is required')
    .oneOf([0, 1, 2, 3, 4, 'ADMIN', 'LECTURER', 'STUDENT', 'HOD', 'EXAMINER']),
  department: yup.string().nullable().optional(),
  specialization: yup.string().nullable().optional(),
  dateOfBirth: yup.date().nullable().required('Date of birth is required'),
  gender: yup.number().required('Gender is required'),
  avatar: yup.string().nullable().optional(),
};

const addSchema = yup
  .object({
    accountCode: yup.string().required('Account code is required'),
    ...baseSchemaFields,
    password: yup
      .string()
      .nullable()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    department: yup.string().when('role', {
      is: 1,
      then: schema => schema.required('Department is required for lecturers'),
      otherwise: schema => schema.nullable().optional(),
    }),
    specialization: yup.string().when('role', {
      is: 1,
      then: schema =>
        schema.required('Specialization is required for lecturers'),
      otherwise: schema => schema.nullable().optional(),
    }),
  })
  .required();

const editSchema = yup
  .object({
    accountCode: yup.string().nullable().optional(),
    ...baseSchemaFields,
    password: yup.string().nullable().optional(),
    department: yup.string().when('role', {
      is: 1,
      then: schema => schema.required('Department is required for lecturers'),
      otherwise: schema => schema.nullable().optional(),
    }),
    specialization: yup.string().when('role', {
      is: 1,
      then: schema =>
        schema.required('Specialization is required for lecturers'),
      otherwise: schema => schema.nullable().optional(),
    }),
  })
  .required();

interface AddEditUserModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: any, role: number) => void;
  initialData?: AccountData | null;
  confirmLoading?: boolean;
}

const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  visible,
  onCancel,
  onOk,
  initialData,
  confirmLoading = false,
}) => {
  const isEditMode = !!initialData;
  const currentSchema = isEditMode ? editSchema : addSchema;
  const [selectedGender, setSelectedGender] = useState<number>(0);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(currentSchema) as any,
    defaultValues: useMemo(
      () => ({
        accountCode: initialData?.accountCode ?? '',
        username: initialData?.username ?? '',
        email: initialData?.email ?? '',
        password: '',
        fullName: initialData?.fullName ?? null,
        phoneNumber: initialData?.phoneNumber ?? null,
        address: initialData?.address ?? '',
        role: initialData ? initialData.role : 2,
        department: initialData?.department ?? null,
        specialization: initialData?.specialization ?? null,
        dateOfBirth: initialData?.dateOfBirth
          ? dayjs.utc(initialData.dateOfBirth).local().toDate()
          : null,
        avatar: initialData?.avatar ?? null,
        gender: initialData?.gender ?? 0,
      }),
      [initialData],
    ),
  });

  const selectedRole = watch('role');
  const dateOfBirthValue = watch('dateOfBirth');

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setSelectedGender(initialData.gender ?? 0);
        reset({
          accountCode: initialData.accountCode ?? '',
          username: initialData.username ?? '',
          email: initialData.email ?? '',
          password: '',
          fullName: initialData.fullName ?? null,
          phoneNumber: initialData.phoneNumber ?? null,
          address: initialData.address ?? '',
          role: initialData.role,
          department: initialData.department ?? null,
          specialization: initialData.specialization ?? null,
          dateOfBirth: initialData.dateOfBirth
            ? dayjs.utc(initialData.dateOfBirth).local().toDate()
            : null,
          avatar: initialData.avatar ?? null,
          gender: initialData.gender ?? 0,
        });
      } else {
        setSelectedGender(0);
        reset({
          accountCode: '',
          username: '',
          email: '',
          password: '',
          fullName: null,
          phoneNumber: null,
          address: '',
          role: 2,
          department: null,
          specialization: null,
          dateOfBirth: null,
          avatar: null,
          gender: 0,
        });
      }
    }
  }, [visible, initialData, reset]);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date: Date) => {
    setValue('dateOfBirth', date, { shouldValidate: true });
    hideDatePicker();
  };

  const handleOk = () => {
    handleSubmit((data: any) => {
      // Format data giống web
      const roleId = typeof data.role === 'number' ? data.role : RoleNameToIdMap[data.role] ?? 2;
      const formattedValues = {
        ...data,
        dateOfBirth: data.dateOfBirth
          ? dayjs(data.dateOfBirth).utc().toISOString()
          : null,
        gender: Number(data.gender ?? selectedGender),
        role: roleId,
      };

      if (isEditMode) {
        onOk(formattedValues, roleId);
      } else {
        if (roleId === 4) {
          // Examiner: format như web
          const examinerPayload: CreateExaminerPayload = {
            ...formattedValues,
            role: 'teacher',
          };
          onOk(examinerPayload, roleId);
        } else {
          onOk(formattedValues, roleId);
        }
      }
    })();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onCancel}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContentContainer}
        >
          <AppText style={styles.modalTitle} variant="h3">
            {isEditMode ? `Edit User: ${initialData?.fullName || ''}` : 'Add New User'}
          </AppText>
          <AppTextInputController
            name="accountCode"
            control={control}
            label="Account Code"
            placeholder="Enter account code"
            editable={!isEditMode}
          />
          <AppTextInputController
            name="username"
            control={control}
            label="Username"
            placeholder="Enter username"
            autoCapitalize="none"
            editable={!isEditMode}
          />
          <AppTextInputController
            name="email"
            control={control}
            label="Email"
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isEditMode}
          />
          {!isEditMode && (
            <AppTextInputController
              name="password"
              control={control}
              label="Password"
              placeholder="Enter password"
              secureTextEntry
            />
          )}
          <AppTextInputController
            name="fullName"
            control={control}
            label="Full Name"
            placeholder="Enter full name"
          />
          <AppTextInputController
            name="phoneNumber"
            control={control}
            label="Phone"
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
          <AppTextInputController
            name="address"
            control={control}
            label="Address"
            placeholder="Enter address"
          />
          <AppTextInputController
            name="avatar"
            control={control}
            label="Avatar URL (Optional)"
            placeholder="Enter image URL"
          />

          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field: { value }, fieldState: { error } }) => (
              <View style={styles.dateContainer}>
                <AppText style={styles.label} variant="label16pxBold">
                  Date of Birth
                </AppText>
                <TouchableOpacity
                  onPress={isEditMode ? undefined : showDatePicker}
                  disabled={isEditMode}
                  style={[
                    styles.dateInput,
                    error && styles.errorBorder,
                    isEditMode && styles.disabledInput,
                  ]}
                >
                  <AppText
                    style={[
                      value ? styles.dateText : styles.datePlaceholder,
                      isEditMode && styles.disabledText,
                    ]}
                  >
                    {value ? dayjs(value).format('DD/MM/YYYY') : 'Select date'}
                  </AppText>
                  {!isEditMode && <CalendarIcon />}
                </TouchableOpacity>
                {error && (
                  <AppText style={styles.textError}>{error.message}</AppText>
                )}
              </View>
            )}
          />
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
            date={
              dateOfBirthValue instanceof Date ? dateOfBirthValue : new Date()
            }
          />

          {selectedRole === 1 && (
            <>
              <AppTextInputController
                name="department"
                control={control}
                label="Department"
                placeholder="Enter department"
              />
              <AppTextInputController
                name="specialization"
                control={control}
                label="Specialization"
                placeholder="Enter specialization"
              />
            </>
          )}

          <View style={styles.genderSection}>
            <AppText style={styles.label} variant="label16pxBold">
              Gender
            </AppText>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <>
                  {[
                    { label: 'Male', value: 0 },
                    { label: 'Female', value: 1 },
                    { label: 'Other', value: 2 },
                  ].map(item => (
                    <RadioWithTitle
                      key={item.value}
                      title={item.label}
                      selected={value === item.value}
                      onPress={
                        isEditMode
                          ? () => {}
                          : () => {
                              onChange(item.value);
                              setSelectedGender(item.value);
                            }
                      }
                      disabled={isEditMode}
                    />
                  ))}
                </>
              )}
            />
          </View>

          <View style={styles.roleSection}>
            <AppText style={styles.roleLabel} variant="label16pxBold">
              Role
            </AppText>
            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <>
                  {[
                    { label: 'Admin', value: 0 },
                    { label: 'Lecturer', value: 1 },
                    { label: 'Student', value: 2 },
                    { label: 'HOD', value: 3 },
                    { label: 'Examiner', value: 4 },
                  ].map(item => (
                    <RadioWithTitle
                      key={item.value}
                      title={item.label}
                      selected={value === item.value}
                      onPress={isEditMode ? () => {} : () => onChange(item.value)}
                      disabled={isEditMode}
                    />
                  ))}
                </>
              )}
            />
          </View>

          <View style={styles.modalButtonRow}>
            <AppButton
              size="medium"
              title="Cancel"
              variant="secondary"
              onPress={onCancel}
              style={{
                width: s(100),
                minWidth: 0,
                borderColor: AppColors.pr500,
              }}
              textColor={AppColors.pr500}
              disabled={confirmLoading || isSubmitting}
            />
            <AppButton
              size="medium"
              title={isEditMode ? 'Update' : 'Add'}
              onPress={handleOk}
              style={{ width: s(100), minWidth: 0 }}
              loading={confirmLoading || isSubmitting}
              disabled={confirmLoading || isSubmitting}
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
    marginBottom: vs(20),
    textAlign: 'center',
    color: AppColors.n800,
  },
  dateContainer: {
    marginBottom: vs(10),
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: vs(40),
    borderRadius: s(6),
    borderColor: AppColors.n300,
    paddingHorizontal: s(15),
    borderWidth: 1,
    backgroundColor: AppColors.white,
  },
  dateText: {
    fontSize: s(14),
    color: AppColors.n800,
  },
  datePlaceholder: {
    fontSize: s(14),
    color: AppColors.n400,
  },
  disabledInput: {
    backgroundColor: AppColors.n100,
    opacity: 0.6,
  },
  disabledText: {
    color: AppColors.n500,
  },
  errorBorder: {
    borderColor: AppColors.errorColor,
  },
  textError: {
    color: AppColors.errorColor,
    fontSize: s(12),
    marginTop: vs(2),
  },
  genderSection: {
    marginBottom: vs(10),
  },
  label: {
    color: AppColors.n700,
    marginBottom: vs(4),
  },
  roleSection: {
    marginBottom: vs(10),
  },
  roleLabel: {
    color: AppColors.n700,
    marginBottom: vs(4),
    marginTop: vs(5),
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(15),
    marginTop: vs(20),
  },
});

export default AddEditUserModal;

