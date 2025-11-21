import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View, Platform, Alert } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import AppSafeView from '../components/views/AppSafeView';
import {
  CourseElementData,
  fetchCourseElements,
} from '../api/courseElementService';
import { ViewIcon } from '../assets/icons/courses';
import AppText from '../components/texts/AppText';
import { showErrorToast, showSuccessToast } from '../components/toasts/AppToast';
import { AppColors } from '../styles/color';
import { fetchClassById, ClassData } from '../api/class';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to check if a course element is a Lab based on name
function isLab(element: CourseElementData): boolean {
  const name = (element.name || '').toLowerCase();
  const keywords = [
    'lab',
    'laboratory',
    'thực hành',
    'bài thực hành',
    'lab session',
    'lab work',
  ];
  return keywords.some(keyword => name.includes(keyword));
}

// Helper function to check if a course element is a Practical Exam
function isPracticalExam(element: CourseElementData): boolean {
  const name = (element.name || '').toLowerCase();
  const keywords = [
    'exam',
    'pe',
    'practical exam',
    'practical',
    'test',
    'kiểm tra thực hành',
    'thi thực hành',
    'bài thi',
    'bài kiểm tra',
  ];
  // Exclude labs from practical exams
  if (isLab(element)) {
    return false;
  }
  return keywords.some(keyword => name.includes(keyword));
}

const CurriculumTeacherScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const semesterCourseId = (route.params as { semesterCourseId?: string })
    ?.semesterCourseId;
  const classId = (route.params as { classId?: string | number })?.classId;

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [courseElements, setCourseElements] = useState<CourseElementData[]>([]);
  const [classData, setClassData] = useState<ClassData | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const loadElements = async () => {
      let selectedClassId = classId;
      
      // If no classId in params, try to get from AsyncStorage
      if (!selectedClassId) {
        try {
          const stored = await AsyncStorage.getItem('selectedClassId');
          selectedClassId = stored || null;
        } catch (err) {
          console.error('Failed to get selectedClassId from storage:', err);
        }
      }

      if (!selectedClassId && !semesterCourseId) {
        if (isMounted) {
          setIsLoading(false);
          showErrorToast('Error', 'No class or semester course selected.');
        }
        return;
      }

      if (!isMounted) return;
      setIsLoading(true);

      try {
        let targetSemesterCourseId = semesterCourseId;
        
        // If we have classId, get semesterCourseId from class
        if (selectedClassId && !targetSemesterCourseId) {
          const classInfo = await fetchClassById(selectedClassId);
          if (!isMounted) return;
          if (!classInfo || !classInfo.id) {
            if (isMounted) {
              showErrorToast('Error', 'Invalid class data.');
              setIsLoading(false);
            }
            return;
          }
          setClassData(classInfo);
          targetSemesterCourseId = classInfo.semesterCourseId?.toString();
        }
        
        if (!targetSemesterCourseId) {
          if (isMounted) {
            setCourseElements([]);
            setIsLoading(false);
          }
          return;
        }
        
        const semesterCourseIdNum = parseInt(String(targetSemesterCourseId), 10);
        if (isNaN(semesterCourseIdNum)) {
          if (isMounted) {
            setCourseElements([]);
            setIsLoading(false);
          }
          return;
        }

        // Get all course elements and filter by this class's semesterCourseId
        const allElements = await fetchCourseElements();
        if (!isMounted) return;
        
        const relevantElements = (allElements || []).filter(
          el => el && el.id && el.semesterCourseId && el.semesterCourseId.toString() === semesterCourseIdNum.toString(),
        );
        if (!isMounted) return;
        setCourseElements(relevantElements);
      } catch (error: any) {
        console.error(error);
        if (isMounted) {
          showErrorToast('Error', 'Failed to load curriculum elements.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadElements();
    return () => {
      setIsMounted(false);
    };
  }, [classId, semesterCourseId]);

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'App needs access to your storage to download files.',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Separate assignments, labs, and practical exams
  const { assignments, labs, practicalExams } = useMemo(() => {
    // Filter assignments (not labs, not PE)
    const assignmentsList = courseElements
      .filter(
        el =>
          el &&
          el.id &&
          el.name &&
          typeof el.name === 'string' &&
          !isLab(el) &&
          !isPracticalExam(el),
      )
      .map((item, index) => ({
        id: String(item.id),
        number: `0${index + 1}`,
        title: item.name || 'Untitled',
        linkFile: item.description || '',
        rightIcon: ViewIcon,
        detailNavigation: 'AssignmentDetailTeacherScreen',
        onAction: () => {
          try {
            if (item.id && classData?.id) {
              navigation.navigate('AssignmentDetailTeacherScreen', {
                elementId: String(item.id),
                classId: classData.id,
              });
            } else {
              showErrorToast('Error', 'Invalid assignment data.');
            }
          } catch (err) {
            console.error('Error navigating to assignment detail:', err);
            showErrorToast('Error', 'Failed to open assignment details.');
          }
        },
      }));

    // Filter labs
    const labsList = courseElements
      .filter(
        el =>
          el &&
          el.id &&
          el.name &&
          typeof el.name === 'string' &&
          isLab(el),
      )
      .map((item, index) => ({
        id: String(item.id),
        number: `0${index + 1}`,
        title: item.name || 'Untitled',
        linkFile: item.description || '',
        rightIcon: ViewIcon,
        detailNavigation: 'LabDetailTeacherScreen',
        onAction: () => {
          try {
            if (item.id && classData?.id) {
              navigation.navigate('LabDetailTeacherScreen', {
                elementId: String(item.id),
                classId: classData.id,
              });
            } else {
              showErrorToast('Error', 'Invalid lab data.');
            }
          } catch (err) {
            console.error('Error navigating to lab detail:', err);
            showErrorToast('Error', 'Failed to open lab details.');
          }
        },
      }));

    // Filter practical exams
    const practicalExamsList = courseElements
      .filter(
        el =>
          el &&
          el.id &&
          el.name &&
          typeof el.name === 'string' &&
          isPracticalExam(el),
      )
      .map((item, index) => ({
        id: String(item.id),
        number: `0${index + 1}`,
        title: item.name || 'Untitled',
        linkFile: item.description || '',
        rightIcon: ViewIcon,
        detailNavigation: 'PracticalExamDetailTeacherScreen',
        onAction: () => {
          try {
            if (item.id && classData?.id) {
              navigation.navigate('PracticalExamDetailTeacherScreen', {
                elementId: String(item.id),
                classId: classData.id,
              });
            } else {
              showErrorToast('Error', 'Invalid exam data.');
            }
          } catch (err) {
            console.error('Error navigating to exam detail:', err);
            showErrorToast('Error', 'Failed to open exam details.');
          }
        },
      }));

    return { assignments: assignmentsList, labs: labsList, practicalExams: practicalExamsList };
  }, [courseElements, classData, navigation]);

  // Create sections with navigation buttons like web
  const sections = useMemo(() => {
    const sectionsList: Array<{
      title: string;
      data: any[];
      sectionButton?: string;
    }> = [];

    if (assignments.length > 0) {
      sectionsList.push({
        title: 'Assignments',
        data: assignments,
        sectionButton: 'View All',
      });
    }

    if (labs.length > 0) {
      sectionsList.push({
        title: 'Labs',
        data: labs,
        sectionButton: 'View All',
      });
    }

    if (practicalExams.length > 0) {
      sectionsList.push({
        title: 'Practical Exams',
        data: practicalExams,
        sectionButton: 'View All',
      });
    }

    // Add Grading Group section
    sectionsList.push({
      title: 'Grading Group',
      data: [],
      sectionButton: 'View All',
    });

    return sectionsList;
  }, [assignments, labs, practicalExams]);

  const handleSectionButtonPress = (sectionTitle: string) => {
    try {
      if (!classData?.id) {
        showErrorToast('Error', 'No class selected.');
        return;
      }

      if (sectionTitle === 'Assignments' || sectionTitle === 'Assignments_secondary') {
        navigation.navigate('AssignmentListScreen', {
          classId: classData.id,
        });
      } else if (sectionTitle === 'Labs' || sectionTitle === 'Labs_secondary') {
        navigation.navigate('LabListScreen', {
          classId: classData.id,
        });
      } else if (sectionTitle === 'Practical Exams' || sectionTitle === 'Practical Exams_secondary') {
        navigation.navigate('PracticalExamListScreen', {
          classId: classData.id,
        });
      } else if (sectionTitle === 'Grading Group' || sectionTitle === 'Grading Group_secondary') {
        navigation.navigate('MyGradingGroupScreen');
      }
    } catch (err) {
      console.error('Error navigating to section:', err);
      showErrorToast('Error', 'Failed to navigate.');
    }
  };

  const handleDownloadAllMaterials = async () => {
    const allItems = [...assignments, ...practicalExams];
    
    if (allItems.length === 0) {
      showErrorToast('Error', 'No materials to download.');
      return;
    }

    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        showErrorToast('Permission Denied', 'Storage permission is required to download.');
        return;
      }

      Alert.alert(
        'Download All Materials',
        `Download ${allItems.length} material file(s)?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                const { dirs } = RNBlobUtil.fs;
                const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
                const sampleFileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

                for (const item of allItems) {
                  const fileName = `${item.title.replace(/[^a-z0-9]/gi, '_')}.pdf` || `material_${item.id}.pdf`;
                  const path = `${dirToSave}/${fileName}`;

                  await RNBlobUtil.config({
                    fileCache: true,
                    path: path,
                    addAndroidDownloads: {
                      useDownloadManager: true,
                      notification: true,
                      title: fileName,
                      description: 'Downloading material file...',
                      mime: 'application/pdf',
                      path: path,
                      mediaScannable: true,
                    },
                  }).fetch('GET', sampleFileUrl);

                  if (Platform.OS === 'android') {
                    await RNBlobUtil.android.addCompleteDownload({
                      title: fileName,
                      description: 'Download complete',
                      mime: 'application/pdf',
                      path: path,
                      showNotification: true,
                    });
                  }
                }
                showSuccessToast('Success', 'All materials downloaded successfully.');
              } catch (error: any) {
                console.error('Download error:', error);
                showErrorToast('Error', 'Failed to download some materials.');
              }
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('Download error:', error);
      showErrorToast('Error', 'Failed to download materials.');
    }
  };

  if (isLoading) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.pr500} />
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader title="Curriculum" />
      {courseElements.length > 0 ? (
        <CurriculumList
          sections={sections.filter(sec => sec.data.length > 0)}
          scrollEnabled={true}
          onSectionButtonPress={handleSectionButtonPress}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <AppText style={styles.emptyText}>
            No curriculum elements found for this course.
          </AppText>
        </View>
      )}
    </AppSafeView>
  );
};

export default CurriculumTeacherScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  emptyText: {
    textAlign: 'center',
    color: AppColors.n500,
  },
});
