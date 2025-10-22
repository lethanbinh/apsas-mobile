import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native'; // Import ScrollView
import { Modal, Portal, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { s, vs } from 'react-native-size-matters';
import AppButton from '../buttons/AppButton';
import AppTextInputController from '../inputs/AppTextInputController';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { createAccount, RoleNameToIdMap } from '../../api/account';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';

type FormData = {
  accountCode: string;
  username: string;
  email: string;
  password: string;
  fullName?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  address?: string | null | undefined;
  role: 'Admin' | 'HOD' | 'Lecturer' | 'Student';
};

const schema = yup
  .object({
    accountCode: yup.string().defined().required('Account code is required'),
    username: yup.string().defined().required('Username is required'),
    email: yup
      .string()
      .defined()
      .required('Email is required')
      .email('Email is invalid'),
    password: yup
      .string()
      .defined()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    fullName: yup.string().nullable().optional(),
    phoneNumber: yup.string().nullable().optional(),
    address: yup.string().nullable().optional(),
    role: yup
      .string()
      .defined()
      .required('Role is required')
      .oneOf(['Admin', 'HOD', 'Lecturer', 'Student']),
  })
  .required();

interface AddEditUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      accountCode: '',
      username: '',
      email: '',
      password: '',
      fullName: null,
      phoneNumber: null,
      address: null,
      role: 'Student',
    },
  });

  useEffect(() => {
    if (!visible) {
      reset();
    }
  }, [visible, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const roleId = RoleNameToIdMap[data.role];
      if (roleId === undefined || roleId === null) {
        throw new Error('Invalid role selected.');
      }
      const apiData = {
        ...data,
        fullName: data.fullName || null,
        phoneNumber: data.phoneNumber || null,
        address: data.address || null,
        role: roleId,
        gender: null,
        dateOfBirth: null,
        avatar: null,
      };
      await createAccount(apiData);
      showSuccessToast('Success', 'Account created successfully.');
      onSuccess();
      onClose();
    } catch (error: any) {
      showErrorToast('Error', error.message || 'Failed to create account.');
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer} // Apply container style here
      >
        {/* Wrap form content in ScrollView */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContentContainer} // Apply padding here
        >
          <AppText style={styles.modalTitle} variant="h5">
            Create New Account
          </AppText>
          <AppTextInputController
            name="accountCode"
            control={control}
            label="Account Code"
            placeholder="Enter account code"
          />
          <AppTextInputController
            name="username"
            control={control}
            label="Username"
            placeholder="Enter username"
            autoCapitalize="none"
          />
          <AppTextInputController
            name="email"
            control={control}
            label="Email"
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppTextInputController
            name="password"
            control={control}
            label="Password"
            placeholder="Enter password"
            secureTextEntry
          />
          <AppTextInputController
            name="fullName"
            control={control}
            label="Full Name (Optional)"
            placeholder="Enter full name"
          />
          <AppTextInputController
            name="phoneNumber"
            control={control}
            label="Phone (Optional)"
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
          <AppTextInputController
            name="address"
            control={control}
            label="Address (Optional)"
            placeholder="Enter address"
          />

          <AppText style={styles.roleLabel} variant="label16pxBold">
            Role
          </AppText>
          <Controller
            control={control}
            name="role"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value || 'Student'}
                onValueChange={onChange}
                style={styles.segmentedButtons}
                buttons={[
                  {
                    value: 'Student',
                    label: 'Student',
                    style: styles.segmentButton,
                  },
                  {
                    value: 'Lecturer',
                    label: 'Lecturer',
                    style: styles.segmentButton,
                  },
                  { value: 'HOD', label: 'HOD', style: styles.segmentButton },
                  {
                    value: 'Admin',
                    label: 'Admin',
                    style: styles.segmentButton,
                  },
                ]}
              />
            )}
          />

          <View style={styles.modalButtonRow}>
            <AppButton
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={{ width: s(100), borderColor: AppColors.pr500 }}
              textColor={AppColors.pr500}
              disabled={isSubmitting}
            />
            <AppButton
              title="Create"
              onPress={handleSubmit(onSubmit)}
              style={{ width: s(100) }}
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
    paddingVertical: 0, // Remove vertical padding from container
    paddingHorizontal: 0, // Remove horizontal padding from container
    marginHorizontal: s(20),
    maxHeight: '85%', // Limit modal height
    overflow: 'hidden', // Ensure content stays within rounded corners
  },
  scrollContentContainer: {
    // Add padding for the scroll content
    paddingVertical: vs(20),
    paddingHorizontal: s(20),
  },
  modalTitle: {
    marginBottom: vs(15),
    textAlign: 'center',
    color: AppColors.n800,
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
