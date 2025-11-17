import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import AssignmentCardInfo from '../components/courses/AssignmentCardInfo';
import CurriculumList from '../components/courses/CurriculumList';
import { AppColors } from '../styles/color';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import { showErrorToast } from '../components/toasts/AppToast';
import { RootState } from '../store/store';
import AppText from '../components/texts/AppText';
import {
  CourseElementData,
  fetchCourseElementById,
} from '../api/courseElementService';
import {
  AssessmentTemplateData,
  fetchAssessmentTemplates,
} from '../api/assessmentTemplateService';
import { getSubmissionList, Submission } from '../api/submissionService';
import { getClassAssessments, ClassAssessment } from '../api/classAssessmentService';
import { getFilesForTemplate, FileTemplate, AssessmentFileData } from '../api/assessmentFileService';
import { ViewIcon, DownloadIcon } from '../assets/icons/courses';
import { useGetCurrentStudentId } from '../hooks/useGetCurrentStudentId';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

const PracticalExamDetailScreen = () => {
  const [listHeight, setListHeight] = useState(0);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const elementId = (route.params as { elementId?: string })?.elementId;
  const classId = (route.params as { classId?: string | number })?.classId;

  const [elementData, setElementData] = useState<CourseElementData | null>(null);
  const [templateData, setTemplateData] = useState<AssessmentTemplateData | null>(null);
  const [classAssessment, setClassAssessment] = useState<ClassAssessment | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<Submission | null>(null);
  const [assessmentFiles, setAssessmentFiles] = useState<AssessmentFileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [deadline, setDeadline] = useState<string>('N/A');
  const userProfile = useSelector((state: RootState) => state.userSlice.profile);
  const { studentId } = useGetCurrentStudentId();

  useEffect(() => {
    setIsMounted(true);

    if (!elementId) {
      if (isMounted) {
        showErrorToast('Error', 'No Exam ID provided.');
        setIsLoading(false);
      }
      return;
    }

    const loadElementDetails = async () => {
      if (!isMounted) return;
      setIsLoading(true);

      try {
        // Fetch course element
        const data = await fetchCourseElementById(elementId);
        if (!isMounted) return;
        setElementData(data);

        // Set deadline from semester end date
        if (data.semesterCourse?.semester?.endDate) {
          setDeadline(dayjs(data.semesterCourse.semester.endDate).format('DD/MM/YYYY'));
        }

        // Fetch assessment templates
        const templatesResponse = await fetchAssessmentTemplates({
          pageNumber: 1,
          pageSize: 1000,
        });
        if (!isMounted) return;

        const foundTemplate = (templatesResponse?.items || []).find(
          t => t && t.courseElementId === Number(elementId),
        );
        if (!isMounted) return;
        setTemplateData(foundTemplate || null);

        // Fetch assessment files (requirement and database files)
        if (foundTemplate && foundTemplate.id) {
          try {
            const filesResponse = await getFilesForTemplate({
              assessmentTemplateId: foundTemplate.id,
              pageNumber: 1,
              pageSize: 100,
            });
            if (!isMounted) return;
            setAssessmentFiles(filesResponse?.items || []);
          } catch (err) {
            console.error('Failed to fetch assessment files:', err);
            if (!isMounted) return;
            setAssessmentFiles([]);
          }
        }

        // Fetch class assessment to get deadline
        if (classId) {
          try {
            const classIdNum = Number(classId);
            if (!isNaN(classIdNum)) {
              // Fetch all class assessments for this class
              const classAssessmentsRes = await getClassAssessments({
                classId: classIdNum,
                pageNumber: 1,
                pageSize: 1000,
              });
              if (!isMounted) return;
              
              const elementIdNum = Number(elementId);
              console.log('Fetching class assessments for classId:', classIdNum, 'elementId:', elementIdNum);
              console.log('Class assessments found:', classAssessmentsRes?.items?.length || 0);
              
              // Find assessment that matches this course element
              const relevantAssessment = (classAssessmentsRes?.items || []).find(
                ca => ca && ca.id && ca.courseElementId === elementIdNum,
              );
              
              console.log('Relevant assessment found:', relevantAssessment ? {
                id: relevantAssessment.id,
                courseElementId: relevantAssessment.courseElementId,
                endAt: relevantAssessment.endAt,
                lecturerName: relevantAssessment.lecturerName
              } : 'Not found');
              
              if (relevantAssessment && relevantAssessment.id) {
                setClassAssessment(relevantAssessment);
                
                // Set deadline from class assessment
                if (relevantAssessment.endAt) {
                  try {
                    const date = dayjs(relevantAssessment.endAt);
                    const formatted = date.isValid() ? date.format('YYYY-MM-DD HH:mm') : 'N/A';
                    setDeadline(formatted);
                    console.log('Deadline set from classAssessment:', formatted);
                  } catch (err) {
                    console.error('Error formatting deadline:', err);
                    setDeadline('N/A');
                  }
                } else {
                  console.log('No endAt in relevantAssessment, using fallback');
                  // Fallback to semester end date
                  if (data.semesterCourse?.semester?.endDate) {
                    try {
                      const fallback = dayjs(data.semesterCourse.semester.endDate).format('DD/MM/YYYY');
                      setDeadline(fallback);
                      console.log('Deadline set from semester endDate (no endAt):', fallback);
                    } catch {
                      setDeadline('N/A');
                    }
                  } else {
                    setDeadline('N/A');
                  }
                }

                // Fetch latest submission for this student
                if (studentId) {
                  try {
                    const submissions = await getSubmissionList({
                      classAssessmentId: relevantAssessment.id,
                      studentId: Number(studentId),
                    });
                    if (!isMounted) return;
                    
                    if (submissions && Array.isArray(submissions)) {
                      const sorted = submissions
                        .filter(s => s && s.id && s.submittedAt)
                        .sort((a, b) => {
                          if (!a.submittedAt || !b.submittedAt) return 0;
                          try {
                            return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
                          } catch (sortErr) {
                            return 0;
                          }
                        });
                      if (!isMounted) return;
                      if (sorted.length > 0 && sorted[0] && sorted[0].id) {
                        setLatestSubmission(sorted[0]);
                      }
                    }
                  } catch (err) {
                    console.error('Failed to fetch submissions:', err);
                  }
                }
              } else {
                console.log('No relevant assessment found for elementId:', elementIdNum);
                // Fallback: keep deadline from semester end date if already set
                if (!deadline || deadline === 'N/A') {
                  if (data.semesterCourse?.semester?.endDate) {
                    try {
                      const fallback = dayjs(data.semesterCourse.semester.endDate).format('DD/MM/YYYY');
                      setDeadline(fallback);
                      console.log('Deadline set from semester endDate (no assessment found):', fallback);
                    } catch {
                      setDeadline('N/A');
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.error('Failed to fetch class assessment:', err);
            // Fallback on error
            if (!deadline || deadline === 'N/A') {
              if (data.semesterCourse?.semester?.endDate) {
                try {
                  const fallback = dayjs(data.semesterCourse.semester.endDate).format('DD/MM/YYYY');
                  setDeadline(fallback);
                } catch {
                  setDeadline('N/A');
                }
              }
            }
          }
        } else {
          console.log('No classId provided, using fallback deadline');
          // Keep deadline from semester end date if already set
          if (!deadline || deadline === 'N/A') {
            if (data.semesterCourse?.semester?.endDate) {
              try {
                const fallback = dayjs(data.semesterCourse.semester.endDate).format('DD/MM/YYYY');
                setDeadline(fallback);
                console.log('Deadline set from semester endDate (no classId):', fallback);
              } catch {
                setDeadline('N/A');
              }
            }
          }
        }
      } catch (error: any) {
        console.error(error);
        if (isMounted) {
          showErrorToast('Error', 'Failed to load exam details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadElementDetails();

    return () => {
      setIsMounted(false);
    };
  }, [elementId, classId, studentId]);

  const navigateToScoreFeedback = () => {
    try {
      if (latestSubmission && latestSubmission.id) {
        navigation.navigate('ScoreDetailScreen', {
          submissionId: latestSubmission.id,
        });
      } else {
        showErrorToast(
          'Error',
          'No submission found. Please submit your exam first.',
        );
      }
    } catch (err) {
      console.error('Error navigating to score feedback:', err);
      showErrorToast('Error', 'Failed to open score details.');
    }
  };

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

  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download files.',
        );
        return;
      }
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
        .fetch('GET', fileUrl)
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
    } catch (error: any) {
      console.error('Download error:', error);
      showErrorToast('Error', 'Failed to download file.');
    }
  };

  // Build document list for PE (student view)
  const requirementFile = assessmentFiles.find(f => f.fileTemplate === FileTemplate.DATABASE);
  const databaseFile = assessmentFiles.find(f => f.fileTemplate === FileTemplate.TESTFILE);

  const dynamicDocumentList: any[] = [];
  let itemNumber = 1;

  // Requirement file download
  if (requirementFile) {
    dynamicDocumentList.push({
      id: itemNumber,
      number: String(itemNumber).padStart(2, '0'),
      title: requirementFile.name || 'Requirement File',
      linkFile: requirementFile.name || '',
      rightIcon: DownloadIcon,
      onPress: () => {
        if (requirementFile.fileUrl) {
          handleDownloadFile(requirementFile.fileUrl, requirementFile.name || 'requirement.pdf');
        }
      },
      onAction: () => {},
    });
    itemNumber++;
  }

  // Database file download
  if (databaseFile) {
    dynamicDocumentList.push({
      id: itemNumber,
      number: String(itemNumber).padStart(2, '0'),
      title: databaseFile.name || 'Database File',
      linkFile: databaseFile.name || '',
      rightIcon: DownloadIcon,
      onPress: () => {
        if (databaseFile.fileUrl) {
          handleDownloadFile(databaseFile.fileUrl, databaseFile.name || 'database.sql');
        }
      },
      onAction: () => {},
    });
    itemNumber++;
  }

  // View Score & Feedback button
  dynamicDocumentList.push({
    id: itemNumber,
    number: String(itemNumber).padStart(2, '0'),
    title: 'View Score & Feedback',
    linkFile: '',
    rightIcon: (props: any) => <ViewIcon {...props} />,
    onPress: navigateToScoreFeedback,
    onAction: () => {},
  });

  if (isLoading) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ScreenHeader title="Practical Exam" />
        <ActivityIndicator size="large" color={AppColors.pr500} />
      </AppSafeView>
    );
  }

  if (!elementData) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ScreenHeader title="Practical Exam" />
        <AppText style={styles.errorText}>Failed to load exam data.</AppText>
      </AppSafeView>
    );
  }

  const sections = [
    { title: 'Results', data: dynamicDocumentList },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        nestedScrollEnabled
        contentContainerStyle={{ paddingBottom: listHeight }}
      >
        <Image
          style={styles.image}
          source={require('../assets/images/assignment.png')}
        />
        <AssignmentCardInfo
          assignmentType="Practical Exam"
          assignmentTitle={elementData.name}
          dueDate={deadline}
          lecturerName={classAssessment?.lecturerName || userProfile?.fullName || 'Lecturer'}
          description={elementData.description}
          isSubmitted={!!latestSubmission}
          onSubmitPress={() => {
            try {
              if (elementData && elementData.id && classAssessment && classAssessment.id) {
                navigation.navigate('SubmissionScreen', {
                  elementId: elementData.id,
                  classAssessmentId: classAssessment.id,
                  classId: classId,
                });
              } else {
                showErrorToast('Error', 'Invalid exam data.');
              }
            } catch (err) {
              console.error('Error navigating to submission:', err);
              showErrorToast('Error', 'Failed to open submission screen.');
            }
          }}
          isAssessment={true}
          showEditButton={false}
          showAutoGrade={false}
        />
        <View />
        <View
          style={{ 
            top: elementData?.description && elementData.description.length > 200 
              ? s(170) + (Math.ceil(elementData.description.length / 150) - 1) * vs(40)
              : s(350), 
            width: '100%' 
          }}
          onLayout={e => setListHeight(e.nativeEvent.layout.height + s(100))}
        >
          <CurriculumList sections={sections} />
        </View>
      </ScrollView>
    </View>
  );
};

export default PracticalExamDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  errorText: {
    color: AppColors.n500,
    marginTop: vs(20),
  },
  image: {
    width: '100%',
  },
});
