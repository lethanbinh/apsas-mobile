import React, { useState } from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { SmallAppIcon } from '../../assets/icons/icon';
import { PasswordInputIcon } from '../../assets/icons/input-icon';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import AppTextInput from '../inputs/AppTextInput';
import CustomModal from '../modals/CustomModal';
import AppText from '../texts/AppText';
import { useNavigation } from '@react-navigation/native';

export interface CourseItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    image: any;
    color: string;
  };
  isMyCourse?: boolean;
  onPress: () => void;
  customStyle?: ViewStyle;
}

const CourseItem = ({
  item: { id, title, description, image, color },
  isMyCourse = false,
  onPress,
  customStyle,
}: CourseItemProps) => {
  const navigation = useNavigation();
  const [classPassword, setClassPassword] = useState('');
  const [joinCourseModal, setJoinCourseModal] = useState<boolean>(false);
  const handleOpenJoinCourseModal = () => {
    setJoinCourseModal(true);
  };
  const handleNavigateCourse = () => {
    navigation.navigate('CourseDetailScreen' as never);
  };
  const handleJoinCourse = () => {
    setJoinCourseModal(false);
  };
  return (
    <View style={[styles.container, { backgroundColor: color }, customStyle]}>
      <Image style={styles.image} source={image} />
      <View style={styles.contentContainer}>
        <AppText
          variant="h4"
          style={{
            marginBottom: vs(5),
          }}
        >
          {title}
        </AppText>
        <AppText
          style={{
            marginBottom: vs(15),
          }}
          variant="label12pxRegular"
        >
          {description}
        </AppText>
        <AppButton
          size="small"
          title={isMyCourse ? 'View' : 'Join'}
          textVariant="label12pxBold"
          onPress={() => {
            isMyCourse ? handleNavigateCourse() : handleOpenJoinCourseModal();
          }}
          style={{
            width: s(100),
            borderRadius: s(50),
          }}
        />
      </View>

      <CustomModal
        visible={joinCourseModal}
        onClose={() => setJoinCourseModal(false)}
        title={`Join ${title}`}
        description="Enter your course’s password to join"
        icon={<SmallAppIcon />}
      >
        <AppTextInput
          placeholder="Enter class password"
          secureTextEntry
          label="Password"
          icon={<PasswordInputIcon />}
          value={classPassword}
          onChangeText={setClassPassword}
        />

        <View style={styles.buttonContainer}>
          <AppButton
            onPress={handleJoinCourse}
            style={{ width: s(100), marginTop: vs(20) }}
            title="Save"
            size="small"
          />
          <AppButton
            onPress={() => setJoinCourseModal(false)}
            style={{ width: s(100), marginTop: vs(20) }}
            title="Cancel"
            size="small"
            variant="secondary"
            textColor={AppColors.black}
          />
        </View>
      </CustomModal>
    </View>
  );
};

export default CourseItem;

const styles = StyleSheet.create({
  container: {
    width: s(140),
    borderRadius: s(10),
  },
  image: {
    width: '100%',
    borderRadius: s(10),
  },
  contentContainer: {
    paddingHorizontal: s(10),
    paddingVertical: vs(15),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(10),
  },
});
