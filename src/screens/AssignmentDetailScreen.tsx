import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {
  AssessmentTemplateData,
  fetchAssessmentTemplates,
} from '../api/assessmentTemplateService';
import {
  CourseElementData,
  fetchCourseElementById,
} from '../api/courseElementService';
import { getClassAssessments, ClassAssessment } from '../api/classAssessmentService';
import { getSubmissionList, Submission } from '../api/submissionService';
import { getFilesForTemplate, FileTemplate, AssessmentFileData } from '../api/assessmentFileService';
import ScreenHeader from '../components/common/ScreenHeader';
import AssignmentCardInfo from '../components/courses/AssignmentCardInfo';
import CurriculumList from '../components/courses/CurriculumList';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { RootState } from '../store/store';
import { AppColors } from '../styles/color';
import { useGetCurrentStudentId } from '../hooks/useGetCurrentStudentId';
import { ViewIcon, DownloadIcon } from '../assets/icons/courses';

const AssignmentDetailScreen = () => {
  const [listHeight, setListHeight] = useState(0);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const elementId = (route.params as { elementId?: string })?.elementId;
  const classId = (route.params as { classId?: string | number })?.classId;

  const [elementData, setElementData] = useState<CourseElementData | null>(
    null,
  );
  const [templateData, setTemplateData] =
    useState<AssessmentTemplateData | null>(null);
  const [classAssessment, setClassAssessment] = useState<ClassAssessment | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<Submission | null>(null);
  const [assessmentFiles, setAssessmentFiles] = useState<AssessmentFileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const userProfile = useSelector(
    (state: RootState) => state.userSlice.profile,
  );
  const { studentId } = useGetCurrentStudentId();

  useEffect(() => {
    setIsMounted(true);
    if (!elementId) {
      if (isMounted) {
        showErrorToast('Error', 'No Assignment ID provided.');
        setIsLoading(false);
      }
      return;
    }
    const loadDetails = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        const element = await fetchCourseElementById(elementId);
        if (!isMounted) return;
        if (!element || !element.id) {
          if (isMounted) {
            showErrorToast('Error', 'Invalid assignment data.');
            setIsLoading(false);
          }
          return;
        }
        setElementData(element);

        const templatesResponse = await fetchAssessmentTemplates({
          pageNumber: 1,
          pageSize: 1000,
        });
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
        if (classId && foundTemplate && foundTemplate.id) {
          try {
            const classIdNum = Number(classId);
            if (isNaN(classIdNum)) {
              console.error('Invalid classId:', classId);
            } else {
              const classAssessmentsRes = await getClassAssessments({
                classId: classIdNum,
                assessmentTemplateId: foundTemplate.id,
                pageNumber: 1,
                pageSize: 1000,
              });
              if (!isMounted) return;
              
              const elementIdNum = Number(elementId);
              const relevantAssessment = (classAssessmentsRes?.items || []).find(
                ca => ca && ca.id && ca.courseElementId === elementIdNum,
              );
              
              if (relevantAssessment && relevantAssessment.id) {
                setClassAssessment(relevantAssessment);

                // Fetch latest submission for this student
                if (studentId) {
                  try {
                    const submissions = await getSubmissionList({
                      classAssessmentId: relevantAssessment.id,
                      studentId: Number(studentId),
                    });
                    if (!isMounted) return;
                    
                    if (submissions && Array.isArray(submissions) && submissions.length > 0) {
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
              }
            }
          } catch (err) {
            console.error('Failed to fetch class assessment:', err);
          }
        }
      } catch (error: any) {
        if (isMounted) {
          showErrorToast('Error', 'Failed to load assignment details.');
          console.error(error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadDetails();
    return () => {
      setIsMounted(false);
    };
  }, [elementId, classId, studentId]);

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

  const navigateToRequirement = () => {
    try {
      if (templateData && templateData.id) {
        navigation.navigate('RequirementScreen', {
          assessmentTemplate: templateData,
        });
      } else {
        showErrorToast(
          'Error',
          'No requirement details found for this assignment.',
        );
      }
    } catch (err) {
      console.error('Error navigating to requirement:', err);
      showErrorToast('Error', 'Failed to open requirement details.');
    }
  };

  const navigateToScoreFeedback = () => {
    try {
      if (latestSubmission && latestSubmission.id) {
        navigation.navigate('ScoreDetailScreen', {
          submissionId: latestSubmission.id,
        });
      } else {
        showErrorToast(
          'Error',
          'No submission found. Please submit your assignment first.',
        );
      }
    } catch (err) {
      console.error('Error navigating to score feedback:', err);
      showErrorToast('Error', 'Failed to open score details.');
    }
  };

  // Build document list with requirement files
  const requirementFile = assessmentFiles.find(f => f.fileTemplate === FileTemplate.DATABASE);
  const databaseFile = assessmentFiles.find(f => f.fileTemplate === FileTemplate.TESTFILE);

  const dynamicDocumentList: any[] = [];
  let itemNumber = 1;

  // View Requirement Details button
  dynamicDocumentList.push({
    id: itemNumber,
    number: String(itemNumber).padStart(2, '0'),
    title: 'View Requirement Details',
    linkFile: '',
    rightIcon: ViewIcon,
    onPress: navigateToRequirement,
    onAction: () => {},
  });
  itemNumber++;

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
    rightIcon: ViewIcon,
    onPress: navigateToScoreFeedback,
    onAction: () => {},
  });

  // Build submission list dynamically
  const submissionListData = latestSubmission && latestSubmission.id
    ? [
        {
          id: latestSubmission.id,
          number: '01',
          title: 'Your Submission',
          linkFile: latestSubmission.submissionFile?.name || 'submission.zip',
          rightIcon: ViewIcon,
          detailNavigation: 'ScoreDetailScreen',
          onAction: () => {
            try {
              if (latestSubmission && latestSubmission.id) {
                navigation.navigate('ScoreDetailScreen', {
                  submissionId: latestSubmission.id,
                });
              }
            } catch (err) {
              console.error('Error navigating to score detail:', err);
              showErrorToast('Error', 'Failed to open score details.');
            }
          },
        },
      ]
    : [];

  const sections = [
    { title: 'Documents', data: dynamicDocumentList },
    ...(submissionListData.length > 0 ? [{ title: 'Your Submission', data: submissionListData }] : []),
  ];

  if (isLoading) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </AppSafeView>
    );
  }

  if (!elementData) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ScreenHeader title="Assignment Detail" />
        <AppText style={styles.errorText}>
          Failed to load assignment data.
        </AppText>
      </AppSafeView>
    );
  }
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
          assignmentType="Assignment"
          assignmentTitle={elementData.name}
          dueDate={classAssessment?.endAt ? (() => {
            try {
              const date = dayjs(classAssessment.endAt);
              return date.isValid() ? date.format('YYYY-MM-DD HH:mm') : 'N/A';
            } catch {
              return 'N/A';
            }
          })() : 'N/A'}
          lecturerName={classAssessment?.lecturerName || userProfile?.fullName || 'Lecturer'}
          description={elementData.description}
          isSubmitted={!!latestSubmission}
          onSubmitPress={() => {
            try {
              if (elementData && elementData.id) {
                navigation.navigate('SubmissionScreen', {
                  elementId: elementData.id,
                  classAssessmentId: classAssessment?.id,
                });
              } else {
                showErrorToast('Error', 'Invalid assignment data.');
              }
            } catch (err) {
              console.error('Error navigating to submission:', err);
              showErrorToast('Error', 'Failed to open submission screen.');
            }
          }}
          isAssessment={false}
        />
        <View />
        <View
          style={{ 
            top: elementData?.description && elementData.description.length > 200 
              ? s(180) + (Math.ceil(elementData.description.length / 150) - 1) * vs(30)
              : s(100), 
          }}
          onLayout={e => setListHeight(e.nativeEvent.layout.height + s(100))}
        >
          <CurriculumList sections={sections} />
        </View>
      </ScrollView>
    </View>
  );
};

export default AssignmentDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.white },
  scrollView: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  errorText: { color: AppColors.n500, marginTop: vs(20), textAlign: 'center' },
  image: { width: '100%' },
});
