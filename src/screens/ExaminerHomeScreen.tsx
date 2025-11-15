import { StyleSheet, View, ScrollView } from 'react-native';
import React from 'react';
import AppSafeView from '../components/views/AppSafeView';
import LecturerHeader from '../components/common/LecturerHeader';
import SemesterCard from '../components/common/SemesterCard';
import { s, vs } from 'react-native-size-matters';
import LearningCard from '../components/common/LearningCard';
import { AppColors } from '../styles/color';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const ExaminerHomeScreen = () => {
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: vs(20) }}
      >
        <View style={{ paddingHorizontal: s(25) }}>
          <SemesterCard
            title="Current Semester"
            actionLabel="Grading Groups"
            onPressAction={() => navigation.navigate('ExaminerGradingGroupsScreen')}
            semesterName="Fall 2025"
          />
        </View>
        <View style={{ paddingHorizontal: s(25), marginTop: s(20) }}>
          <LearningCard
            title="What do you want to do today?"
            buttonLabel="Grading Groups"
            onPress={() => navigation.navigate('ExaminerGradingGroupsScreen')}
            backgroundColor={AppColors.pr100}
            imageSource={require('../assets/images/illu1.png')}
          />
        </View>
      </ScrollView>
    </AppSafeView>
  );
};

export default ExaminerHomeScreen;

const styles = StyleSheet.create({});

