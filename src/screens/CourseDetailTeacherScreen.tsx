import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { AppColors } from '../styles/color';
import { s, vs } from 'react-native-size-matters';
import {
  CourseUnEnrollIcon,
  LecturerIcon,
  NavigationIcon,
  SemesterIcon,
} from '../assets/icons/courses';
import AppText from '../components/texts/AppText';
import CourseCardItem from '../components/courses/CourseCardItem';
import { navigationList } from '../data/coursesData';
import CustomModal from '../components/modals/CustomModal';
import { QuestionMarkIcon } from '../assets/icons/input-icon';
import AppButton from '../components/buttons/AppButton';

const CourseDetailTeacherScreen = () => {
  const [unEnrollModalVisible, setUnEnrollModalVisible] =
    useState<boolean>(false);

  const handleUnEnrollCourse = () => {
    setUnEnrollModalVisible(false);
  };
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require('../assets/images/classimage.png')}
      />
      <View style={styles.classInfoContainer}>
        <TouchableOpacity
          onPress={() => setUnEnrollModalVisible(true)}
          style={styles.courseUnEnrollIcon}
        >
          <CourseUnEnrollIcon />
        </TouchableOpacity>
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
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          top: s(430),
          width: s(300),
          alignSelf: 'center',
        }}
      >
        {navigationList.map(item => (
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
              rightIcon={<NavigationIcon color={item.rightIconColor} />}
              linkTo={item.linkTo}
            />
          </View>
        ))}
      </View>

      <CustomModal
        visible={unEnrollModalVisible}
        onClose={() => setUnEnrollModalVisible(false)}
        title="Are You Sure?"
        description="Do you want to leave Capstone project by NguyenNT"
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
            size="small"
            title="Yes"
            onPress={handleUnEnrollCourse}
            style={{ minWidth: 'none', width: s(80) }}
          />
          <AppButton
            size="small"
            title="Cancel"
            variant="secondary"
            onPress={() => setUnEnrollModalVisible(false)}
            textColor={AppColors.pr500}
            style={{
              minWidth: 'none',
              width: s(90),
              borderColor: AppColors.pr500,
            }}
          />
        </View>
      </CustomModal>
    </View>
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
    height: s(300),
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
});
