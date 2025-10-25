import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { ClassData, fetchClassList } from '../api/class';
import AppHeader from '../components/common/AppHeader';
import SearchModal from '../components/common/SearchModal';
import SectionHeader from '../components/common/SectionHeader';
import { CourseItemProps } from '../components/courses/CourseItem';
import CourseList from '../components/courses/CourseList';
import SemesterFilterModal from '../components/courses/SemesterFilterModal';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

const sampleCourses = [
  { image: require('../assets/images/course1.png'), color: AppColors.pr100 },
  { image: require('../assets/images/course2.png'), color: AppColors.g100 },
  { image: require('../assets/images/course3.png'), color: AppColors.p100 },
];

const mapApiDataToCourseItemProps = (
  apiData: ClassData[],
  navigation?: any, // Pass navigation if onPress needs it
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
        semesterName: item.semesterName,
      },
      onPress: () => {
        console.log('Class pressed:', item.id);
      },
    };
  });
};

const HomeScreen = () => {
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [allApiData, setAllApiData] = useState<ClassData[]>([]); // Store original API data
  const [mappedClassList, setMappedClassList] = useState<CourseItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [isSemesterModalVisible, setIsSemesterModalVisible] = useState(false); // Modal state
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null); // Filter state (null means 'All')

  useEffect(() => {
    const loadClasses = async () => {
      setIsLoading(true);
      try {
        const apiData = await fetchClassList();
        setAllApiData(apiData); // Save original data

        const uniqueSemesters = [
          ...new Set(apiData.map(item => item.semesterName)),
        ].sort(); // Sort semesters
        setSemesters(uniqueSemesters);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load classes.');
      } finally {
        setIsLoading(false);
      }
    };
    loadClasses();
  }, []);

  // Use useMemo to filter and map data only when dependencies change
  const filteredAndMappedList = useMemo(() => {
    const filteredApiData = selectedSemester
      ? allApiData.filter(item => item.semesterName === selectedSemester)
      : allApiData; // If null, show all
    return mapApiDataToCourseItemProps(filteredApiData);
  }, [allApiData, selectedSemester]); // Re-run when original data or filter changes

  const handleChooseSemester = () => {
    setIsSemesterModalVisible(true); // Open the modal
  };

  const handleSelectSemester = (semester: string | null) => {
    setSelectedSemester(semester); // Update filter state
    setIsSemesterModalVisible(false); // Close the modal
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
        title="Classes"
        buttonText={selectedSemester ?? 'Choose semester'} // Show selected or default text
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
        <CourseList items={filteredAndMappedList} /> // Display filtered list
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

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
});
