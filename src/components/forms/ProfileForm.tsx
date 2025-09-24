import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
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
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInput from '../inputs/AppTextInput';
import AppTextInputController from '../inputs/AppTextInputController';
import RadioWithTitle from '../inputs/RadioWithTitle';
import CustomModal from '../modals/CustomModal';
import AppText from '../texts/AppText';

const GENDER = ['Male', 'Female', 'Others'];

const ProfileForm = () => {
  const [selectedItem, setSelectedItem] = useState<string>('Male');
  const [uploadAvatarModal, setUploadAvatarModal] = useState<boolean>(false);
  const [logoutModal, setLogoutModal] = useState<boolean>(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null);

  type FormData = yup.InferType<typeof schema>;
  const schema = yup.object({
    email: yup.string().required('Email is required').email('Email is invalid'),
    fullName: yup
      .string()
      .required('Full Name is required')
      .min(3, 'Full name must contain at least 3 characters'),
    phoneNumber: yup
      .string()
      .transform(value => {
        if (!value) return value;
        let normalized = value.replace(/\s+/g, ''); // bỏ khoảng trắng
        if (normalized.startsWith('+84')) {
          normalized = '0' + normalized.slice(3); // chuyển +84 -> 0
        }
        return normalized;
      })
      .required('Phone Number is required')
      .matches(
        /^0\d{9,10}$/,
        'Phone Number must start with 0 and have 10–11 digits',
      ),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const handleChangeGender = (value: string) => {
    setSelectedItem(value);
  };

  const handlePickImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          setTempAvatarUri(uri); // chỉ update tạm trong modal
        }
      }
    });
  };

  const handleSaveProfile = (formData: FormData) => {};

  const handleLogout = () => {
    setLogoutModal(false);
  };
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
          onPress={() => setUploadAvatarModal(true)}
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
        />

        <View
          style={{
            marginBottom: vs(10),
          }}
        >
          <AppText
            style={{
              color: AppColors.n700,
              marginBottom: vs(4),
            }}
            variant="label16pxBold"
          >
            Gender
          </AppText>
          {GENDER.map(item => {
            return (
              <RadioWithTitle
                key={item}
                title={item}
                selected={item === selectedItem}
                onPress={() => handleChangeGender(item)}
              />
            );
          })}
        </View>
        <AppTextInput
          placeholder="SE173315"
          label="Student code"
          editable={false}
        />

        <AppButton
          onPress={handleSubmit(handleSaveProfile)}
          title="Save"
          style={{ width: s(200), marginTop: vs(10) }}
          textVariant="label16pxRegular"
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
      >
        <TouchableOpacity
          style={{ alignItems: 'center' }}
          onPress={handlePickImage}
        >
          {tempAvatarUri ? (
            <Image
              source={{ uri: tempAvatarUri }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          ) : (
            <ImageUploadIcon />
          )}
        </TouchableOpacity>

        <AppButton
          onPress={() => {
            setAvatarUri(tempAvatarUri);
            setUploadAvatarModal(false);
          }}
          style={{ width: s(120), marginTop: vs(20) }}
          title="Save"
        />
      </CustomModal>

      <CustomModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Are You Sure?"
        description="Do you want to log out?"
        icon={<QuestionMarkIcon />}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: s(10),
            justifyContent: 'center',
          }}
        >
          <AppButton
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            textColor={AppColors.errorColor}
            style={{ minWidth: 'none', width: s(80) }}
          />
          <AppButton
            title="Cancel"
            onPress={() => setLogoutModal(false)}
            style={{ minWidth: 'none', width: s(80) }}
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
});
