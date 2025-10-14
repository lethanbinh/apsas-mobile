import React, { useState } from 'react'; // Thêm useState
import { FlatList, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppHeader from '../components/common/AppHeader';
import SearchModal from '../components/common/SearchModal';
import SectionHeader from '../components/common/SectionHeader';
import CourseCategoryList from '../components/courses/CourseCategoryList';
import CourseList from '../components/courses/CourseList';
import AppSafeView from '../components/views/AppSafeView';
import { allCourses } from '../data/coursesData';
import { AppColors } from '../styles/color';

const HomeScreen = () => {
  // State để quản lý việc hiển thị modal
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const handleViewAllCourses = () => {};
  const handleViewAllCourseCategories = () => {};

  // Hàm để mở modal
  const handleOpenSearch = () => {
    setIsSearchModalVisible(true);
  };

  // Hàm để đóng modal
  const handleCloseSearch = () => {
    setIsSearchModalVisible(false);
  };

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
            <AppHeader onSearch={handleOpenSearch} />
            <View style={{ marginTop: vs(25) }}>
              <SectionHeader
                title="Courses"
                buttonText="View all"
                onPress={handleViewAllCourses}
                style={{ paddingHorizontal: s(25) }}
              />
            </View>
            <View style={{ marginTop: vs(15) }}>
              <CourseList items={allCourses.items} />
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

      {/* Render component modal ở đây */}
      <SearchModal visible={isSearchModalVisible} onClose={handleCloseSearch} />
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
