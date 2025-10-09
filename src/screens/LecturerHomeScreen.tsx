// LecturerHomeScreen.tsx
import { StyleSheet, View } from 'react-native';
import React from 'react';
import AppSafeView from '../components/views/AppSafeView';
import LecturerHeader from '../components/common/LecturerHeader';
import SemesterCard from '../components/common/SemesterCard';
import { s } from 'react-native-size-matters';
import LearningCard from '../components/common/LearningCard';
import { AppColors } from '../styles/color';
import { useNavigation } from '@react-navigation/native';

const LecturerHomeScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <AppSafeView>
      <LecturerHeader title="Hi, Binh" role="Lecturer" />
      <View style={{ paddingHorizontal: s(25) }}>
        <SemesterCard
          title="Current Semester"
          actionLabel="My Classes"
          onPressAction={() => navigation.navigate('TeachingClassScreen')}
          semesterName="Fall 2025"
        />
      </View>
      <View style={{ paddingHorizontal: s(25), marginTop: s(20) }}>
        <LearningCard
          title="What do you want to learn today?"
          buttonLabel="Teaching classes"
          onPress={() => navigation.navigate('TeachingClassScreen')}
          backgroundColor={AppColors.pr100}
          imageSource={require('../assets/images/illu1.png')}
        />
        <LearningCard
          buttonLabel="Assignment task"
          onPress={() => navigation.navigate('TaskListScreen')}
          backgroundColor={'#BFE4C6'}
          imageSource={require('../assets/images/illu2.png')}
          reverse
        />
      </View>
    </AppSafeView>
  );
};

export default LecturerHomeScreen;

const styles = StyleSheet.create({});
