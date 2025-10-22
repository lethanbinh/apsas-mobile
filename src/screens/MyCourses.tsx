import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppHeader from '../components/common/AppHeader';
import SearchModal from '../components/common/SearchModal';
import SectionHeader from '../components/common/SectionHeader';
import CourseList from '../components/courses/CourseList';
import { CourseItemProps } from '../components/courses/CourseItem';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { showErrorToast } from '../components/toasts/AppToast';
import { ClassData, fetchClassList } from '../api/class'; // Assuming API fetch function
import SemesterFilterModal from '../components/courses/SemesterFilterModal';

const sampleCourses = [
  { image: require('../assets/images/course1.png'), color: AppColors.pr100 },
  { image: require('../assets/images/course2.png'), color: AppColors.g100 },
  { image: require('../assets/images/course3.png'), color: AppColors.p100 },
];

const mapApiDataToMyCourseItemProps = (
  apiData: ClassData[],
): CourseItemProps[] => {
  return apiData.map((item, index) => {
    const sampleIndex = index % sampleCourses.length;
    const randomSample = sampleCourses[sampleIndex];

    return {
      item: {
        id: item.id,
        title: `${item.courseName} (${item.classCode})`,
        description: item.lecturerName,
        image: randomSample.image,
        color: randomSample.color,
      },
      onPress: () => {
        console.log('My Class pressed:', item.id);
      },
      isMyCourse: true, // Set this prop to true
    };
  });
};

const MyCoursesScreen = () => {
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [allApiData, setAllApiData] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [isSemesterModalVisible, setIsSemesterModalVisible] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  useEffect(() => {
    const loadMyClasses = async () => {
      setIsLoading(true);
      try {
        // NOTE: You might need a DIFFERENT API endpoint for "My Classes"
        // Using fetchClassList for now as an example
        const apiData = await fetchClassList(); // Replace if needed
        setAllApiData(apiData);

        const uniqueSemesters = [
          ...new Set(apiData.map(item => item.semesterName)),
        ].sort();
        setSemesters(uniqueSemesters);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load your classes.');
      } finally {
        setIsLoading(false);
      }
    };
    loadMyClasses();
  }, []);

  const filteredAndMappedList = useMemo(() => {
    const filteredApiData = selectedSemester
      ? allApiData.filter(item => item.semesterName === selectedSemester)
      : allApiData;
    return mapApiDataToMyCourseItemProps(filteredApiData); // Use the correct mapping function
  }, [allApiData, selectedSemester]);

  const handleChooseSemester = () => {
    setIsSemesterModalVisible(true);
  };

  const handleSelectSemester = (semester: string | null) => {
    setSelectedSemester(semester);
    setIsSemesterModalVisible(false);
  };

  const handleOpenSearch = () => {
    setIsSearchModalVisible(true);
  };
  const handleCloseSearch = () => {
    setIsSearchModalVisible(false);
  };

  return (
    <AppSafeView style={styles.container}>
      <AppHeader onSearch={handleOpenSearch} />

      <SectionHeader
        title="My Classes" // Changed title
        buttonText={selectedSemester ?? 'Choose semester'}
        onPress={handleChooseSemester}
        style={{
          paddingHorizontal: s(25),
          marginTop: vs(25),
          marginBottom: vs(5),
        }}
      />

      {isLoading ? (
        <ActivityIndicator size="large" style={{ flex: 1 }} />
      ) : (
        <CourseList items={filteredAndMappedList} /> // Display the grid
      )}

      <SearchModal visible={isSearchModalVisible} onClose={handleCloseSearch} />
      <SemesterFilterModal
        visible={isSemesterModalVisible}
        semesters={semesters}
        selectedSemester={selectedSemester}
        onSelect={handleSelectSemester}
        onClose={() => setIsSemesterModalVisible(false)}
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
