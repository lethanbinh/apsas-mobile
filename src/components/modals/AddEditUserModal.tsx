import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { s, vs } from 'react-native-size-matters';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import {
  createAdmin,
  createHoD,
  createLecturer,
  createStudent,
  updateAccount,
  AccountData,
  RoleNameToIdMap,
  RoleMap,
  GenderMap,
  GenderIdToNameMap,
} from '../../api/account';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import AppTextInput from '../inputs/AppTextInput';
import RadioWithTitle from '../inputs/RadioWithTitle';
import { CalendarIcon } from '../../assets/icons/icon';

dayjs.extend(utc);
dayjs.extend(timezone);

type FormData = {
  username: string;
  email: string;
  password?: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  address: string;
  role: string;
  department?: string | null;
  specialization?: string | null;
  dateOfBirth: Date | null;
  avatar: string | null;
};

const baseSchemaFields = {
  username: yup.string().required('Username is required'),
  email: yup.string().required('Email is required').email('Email is invalid'),
  fullName: yup.string().nullable().optional(),
  phoneNumber: yup.string().nullable().optional(),
  address: yup.string().required('Address is required'),
  role: yup
    .string()
    .required('Role is required')
    .oneOf(Object.keys(RoleNameToIdMap).filter(k => k !== 'All')),
  department: yup.string().nullable().optional(),
  specialization: yup.string().nullable().optional(),
  dateOfBirth: yup.date().nullable().required('Date of birth is required'),
};

const addSchema = yup
  .object({
    ...baseSchemaFields,
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    department: yup.string().when('role', {
      is: 'LECTURER',
      then: schema => schema.required('Department is required for lecturers'),
      otherwise: schema => schema.nullable().optional(),
    }),
    specialization: yup.string().when('role', {
      is: 'LECTURER',
      then: schema =>
        schema.required('Specialization is required for lecturers'),
      otherwise: schema => schema.nullable().optional(),
    }),
  })
  .required();

const editSchema = yup
  .object({
    ...baseSchemaFields,
    password: yup.string().nullable().optional(),
    department: yup.string().when('role', {
      is: 'LECTURER',
      then: schema => schema.required('Department is required for lecturers'),
      otherwise: schema => schema.nullable().optional(),
    }),
    specialization: yup.string().when('role', {
      is: 'LECTURER',
      then: schema =>
        schema.required('Specialization is required for lecturers'),
      otherwise: schema => schema.nullable().optional(),
    }),
  })
  .required();

interface AddEditUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AccountData | null;
}

const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
}) => {
  const isEditMode = !!initialData;
  const currentSchema = isEditMode ? editSchema : addSchema;
  const [selectedGender, setSelectedGender] = useState<string>('Male');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(currentSchema),
    defaultValues: useMemo(
      () => ({
        username: initialData?.username ?? '',
        email: initialData?.email ?? '',
        password: '',
        fullName: initialData?.fullName ?? null,
        phoneNumber: initialData?.phoneNumber ?? null,
        address: initialData?.address ?? '',
        role: initialData ? RoleMap[initialData.role] ?? 'STUDENT' : 'STUDENT',
        department: initialData?.department ?? null,
        specialization: initialData?.specialization ?? null,
        dateOfBirth: initialData?.dateOfBirth
          ? dayjs.utc(initialData.dateOfBirth).local().toDate()
          : null,
        avatar: initialData?.avatar ?? null,
      }),
      [initialData],
    ),
  });

  const selectedRole = watch('role');
  const dateOfBirthValue = watch('dateOfBirth');

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setSelectedGender(
          initialData.gender !== null
            ? GenderIdToNameMap[initialData.gender] ?? 'Male'
            : 'Male',
        ); // Default to Male if 'Others'
        reset({
          username: initialData.username ?? '',
          email: initialData.email ?? '',
          password: '',
          fullName: initialData.fullName ?? null,
          phoneNumber: initialData.phoneNumber ?? null,
          address: initialData.address ?? '',
          role: RoleMap[initialData.role] ?? 'STUDENT',
          department: initialData.department ?? null,
          specialization: initialData.specialization ?? null,
          dateOfBirth: initialData.dateOfBirth
            ? dayjs.utc(initialData.dateOfBirth).local().toDate()
            : null,
          avatar: initialData.avatar ?? null,
        });
      } else {
        setSelectedGender('Male');
        reset({
          username: '',
          email: '',
          password: '',
          fullName: null,
          phoneNumber: null,
          address: '',
          role: 'STUDENT',
          department: null,
          specialization: null,
          dateOfBirth: null,
          avatar: null,
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

  const onSubmit = async (data: FormData) => {
    try {
      const roleId = RoleNameToIdMap[data.role];
      if (roleId === undefined || roleId === null) {
        throw new Error('Invalid role selected.');
      }
      const genderValue = GenderMap[selectedGender];
      const dateOfBirthISO = data.dateOfBirth
        ? dayjs(data.dateOfBirth).utc().toISOString()
        : null;

      const baseApiData: any = {
        username: data.username,
        email: data.email,
        ...(!isEditMode && data.password && { password: data.password }),
        fullName: data.fullName || null,
        phoneNumber: data.phoneNumber || null,
        address: data.address,
        gender: genderValue,
        dateOfBirth: dateOfBirthISO,
        avatar: data.avatar || null,
      };

      let response;
      const successMessage = isEditMode ? 'Account updated' : 'Account created';

      if (isEditMode && initialData) {
        const updateData = { ...baseApiData, role: roleId };
        await updateAccount(initialData.id, updateData);
      } else {
        if (!baseApiData.password) {
          throw new Error('Password is required to create an account.');
        }
        switch (data.role) {
          case 'ADMIN':
            response = await createAdmin(baseApiData);
            break;
          case 'HOD':
            response = await createHoD(baseApiData);
            break;
          case 'LECTURER':
            const lecturerData = {
              ...baseApiData,
              department: data.department || null,
              specialization: data.specialization || null,
            };
            response = await createLecturer(lecturerData);
            break;
          case 'STUDENT':
            response = await createStudent(baseApiData);
            break;
          default:
            throw new Error(`Unhandled role: ${data.role}`);
        }
      }

      showSuccessToast('Success', `${successMessage} successfully.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      showErrorToast(
        'Error',
        error.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} account.`,
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
            {isEditMode ? 'Edit Account' : 'Create New Account'}
          </AppText>
          {isEditMode && initialData?.accountCode && (
            <AppTextInput
              label="Account Code"
              value={initialData.accountCode}
              editable={false}
            />
          )}
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
                  onPress={showDatePicker}
                  style={[styles.dateInput, error && styles.errorBorder]}
                >
                  <AppText
                    style={value ? styles.dateText : styles.datePlaceholder}
                  >
                    {value ? dayjs(value).format('DD/MM/YYYY') : 'Select date'}
                  </AppText>
                  <CalendarIcon />
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

          {selectedRole === 'LECTURER' && (
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
              {' '}
              Gender{' '}
            </AppText>
            {['Male', 'Female'].map(
              (
                item, // Removed 'Others'
              ) => (
                <RadioWithTitle
                  key={item}
                  title={item}
                  selected={item === selectedGender}
                  onPress={() => setSelectedGender(item)}
                />
              ),
            )}
          </View>

          <AppText style={styles.roleLabel} variant="label16pxBold">
            Role
          </AppText>
          <Controller
            control={control}
            name="role"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value ?? 'STUDENT'}
                onValueChange={onChange}
                style={styles.segmentedButtons}
                buttons={Object.entries(RoleMap).map(([id, name]) => ({
                  value: name,
                  label: name.charAt(0) + name.slice(1).toLowerCase(),
                  style: styles.segmentButton,
                }))}
              />
            )}
          />

          <View style={styles.modalButtonRow}>
            <AppButton
              size="medium"
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={{
                width: s(100),
                minWidth: 0,
                borderColor: AppColors.pr500,
              }}
              textColor={AppColors.pr500}
              disabled={isSubmitting}
            />
            <AppButton
              size="medium"
              title={isEditMode ? 'Update' : 'Create'}
              onPress={handleSubmit(onSubmit)}
              style={{ width: s(100), minWidth: 0 }}
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
  roleLabel: {
    color: AppColors.n700,
    marginBottom: vs(4),
    marginTop: vs(5),
  },
  segmentedButtons: {
    marginBottom: vs(10),
  },
  segmentButton: {
    flex: 1,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(15),
    marginTop: vs(20),
  },
});

export default AddEditUserModal;
