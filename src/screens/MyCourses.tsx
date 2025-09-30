import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppHeader from '../components/common/AppHeader';
import SectionHeader from '../components/common/SectionHeader';
import CourseList from '../components/courses/CourseList';
import AppSafeView from '../components/views/AppSafeView';
import {
  allMyCourses,
  cSharpMyCourses,
  javaMyCourses
} from '../data/coursesData';
import { AppColors } from '../styles/color';

const MyCoursesScreen = () => {
  const handleViewAll = (title: string) => {
    console.log(`View all for ${title}`);
  };

  const sections = [
    { title: 'All Courses', items: allMyCourses },
    { title: 'C#', items: cSharpMyCourses },
    { title: 'Java', items: javaMyCourses },
  ];

  return (
    <AppSafeView style={styles.container}>
      <AppHeader />
      <FlatList
        data={sections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginTop: vs(25) }}>
            <SectionHeader
              title={item.title}
              buttonText="View all"
              onPress={() => handleViewAll(item.title)}
              style={{ paddingHorizontal: s(25) }}
            />
            <View style={{ marginTop: vs(15) }}>
              <CourseList items={item.items.items} />
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </AppSafeView>
  );
};

export default MyCoursesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
});
