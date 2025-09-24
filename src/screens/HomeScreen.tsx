import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppSafeView from '../components/views/AppSafeView';
import AppHeader from '../components/common/AppHeader';
import { s, vs } from 'react-native-size-matters';
import SectionHeader from '../components/common/SectionHeader';
import { AppColors } from '../styles/color';
import CourseList from '../components/courses/CourseList';

const HomeScreen = () => {
  const handleViewAllCourses = () => {};
  return (
    <AppSafeView style={styles.container}>
      <AppHeader />
      <View style={{ marginTop: vs(25) }}>
        <SectionHeader
          title="Courses"
          buttonText="View all"
          onPress={handleViewAllCourses}
          style={{ paddingHorizontal: s(25) }}
        />
      </View>
      <View style={{ marginTop: vs(15) }}>
        <CourseList />
      </View>
    </AppSafeView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
  },
});
