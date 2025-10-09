import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { s } from 'react-native-size-matters';
import LearningCard from '../components/common/LearningCard';
import LecturerHeader from '../components/common/LecturerHeader';
import SemesterCard from '../components/common/SemesterCard';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

const HeadDeptHomeScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <AppSafeView>
      <LecturerHeader title="Hi, Binh" role="Head of Department" />

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
          title="You want to create a new semester learning plan?"
          buttonLabel="Create plan"
          onPress={() => navigation.navigate('ChooseSemesterScreen')}
          backgroundColor={AppColors.pr100}
          imageSource={require('../assets/images/illu1.png')}
        />
        <LearningCard
          buttonLabel="Your plans"
          onPress={() => navigation.navigate('PlatListScreen')}
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
