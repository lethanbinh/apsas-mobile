import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ImageLibraryOptions,
  launchImageLibrary
} from 'react-native-image-picker';
import { s, vs } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import {
  GenderIdToNameMap,
  GenderMap,
  getAccountById,
  RoleNameToIdMap,
  updateAccount,
  uploadAvatar,
} from '../../api/account';
import {
  EmailInputIcon,
  ImageUploadIcon,
  PhoneIcon,
  ProfileIcon,
  ProfileUploadIcon,
  QuestionMarkIcon,
  UploadProfileIcon,
  UserIcon,
} from '../../assets/icons/input-icon';
import { clearUser } from '../../store/slices/userSlice';
import { RootState } from '../../store/store';
import { AppColors } from '../../styles/color';
import { SecureStorage } from '../../utils/SecureStorage';
import AppButton from '../buttons/AppButton';
import AppTextInput from '../inputs/AppTextInput';
import AppTextInputController from '../inputs/AppTextInputController';
import RadioWithTitle from '../inputs/RadioWithTitle';
import CustomModal from '../modals/CustomModal';
import AppText from '../texts/AppText';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';

const GENDER_OPTIONS = ['Male', 'Female'];

const schema = yup.object({
  email: yup.string().required('Email is required').email('Email is invalid'),
  fullName: yup
    .string()
    .nullable()
    .min(3, 'Full name must contain at least 3 characters')
    .required('Full Name is required'),
  phoneNumber: yup
    .string()
    .nullable()
    .transform(value => {
      if (!value) return null;
      let normalized = value.replace(/\s+/g, '');
      if (normalized.startsWith('+84')) {
        normalized = '0' + normalized.slice(3);
      }
      return normalized;
    })
    .matches(
      /^(0\d{9,10})?$/,
      'Phone Number must start with 0 and have 10–11 digits',
    )
    .required('Phone Number is required'),
});

type FormData = yup.InferType<typeof schema>;
type SelectedFile = {
  uri: string;
  name: string;
  type: string;
} | null;

const ProfileForm = () => {
  const [selectedGender, setSelectedGender] = useState<string>('Male');
  const [uploadAvatarModal, setUploadAvatarModal] = useState<boolean>(false);
  const [logoutModal, setLogoutModal] = useState<boolean>(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null); // The *current* saved avatar URL
  const [tempFile, setTempFile] = useState<SelectedFile>(null); // The *newly picked* file
  const [isUploading, setIsUploading] = useState(false); // Loading for avatar upload
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [accountCode, setAccountCode] = useState<string>('');

  const dispatch = useDispatch();
  const userProfile = useSelector(
    (state: RootState) => state.userSlice.profile,
  );
  const userId = userProfile?.id;

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      fullName: '',
      phoneNumber: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        showErrorToast('Error', 'User ID not found.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await getAccountById(userId);
        reset({
          email: data.email || '',
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
        });
        setAccountCode(data.accountCode || '');
        setSelectedGender(
          data.gender !== null
            ? GenderIdToNameMap[data.gender] || 'Others'
            : 'Others',
        );
        setAvatarUri(data.avatar); // Set initial avatar
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId, reset]);

  const handleChangeGender = (value: string) => {
    setSelectedGender(value);
  };

  const handlePickImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        showErrorToast('Error', response.errorMessage || 'Image picker error');
        return;
      }
      const asset = response.assets?.[0];
      if (asset && asset.uri && asset.fileName && asset.type) {
        setTempFile({
          // Store the full file object
          uri: asset.uri,
          name: asset.fileName,
          type: asset.type,
        });
      }
    });
  };

  const handleSaveAvatar = async () => {
    if (!tempFile) {
      showErrorToast('Error', 'No new image selected.');
      return;
    }
    setIsUploading(true);
    try {
      const newUrl = await uploadAvatar(tempFile);
      setAvatarUri(newUrl);
      setUploadAvatarModal(false);
      setTempFile(null);
      showSuccessToast(
        'Success',
        'Avatar updated. Save profile to make it permanent.',
      );
    } catch (error: any) {
      showErrorToast('Upload Failed', error.message);
    } finally {
      setIsUploading(false);
      setUploadAvatarModal(false);
    }
  };

  const handleSaveProfile = async (formData: FormData) => {
    if (!userId) {
      showErrorToast('Error', 'User ID not found.');
      return;
    }
    setIsSaving(true);
    try {
      const genderValue = GenderMap[selectedGender];

      const roleId =
        userProfile?.role
          ? RoleNameToIdMap[
              Array.isArray(userProfile.role)
                ? userProfile.role[0]
                : userProfile.role
            ]
          : undefined;

      if (roleId === null || roleId === undefined) {
        throw new Error('User role is unknown.');
      }

      const updateData = {
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        gender: genderValue,
        avatar: avatarUri, // Send the new (or existing) avatar URL
        username: userProfile?.username, // Assuming username is needed but not editable
        role: roleId,
        dateOfBirth: userProfile?.dateOfBirth || null, // Send existing DoB
        address: userProfile?.address || null, // Send existing Address
      };

      await updateAccount(userId, updateData);
      showSuccessToast('Success', 'Profile updated successfully.');
    } catch (error: any) {
      showErrorToast('Error', error.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStorage.deleteCredentials('authToken');
      await AsyncStorage.removeItem('tokenExpiresAt');
      dispatch(clearUser());
      console.log('Logout successful, state cleared.');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLogoutModal(false);
    }
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, alignSelf: 'center' }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileWrapper}>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={{ width: 73, height: 73, borderRadius: 36.5 }}
          />
        ) : (
          <ProfileIcon />
        )}
        <TouchableOpacity
          style={styles.uploadWrapper}
          onPress={() => {
            setTempFile(null); // Reset temp file when opening
            setUploadAvatarModal(true);
          }}
        >
          <UploadProfileIcon />
        </TouchableOpacity>
      </View>

      <View style={styles.formWrapper}>
        <AppTextInputController
          name="email"
          control={control}
          placeholder="Enter email"
          label="Email"
          icon={<EmailInputIcon />}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={false}
        />
        <AppTextInputController
          name="fullName"
          control={control}
          placeholder="Enter full name"
          label="Full Name"
          icon={<UserIcon />}
        />
        <AppTextInputController
          name="phoneNumber"
          control={control}
          placeholder="Enter phone number"
          label="Phone Number"
          icon={<PhoneIcon />}
          keyboardType="phone-pad"
        />

        <View style={{ marginBottom: vs(10) }}>
          <AppText
            style={{ color: AppColors.n700, marginBottom: vs(4) }}
            variant="label16pxBold"
          >
            Gender
          </AppText>
          {GENDER_OPTIONS.map(item => (
            <RadioWithTitle
              key={item}
              title={item}
              selected={item === selectedGender}
              onPress={() => handleChangeGender(item)}
            />
          ))}
        </View>

        <AppTextInput
          placeholder="Account Code"
          label="Account code"
          value={accountCode}
          editable={false}
        />

        <AppButton
          onPress={handleSubmit(handleSaveProfile)}
          title="Save"
          style={{ width: s(200), marginTop: vs(10), alignSelf: 'center' }}
          textVariant="label16pxRegular"
          loading={isSaving}
          disabled={isSaving}
        />

        <TouchableOpacity
          style={styles.logoutWrapper}
          onPress={() => setLogoutModal(true)}
        >
          <AppText style={{ color: '#F41F52' }} variant="body14pxBold">
            Logout
          </AppText>
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={uploadAvatarModal}
        onClose={() => setUploadAvatarModal(false)}
        title="Upload Avatar"
        description="Choose an image from your device"
        icon={<ProfileUploadIcon />}
        disableScrollView={true}
      >
        <View style={styles.modalContentCenter}>
          <TouchableOpacity
            style={styles.imagePickerArea}
            onPress={handlePickImage}
          >
            {tempFile?.uri ? (
              <Image
                source={{ uri: tempFile.uri }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            ) : (
              <ImageUploadIcon />
            )}
          </TouchableOpacity>

          <AppButton
            onPress={handleSaveAvatar}
            style={{ width: s(120), marginTop: vs(20), alignSelf: 'center' }}
            title="Save Avatar"
            loading={isUploading}
          />
        </View>
      </CustomModal>

      <CustomModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Are You Sure?"
        description="Do you want to log out?"
        icon={<QuestionMarkIcon />}
        disableScrollView={true}
      >
        <View style={styles.modalButtonRow}>
          <AppButton
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            textColor={AppColors.errorColor}
            style={{ minWidth: 'auto', width: s(80) }}
            size="small"
          />
          <AppButton
            title="Cancel"
            onPress={() => setLogoutModal(false)}
            style={{ minWidth: 'auto', width: s(80) }}
            size="small"
            variant="primary"
          />
        </View>
      </CustomModal>
    </View>
  );
};

export default ProfileForm;

const styles = StyleSheet.create({
  container: {
    paddingVertical: vs(10),
  },
  profileWrapper: {
    width: 73,
    height: 73,
    borderRadius: 36.5,
  },
  uploadWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  formWrapper: {
    marginTop: vs(20),
  },
  logoutWrapper: {
    marginTop: vs(10),
    alignItems: 'center',
  },
  modalContentCenter: {
    alignItems: 'center',
  },
  imagePickerArea: {
    width: s(100),
    height: vs(100),
    borderRadius: s(50),
    backgroundColor: AppColors.n100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.n300,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: s(10),
    justifyContent: 'center',
    marginTop: vs(20),
  },
  avatarImage: {
    width: '100%', // Use 100% of wrapper
    height: '100%',
    borderRadius: 36.5,
  },
  genderSection: {
    marginBottom: vs(10),
  },
  label: {
    color: AppColors.n700,
    marginBottom: vs(4),
  },
  logoutText: {
    color: '#F41F52',
  },
  modalAvatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
