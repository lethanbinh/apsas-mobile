import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
import AppText from '../components/texts/AppText';
import { useGetCurrentStudentId } from '../hooks/useGetCurrentStudentId';

const sampleCourses = [
  { image: require('../assets/images/course1.png'), color: AppColors.pr100 },
  { image: require('../assets/images/course2.png'), color: AppColors.g100 },
  { image: require('../assets/images/course3.png'), color: AppColors.p100 },
];

const mapApiDataToMyCourseItemProps = (
  apiData: ClassData[],
  navigation: any,
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
        navigation.navigate('CourseDetailScreen', { classId: item.id });
      },
      isMyCourse: true,
    };
  });
};

const MyCoursesScreen = () => {
  const navigation = useNavigation<any>();
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [allApiData, setAllApiData] = useState<ClassData[]>([]);
  const { studentId, isLoading: isLoadingStudentId } = useGetCurrentStudentId();
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [isSemesterModalVisible, setIsSemesterModalVisible] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  useEffect(() => {
    if (isLoadingStudentId || studentId === null) {
      if (!isLoadingStudentId && studentId === null) {
        showErrorToast('Error', 'Could not identify current student.');
        setIsScreenLoading(false);
      }
      return;
    }

    const loadMyClasses = async () => {
      setIsScreenLoading(true);
      try {
        const apiData = await fetchClassList(true, 1, 1000); // Lấy nhiều trang, có students
        const myClasses = apiData.filter(cls =>
          cls.students.some(student => student.studentId === studentId),
        );
        setAllApiData(myClasses); // Chỉ lưu lại lớp của tôi
        const uniqueSemesters = [
          ...new Set(myClasses.map(item => item.semesterName)), // Lấy semester từ lớp của tôi
        ].sort();
        setSemesters(uniqueSemesters);
        if (uniqueSemesters.length > 0) {
          setSelectedSemester(uniqueSemesters[0]);
        }
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load your classes.');
        console.error(error);
      } finally {
        setIsScreenLoading(false);
      }
    };
    loadMyClasses();
  }, [studentId, isLoadingStudentId]);

  const filteredAndMappedList = useMemo(() => {
    const filteredApiData = selectedSemester
      ? allApiData.filter(item => item.semesterName === selectedSemester)
      : allApiData;
    return mapApiDataToMyCourseItemProps(filteredApiData, navigation);
  }, [allApiData, selectedSemester, navigation]);

  const handleChooseSemester = () => {
    setIsSemesterModalVisible(true);
  };

  const handleSelectSemester = (semester: string | null) => {
    setSelectedSemester(semester);
    setIsSemesterModalVisible(false);
  };

  const handleOpenSearch = () => setIsSearchModalVisible(true);
  const handleCloseSearch = () => setIsSearchModalVisible(false);

  if (isScreenLoading) {
    return (
      <AppSafeView style={styles.container}>
        <AppHeader onSearch={handleOpenSearch} />
        <ActivityIndicator size="large" style={{ flex: 1 }} />
      </AppSafeView>
    );
  }
  return (
    <AppSafeView style={styles.container}>
      <AppHeader onSearch={handleOpenSearch} />

      <SectionHeader
        title="My Classes"
        buttonText={selectedSemester ?? 'Choose semester'}
        onPress={handleChooseSemester}
        style={{
          paddingHorizontal: s(25),
          marginTop: vs(25),
          marginBottom: vs(5),
        }}
      />
      {filteredAndMappedList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyText}>
            No classes found for{' '}
            {selectedSemester ? `semester ${selectedSemester}` : 'you'}.
          </AppText>
        </View>
      ) : (
        <CourseList items={filteredAndMappedList} />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: AppColors.n500,
    fontSize: s(14),
  },
});
