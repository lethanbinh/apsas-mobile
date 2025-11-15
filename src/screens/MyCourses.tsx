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
  return (apiData || [])
    .filter(item => item && item.id)
    .map((item, index) => {
      try {
        const sampleIndex = index % sampleCourses.length;
        const randomSample = sampleCourses[sampleIndex] || sampleCourses[0];

        return {
          item: {
            id: item.id,
            title: `${item.courseName || 'Unknown'} (${item.classCode || 'N/A'})`,
            description: item.lecturerName || 'Unknown Lecturer',
            image: randomSample.image,
            color: randomSample.color,
          },
          onPress: () => {
            if (item.id) {
              navigation.navigate('CourseDetailScreen', { classId: item.id });
            }
          },
          isMyCourse: true,
        };
      } catch (err) {
        console.error('Error mapping course item:', err);
        return null;
      }
    })
    .filter((item): item is CourseItemProps => item !== null);
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
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (isLoadingStudentId || studentId === null) {
      if (!isLoadingStudentId && studentId === null) {
        if (isMounted) {
          showErrorToast('Error', 'Could not identify current student.');
          setIsScreenLoading(false);
        }
      }
      return;
    }

    const loadMyClasses = async () => {
      if (!isMounted) return;
      setIsScreenLoading(true);
      try {
        const apiData = await fetchClassList(true, 1, 1000); // Lấy nhiều trang, có students
        if (!isMounted) return;

        const myClasses = (apiData || []).filter(cls =>
          cls && cls.students && Array.isArray(cls.students) && cls.students.some(student => student && student.studentId === studentId),
        );
        if (!isMounted) return;
        setAllApiData(myClasses); // Chỉ lưu lại lớp của tôi

        const uniqueSemesters = [
          ...new Set(myClasses
            .filter(item => item && item.semesterName)
            .map(item => item.semesterName)
            .filter((name): name is string => !!name)
          ),
        ].sort();
        if (!isMounted) return;
        setSemesters(uniqueSemesters);
        if (uniqueSemesters.length > 0) {
          setSelectedSemester(uniqueSemesters[0]);
        }
      } catch (error: any) {
        console.error(error);
        if (isMounted) {
          showErrorToast('Error', 'Failed to load your classes.');
        }
      } finally {
        if (isMounted) {
          setIsScreenLoading(false);
        }
      }
    };
    loadMyClasses();
    return () => {
      setIsMounted(false);
    };
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
