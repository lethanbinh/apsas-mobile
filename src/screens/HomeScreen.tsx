import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppHeader from '../components/common/AppHeader';
import SectionHeader from '../components/common/SectionHeader';
import CourseList from '../components/courses/CourseList';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import CourseCategoryList from '../components/courses/CourseCategoryList';
import { allCourses } from '../data/coursesData';

const HomeScreen = () => {
  const handleViewAllCourses = () => {};
  const handleViewAllCourseCategories = () => {};

  return (
    <AppSafeView style={styles.container}>
      <FlatList
        data={[1]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={() => (
          <View style={{ marginTop: vs(15), paddingHorizontal: s(25) }}>
            <CourseCategoryList />
          </View>
        )}
        ListHeaderComponent={
          <>
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
              <CourseList items={allCourses.items}/>
            </View>
            <View style={{ marginTop: vs(25) }}>
              <SectionHeader
                title="Courses Categories"
                buttonText="View all"
                onPress={handleViewAllCourseCategories}
                style={{ paddingHorizontal: s(25) }}
              />
            </View>
          </>
        }
        showsVerticalScrollIndicator={false}
      />
    </AppSafeView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
});
