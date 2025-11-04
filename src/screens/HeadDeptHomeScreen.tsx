import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { s } from 'react-native-size-matters';
import LearningCard from '../components/common/LearningCard';
import LecturerHeader from '../components/common/LecturerHeader';
import SemesterCard from '../components/common/SemesterCard';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
const HeadDeptHomeScreen = () => {
  const navigation = useNavigation<any>();
  const profile = useSelector((state: RootState) => state.userSlice.profile);
  const userName = profile?.name || 'User';
  const userRole =
    typeof profile?.role === 'string'
      ? profile.role
      : Array.isArray(profile?.role)
      ? profile.role.join(', ')
      : 'Role not set';
  return (
    <AppSafeView>
      <LecturerHeader title={`Hi, ${userName}`} role={userRole} />

      <View style={{ paddingHorizontal: s(25) }}>
        <SemesterCard
          title="Current Semester"
          actionLabel="My Plans"
          onPressAction={() => navigation.navigate('PlatListScreen')}
          semesterName="Fall 2025"
        />
      </View>
      <View style={{ paddingHorizontal: s(25), marginTop: s(20) }}>
        <LearningCard
          title="You want to create a new courses?"
          buttonLabel="Courses"
          onPress={() => {
            navigation.navigate('CourseManagementScreen' as never);
          }}
          backgroundColor={AppColors.pr100}
          imageSource={require('../assets/images/illu1.png')}
        />
        <LearningCard
          buttonLabel="Semesters"
          onPress={() => navigation.navigate('SemesterManagementScreen')}
          backgroundColor={'#BFE4C6'}
          imageSource={require('../assets/images/illu2.png')}
          reverse
        />
      </View>
    </AppSafeView>
  );
};

export default HeadDeptHomeScreen;

const styles = StyleSheet.create({});
