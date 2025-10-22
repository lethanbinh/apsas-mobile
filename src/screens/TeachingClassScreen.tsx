import React, { useEffect, useState, useMemo } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import ScreenHeader from '../components/common/ScreenHeader';
import SemesterDropdown from '../components/common/SemesterDropdown';
import AppSafeView from '../components/views/AppSafeView';
import SubmissionItem from '../components/score/SubmissionItem';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store/store';
import {
  fetchClassList,
  fetchSemesterList,
  ClassData,
  SemesterData,
} from '../api/class';
import { showErrorToast } from '../components/toasts/AppToast';
import { AppColors } from '../styles/color';
import AppText from '../components/texts/AppText';

const TeachingClassScreen = () => {
  const navigation = useNavigation<any>();
  const userProfile = useSelector(
    (state: RootState) => state.userSlice.profile,
  );
  const lecturerAccountCode = userProfile?.accountCode;

  const [allMyClasses, setAllMyClasses] = useState<ClassData[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!lecturerAccountCode) {
        showErrorToast('Error', 'User account code not loaded.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [classList, semesterList] = await Promise.all([
          fetchClassList(),
          fetchSemesterList(),
        ]);

        const filteredByLecturer = classList.filter(
          cls => cls.lecturerCode === lecturerAccountCode,
        );

        setAllMyClasses(filteredByLecturer);
        setSemesters(semesterList);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [lecturerAccountCode]);

  const semesterNamesForDropdown = useMemo(() => {
    const uniqueApiSemesters = [...new Set(semesters.map(s => s.semesterCode))];
    return uniqueApiSemesters.sort().reverse();
  }, [semesters]);

  const displayedClasses = useMemo(() => {
    if (!selectedSemester) {
      return allMyClasses;
    }
    return allMyClasses.filter(cls =>
      cls.semesterName.startsWith(selectedSemester),
    );
  }, [allMyClasses, selectedSemester]);

  const handleSemesterSelect = (semester: string | null) => {
    setSelectedSemester(semester);
  };

  return (
    <AppSafeView style={styles.container}>
      <ScreenHeader title="My Classes" />

      <View style={styles.contentContainer}>
        <SemesterDropdown
          semesters={semesterNamesForDropdown}
          onSelect={handleSemesterSelect}
        />

        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={displayedClasses}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <SubmissionItem
                fileName={`${item.courseName} (${item.classCode})`}
                title={item.semesterName}
                onNavigate={() =>
                  navigation.navigate('CourseDetailTeacherScreen', {
                    classId: item.id,
                  })
                }
              />
            )}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContentContainer}
            ListEmptyComponent={
              <AppText style={styles.emptyText}>No classes found.</AppText>
            }
          />
        )}
      </View>
    </AppSafeView>
  );
};

export default TeachingClassScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  contentContainer: {
    paddingHorizontal: s(25),
    paddingTop: s(10), // Add padding top for dropdown
    flex: 1, // Ensure the view takes up remaining space
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContentContainer: {
    paddingBottom: s(120),
    paddingTop: vs(15), // Add padding top for the list
  },
  separator: {
    height: s(12),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vs(50),
    color: AppColors.n500,
  },
});
