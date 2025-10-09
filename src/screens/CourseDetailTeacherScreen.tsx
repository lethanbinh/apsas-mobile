import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import {
  EnterIcon,
  LecturerIcon,
  NavigationIcon,
  SemesterIcon,
} from '../assets/icons/courses';
import { EditAssessmentIcon, SmallAppIcon } from '../assets/icons/icon';
import AppButton from '../components/buttons/AppButton';
import CourseCardItem from '../components/courses/CourseCardItem';
import AppTextInput from '../components/inputs/AppTextInput';
import CustomModal from '../components/modals/CustomModal';
import AppText from '../components/texts/AppText';
import { teacherNavigation } from '../data/coursesData';
import { AppColors } from '../styles/color';

const CourseDetailTeacherScreen = () => {
  const navigation = useNavigation();
  const [enterCode, setEnterCode] = useState('');
  const [enterCodeModal, setEnterCodeModal] = useState<boolean>(false);
  const handleSetEnterCode = () => {
    setEnterCodeModal(false);
  };
  return (
    <ScrollView style={styles.container}>
      <Image
        style={styles.image}
        source={require('../assets/images/classimage.png')}
      />
      <View style={styles.classInfoContainer}>
        <View
          style={{
            padding: s(20),
            paddingBottom: vs(10),
          }}
        >
          <AppText
            style={{ color: AppColors.tagColor, marginBottom: vs(3) }}
            variant="label12pxBold"
          >
            C# Course
          </AppText>
          <AppText variant="h4" style={{ marginBottom: vs(10) }}>
            Group SE1720 - Summer2025
          </AppText>
          <View style={styles.tagContainer}>
            <View style={styles.tagWrapper}>
              <SemesterIcon />
              <AppText
                style={{ color: '#202244', marginLeft: vs(5) }}
                variant="label12pxBold"
              >
                Semester 9
              </AppText>
            </View>
            <View style={styles.tagWrapper}>
              <LecturerIcon />
              <AppText
                style={{ color: '#202244', marginLeft: vs(5) }}
                variant="label12pxBold"
              >
                NguyenNT
              </AppText>
            </View>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View
            style={[
              styles.infoButton,
              {
                backgroundColor: '#F5F9FF',
              },
            ]}
          >
            <AppText style={{ color: '#202244' }} variant="body14pxBold">
              SEP490
            </AppText>
          </View>
          <View
            style={[
              styles.infoButton,
              {
                backgroundColor: '',
              },
            ]}
          >
            <AppText style={{ color: '#202244' }} variant="body14pxBold">
              Capstone Project
            </AppText>
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <AppText>
            Graphic Design now a popular profession graphic design by off your
            carrer about tantas regiones barbarorum pedibus obiit Graphic Design
            now a popular profession graphic design by off your carrer about
            tantas regiones barbarorum pedibus obiit...{' '}
            <AppText variant="body14pxBold" style={{ color: AppColors.pr500 }}>
              Read More
            </AppText>
          </AppText>
          <AppButton
            leftIcon={<EnterIcon />}
            textVariant="body12pxRegular"
            style={{
              width: s(130),
              alignSelf: 'flex-start',
              borderRadius: s(8),
            }}
            size="small"
            onPress={() => setEnterCodeModal(true)}
            title="Set Enter code"
          />
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          top: s(480),
          width: s(300),
          alignSelf: 'center',
        }}
      >
        {teacherNavigation.map(item => (
          <View
            key={item.id}
            style={{
              marginBottom: vs(10),
            }}
          >
            <CourseCardItem
              title={item.title}
              leftIcon={<item.leftIcon />}
              backGroundColor={item.backGroundColor}
              rightIcon={
                item.rightIcon ? (
                  item.rightIcon({ color: item.rightIconColor })
                ) : (
                  <NavigationIcon color={item.rightIconColor} />
                )
              }
              linkTo={item.linkTo}
              onDownload={item?.onDownload}
            />
          </View>
        ))}
      </View>

      <CustomModal
        visible={enterCodeModal}
        onClose={() => setEnterCodeModal(false)}
        title="Set Enter code"
        description="Enter 6-digits code for this class"
        icon={<SmallAppIcon />}
      >
        <AppTextInput
          placeholder="Enter class code"
          securityTextEntry
          label="Class code"
          value={enterCode}
          onChangeText={setEnterCode}
        />

        <View style={styles.buttonContainer}>
          <AppButton
            onPress={handleSetEnterCode}
            style={{ width: s(100), marginTop: vs(20) }}
            title="Save"
            size="small"
          />
          <AppButton
            onPress={() => setEnterCodeModal(false)}
            style={{ width: s(100), marginTop: vs(20) }}
            title="Cancel"
            size="small"
            variant="secondary"
            textColor={AppColors.black}
          />
        </View>
      </CustomModal>
    </ScrollView>
  );
};

export default CourseDetailTeacherScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  image: {
    width: '100%',
  },
  classInfoContainer: {
    position: 'absolute',
    top: vs(100),
    width: s(300),
    height: s(350),
    borderRadius: s(30),
    backgroundColor: AppColors.white,
    alignSelf: 'center',

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    // Android shadow
    elevation: 2,
  },
  courseUnEnrollIcon: {
    position: 'absolute',
    top: s(-20),
    right: s(0),
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: s(15),
  },
  infoContainer: {
    height: vs(50),
    flexDirection: 'row',
  },
  infoButton: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    padding: s(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(10),
  },
});
