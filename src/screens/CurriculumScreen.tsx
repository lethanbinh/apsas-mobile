import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {
  CourseElementData,
  fetchCourseElements,
} from '../api/courseElementService';
import { ViewIcon } from '../assets/icons/courses';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import AppText from '../components/texts/AppText';
import { showErrorToast, showSuccessToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { fetchClassById, ClassData } from '../api/class';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAssessmentTemplates } from '../api/assessmentTemplateService';
import { getFilesForTemplate, AssessmentFileData } from '../api/assessmentFileService';

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

const CurriculumScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const semesterCourseId = (route.params as { semesterCourseId?: string })
    ?.semesterCourseId;
  const classId = (route.params as { classId?: string | number })?.classId;

  const [isLoading, setIsLoading] = useState(true);
  const [courseElements, setCourseElements] = useState<CourseElementData[]>([]);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isMounted, setIsMounted] = useState(true);

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

      if (!selectedClassId) {
        if (isMounted) {
      setIsLoading(false);
          showErrorToast('Error', 'No class selected. Please select a class first.');
        }
      return;
    }

      if (!isMounted) return;
      setIsLoading(true);

      try {
        // 1) Get class info to find semesterCourseId
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
        
        if (!classInfo.semesterCourseId) {
          if (isMounted) {
            setCourseElements([]);
            setIsLoading(false);
          }
          return;
        }
        
        const semesterCourseIdNum = parseInt(String(classInfo.semesterCourseId), 10);
        if (isNaN(semesterCourseIdNum)) {
          if (isMounted) {
            setCourseElements([]);
            setIsLoading(false);
          }
          return;
        }

        // 2) Get all course elements and filter by this class's semesterCourseId
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
  }, [classId]);

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'This app needs access to your storage to download files.',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to download files.',
      );
      return;
    }
    const sampleFileUrl =
      fileUrl ||
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const { dirs } = ReactNativeBlobUtil.fs;
    const dirToSave =
      Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
    const config = {
      fileCache: true,
      path: `${dirToSave}/${fileName}`,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: `${dirToSave}/${fileName}`,
        description: 'Downloading file.',
      },
    };

    ReactNativeBlobUtil.config(config)
      .fetch('GET', sampleFileUrl)
      .then(res => {
        if (Platform.OS === 'ios') {
          ReactNativeBlobUtil.ios.previewDocument(res.path());
        }
        Alert.alert(
          'Download Complete',
          `${fileName} has been saved to your Downloads folder.`,
        );
      })
      .catch(error => {
        console.error(error);
        Alert.alert(
          'Download Error',
          'An error occurred while downloading the file.',
        );
      });
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
      .map((item, index) => {
        try {
          return {
            id: String(item.id),
      number: `0${index + 1}`,
            title: item.name || 'Untitled',
            linkFile: item.description || '',
      rightIcon: ViewIcon,
      detailNavigation: 'AssignmentDetailScreen',
      onAction: () => {
              try {
                if (item.id && classData?.id) {
                  navigation.navigate('AssignmentDetailScreen', {
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
          };
        } catch (err) {
          console.error('Error mapping assignment:', err);
          return null;
        }
      })
      .filter((item): item is any => item !== null);

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
      .map((item, index) => {
        try {
          return {
            id: String(item.id),
      number: `0${index + 1}`,
            title: item.name || 'Untitled',
            linkFile: item.description || '',
      rightIcon: ViewIcon,
      detailNavigation: 'AssignmentDetailScreen',
      onAction: () => {
              try {
                if (item.id && classData?.id) {
                  navigation.navigate('AssignmentDetailScreen', {
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
          };
        } catch (err) {
          console.error('Error mapping lab:', err);
          return null;
        }
      })
      .filter((item): item is any => item !== null);

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
      .map((item, index) => {
        try {
          return {
            id: String(item.id),
            number: `0${index + 1}`,
            title: item.name || 'Untitled',
            linkFile: item.description || '',
            rightIcon: ViewIcon,
            detailNavigation: 'PracticalExamDetailScreen',
            onAction: () => {
              try {
                if (item.id && classData?.id) {
                  navigation.navigate('PracticalExamDetailScreen', {
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
          };
        } catch (err) {
          console.error('Error mapping practical exam:', err);
          return null;
        }
      })
      .filter((item): item is any => item !== null);

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
      }
    } catch (err) {
      console.error('Error navigating to section:', err);
      showErrorToast('Error', 'Failed to navigate.');
    }
  };

  const handleDownloadAllMaterials = async () => {
    const allItems = [...assignments, ...labs, ...practicalExams];
    
    if (allItems.length === 0) {
      showErrorToast('Error', 'No materials to download.');
      return;
    }

    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download files.',
        );
        return;
      }

      Alert.alert(
        'Download All Materials',
        `Download materials for ${allItems.length} item(s)?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                const { dirs } = ReactNativeBlobUtil.fs;
                const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
                let downloadedCount = 0;
                let failedCount = 0;

                // Fetch templates and files for each course element
                for (const item of allItems) {
                  try {
                    // Find template for this course element
                    const templatesResponse = await fetchAssessmentTemplates({
                      pageNumber: 1,
                      pageSize: 1000,
                    });
                    const template = (templatesResponse?.items || []).find(
                      t => t && t.courseElementId === Number(item.id),
                    );

                    if (template && template.id) {
                      // Fetch files for this template
                      try {
                        const filesResponse = await getFilesForTemplate({
                          assessmentTemplateId: template.id,
                          pageNumber: 1,
                          pageSize: 100,
                        });
                        const files = filesResponse?.items || [];

                        // Download requirement files (fileTemplate === 0)
                        for (const file of files) {
                          if (file.fileTemplate === 0 && file.fileUrl) {
                            try {
                              const fileName = file.name || `material_${file.id}`;
                              const path = `${dirToSave}/${fileName}`;

                              await ReactNativeBlobUtil.config({
                                fileCache: true,
                                path: path,
                                addAndroidDownloads: {
                                  useDownloadManager: true,
                                  notification: true,
                                  title: fileName,
                                  description: 'Downloading material file...',
                                  path: path,
                                  mediaScannable: true,
                                },
                              }).fetch('GET', file.fileUrl);

                              if (Platform.OS === 'android') {
                                await ReactNativeBlobUtil.android.addCompleteDownload({
                                  title: fileName,
                                  description: 'Download complete',
                                  path: path,
                                  showNotification: true,
                                });
                              }
                              downloadedCount++;
                            } catch (fileErr) {
                              console.error(`Failed to download file ${file.name}:`, fileErr);
                              failedCount++;
                            }
                          }
                        }
                      } catch (filesErr) {
                        // Template has no files, skip
                        console.log(`No files found for template ${template.id}`);
                      }
                    }
                  } catch (itemErr) {
                    console.error(`Failed to process item ${item.id}:`, itemErr);
                    failedCount++;
                  }
                }

                if (downloadedCount > 0) {
                  showSuccessToast('Success', `Downloaded ${downloadedCount} material file(s).`);
                }
                if (failedCount > 0) {
                  showErrorToast('Warning', `Failed to download ${failedCount} file(s).`);
                }
                if (downloadedCount === 0 && failedCount === 0) {
                  showErrorToast('Info', 'No material files found to download.');
                }
              } catch (error: any) {
                console.error('Download error:', error);
                showErrorToast('Error', 'Failed to download materials.');
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
        <ActivityIndicator size="large" />
      </AppSafeView>
    );
  }

  return (
    <AppSafeView style={styles.container}>
      <ScreenHeader title="Curriculum" />
      {courseElements.length > 0 ? (
        <CurriculumList
          sections={sections.filter(sec => sec.data.length > 0)}
          scrollEnabled={true}
          onSectionButtonPress={handleSectionButtonPress}
          onDownloadAll={handleDownloadAllMaterials}
          isDownloadable={true}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <AppText style={styles.emptyText}>
            No curriculum elements found for this class.
          </AppText>
        </View>
      )}
    </AppSafeView>
  );
};

export default CurriculumScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
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
