import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { s, vs } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import {
  AssessmentTemplateData,
  fetchAssessmentTemplates,
} from '../api/assessmentTemplateService';
import { getClassAssessments, updateClassAssessment, createClassAssessment } from '../api/classAssessmentService';
import {
  CourseElementData,
  fetchCourseElementById,
} from '../api/courseElementService';
import { getGradingGroups } from '../api/gradingGroupService';
import { gradingService } from '../api/gradingService';
import { getSubmissionList, Submission } from '../api/submissionService';
import { DownloadIcon, ViewIcon } from '../assets/icons/courses';
import ScreenHeader from '../components/common/ScreenHeader';
import AssignmentCardInfo from '../components/courses/AssignmentCardInfo';
import CurriculumList from '../components/courses/CurriculumList';
import AppText from '../components/texts/AppText';
import { showErrorToast, showSuccessToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { RootState } from '../store/store';
import { AppColors } from '../styles/color';

interface SubmissionItem {
  id: number;
  number: string;
  title: string;
  linkFile: string;
  rightIcon: (props: any) => React.ReactElement;
  detailNavigation?: string;
  onAction: () => void;
  onPress?: () => void;
}

const LabDetailTeacherScreen = () => {
  const [listHeight, setListHeight] = useState(0);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const elementId = (route.params as { elementId?: string })?.elementId;
  const [elementData, setElementData] = useState<CourseElementData | null>(
    null,
  );
  const [templateData, setTemplateData] =
    useState<AssessmentTemplateData | null>(null);
  const [dynamicDocumentList, setDynamicDocumentList] = useState<any[]>([]);
  const [submissionList, setSubmissionList] = useState<SubmissionItem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classAssessment, setClassAssessment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [deadline, setDeadline] = useState<string>('N/A');
  const [batchGradingLoading, setBatchGradingLoading] = useState(false);
  const userProfile = useSelector(
    (state: RootState) => state.userSlice.profile,
  );

  useEffect(() => {
    setIsMounted(true);

    if (!elementId) {
      if (isMounted) {
        showErrorToast('Error', 'No Lab ID provided.');
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

        // Set deadline from semester end date or use a default
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
          t => t.courseElementId === Number(elementId),
        );
        setTemplateData(foundTemplate || null);

        // Fetch class assessment to get deadline and lecturer name
        try {
          const classAssessmentsRes = await getClassAssessments({
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
            
            // Set deadline from class assessment
            if (relevantAssessment.endAt) {
              try {
                const date = dayjs.utc(relevantAssessment.endAt).tz('Asia/Ho_Chi_Minh');
                const formatted = date.isValid() ? date.format('YYYY-MM-DD HH:mm') : 'N/A';
                setDeadline(formatted);
              } catch (err) {
                console.error('Error formatting deadline:', err);
                setDeadline('N/A');
              }
            } else if (data.semesterCourse?.semester?.endDate) {
              const fallback = dayjs(data.semesterCourse.semester.endDate).format('DD/MM/YYYY');
              setDeadline(fallback);
            }
          }
        } catch (err) {
          console.error('Failed to fetch class assessment:', err);
        }

        // Fetch submissions
        await fetchSubmissions(Number(elementId), foundTemplate?.id);
      } catch (error: any) {
        console.error('Failed to load lab details:', error);
        if (isMounted) {
          showErrorToast('Error', 'Failed to load lab details.');
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
  }, [elementId, navigation]);

  const fetchSubmissions = async (courseElementId: number, templateId?: number) => {
    try {
      let allSubmissions: Submission[] = [];

      // Try to fetch from grading groups
      if (templateId) {
        try {
          const gradingGroups = await getGradingGroups({});
          const relevantGroups = gradingGroups.filter(
            g => g.assessmentTemplateId === templateId,
          );

          for (const group of relevantGroups) {
            const groupSubmissions = await getSubmissionList({
              gradingGroupId: group.id,
            });
            allSubmissions = [...allSubmissions, ...groupSubmissions];
          }
        } catch (err) {
          console.error('Failed to fetch from grading groups:', err);
        }
      }

      // Try to fetch from class assessments
      try {
        const classAssessmentsRes = await getClassAssessments({
          pageNumber: 1,
          pageSize: 1000,
        });
        const relevantAssessments = (classAssessmentsRes?.items || []).filter(
          ca => ca && ca.courseElementId === courseElementId,
        );

        for (const assessment of relevantAssessments) {
          try {
            const assessmentSubmissions = await getSubmissionList({
              classAssessmentId: assessment.id,
            });
            allSubmissions = [...allSubmissions, ...assessmentSubmissions];
          } catch (err) {
            console.error(`Failed to fetch submissions for assessment ${assessment.id}:`, err);
          }
        }
      } catch (err) {
        console.error('Failed to fetch from class assessments:', err);
      }

      // Get latest submission per student
      const studentSubmissions = new Map<number, Submission>();
      for (const sub of allSubmissions) {
        if (!sub || !sub.studentId || !sub.submittedAt) continue;
        const existing = studentSubmissions.get(sub.studentId);
        if (
          !existing ||
          (existing.submittedAt && new Date(sub.submittedAt).getTime() < new Date(sub.submittedAt).getTime())
        ) {
          studentSubmissions.set(sub.studentId, sub);
        }
      }
      const uniqueSubmissions = Array.from(studentSubmissions.values())
        .filter(s => s && s.submittedAt)
        .sort(
          (a, b) => {
            if (!a.submittedAt || !b.submittedAt) return 0;
            return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
          }
        );

      if (!isMounted) return;
      setSubmissions(uniqueSubmissions);

      // Convert to submission list items
      const submissionItems: SubmissionItem[] = uniqueSubmissions
        .filter(sub => sub && sub.id)
        .map((sub, index) => ({
          id: sub.id,
          number: String(index + 1).padStart(2, '0'),
          title: `${sub.studentName || 'Unknown'} (${sub.studentCode || 'N/A'})`,
          linkFile: sub.submissionFile?.name || 'No file',
          rightIcon: sub.submissionFile ? DownloadIcon : ViewIcon,
          onAction: () => {
            if (sub.submissionFile) {
              handleDownloadFile(sub.submissionFile, sub);
            }
          },
          onPress: () => {
            if (sub?.id) {
              navigation.navigate('AssignmentGradingScreen', {
                submissionId: Number(sub.id),
              });
            }
          },
        }));

      if (!isMounted) return;
      setSubmissionList(submissionItems);
    } catch (error: any) {
      console.error('Failed to fetch submissions:', error);
      if (isMounted) {
        showErrorToast('Error', 'Failed to load submissions.');
      }
    }
  };

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

  const handleDownloadFile = async (file: { id: number; name: string; submissionUrl: string }, submission: Submission | null) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        showErrorToast('Permission Denied', 'Storage permission is required to download.');
        return;
      }

      const fileName = file.name || `submission_${submission?.id || file.id}.zip`;
      const { dirs } = RNBlobUtil.fs;
      const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const path = `${dirToSave}/${fileName}`;

      Alert.alert('Starting Download', `Downloading ${fileName}...`);

      RNBlobUtil.config({
        fileCache: true,
        path: path,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'Downloading submission file...',
          mime: 'application/zip',
          path: path,
          mediaScannable: true,
        },
      })
        .fetch('GET', file.submissionUrl)
        .then(res => {
          if (Platform.OS === 'ios') {
            RNBlobUtil.ios.previewDocument(res.path());
          } else {
            RNBlobUtil.android.addCompleteDownload({
              title: fileName,
              description: 'Download complete',
              mime: 'application/zip',
              path: path,
              showNotification: true,
            });
          }
          showSuccessToast('Download Complete', `${fileName} has been saved.`);
        })
        .catch(error => {
          console.error('Download error:', error);
          showErrorToast('Download Error', 'An error occurred while downloading the file.');
        });
    } catch (error: any) {
      console.error('Download error:', error);
      showErrorToast('Error', error.message || 'Failed to download file.');
    }
  };

  const handleDownloadAllSubmissions = async () => {
    const submissionsToDownload = submissions.length > 0 ? submissions : [];

    if (submissionsToDownload.length === 0) {
      showErrorToast('Error', 'No submissions to download.');
      return;
    }

    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        showErrorToast('Permission Denied', 'Storage permission is required to download.');
        return;
      }

      Alert.alert(
        'Download All Submissions',
        `Download ${submissionsToDownload.length} submission file(s)?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                for (const submission of submissionsToDownload) {
                  if (submission.submissionFile?.submissionUrl) {
                    const fileName = submission.submissionFile.name || `submission_${submission.id}.zip`;
                    const { dirs } = RNBlobUtil.fs;
                    const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
                    const path = `${dirToSave}/${fileName}`;

                    await RNBlobUtil.config({
                      fileCache: true,
                      path: path,
                      addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        title: fileName,
                        description: 'Downloading submission file...',
                        mime: 'application/zip',
                        path: path,
                        mediaScannable: true,
                      },
                    }).fetch('GET', submission.submissionFile.submissionUrl);

                    if (Platform.OS === 'android') {
                      await RNBlobUtil.android.addCompleteDownload({
                        title: fileName,
                        description: 'Download complete',
                        mime: 'application/zip',
                        path: path,
                        showNotification: true,
                      });
                    }
                  }
                }
                showSuccessToast('Success', 'All submissions downloaded successfully.');
              } catch (error: any) {
                console.error('Download error:', error);
                showErrorToast('Error', 'Failed to download some submissions.');
              }
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('Download error:', error);
      showErrorToast('Error', 'Failed to download submissions.');
    }
  };

  const handleDeadlineChange = async (newDeadline: string) => {
    if (!elementId) {
      showErrorToast('Error', 'No lab ID provided.');
      return;
    }

    try {
      let deadlineDate: dayjs.Dayjs;
      
      if (newDeadline.includes('/')) {
        deadlineDate = dayjs(newDeadline, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh');
      } else if (newDeadline.includes('-') && newDeadline.includes(':')) {
        deadlineDate = dayjs.tz(newDeadline, 'YYYY-MM-DD HH:mm', 'Asia/Ho_Chi_Minh');
      } else {
        deadlineDate = dayjs(newDeadline);
      }

      if (!deadlineDate.isValid()) {
        showErrorToast('Error', 'Invalid date format.');
        return;
      }

      const utcDeadline = deadlineDate.utc().toISOString();

      if (classAssessment && classAssessment.id) {
        await updateClassAssessment(classAssessment.id, {
          classId: classAssessment.classId,
          assessmentTemplateId: classAssessment.assessmentTemplateId,
          startAt: classAssessment.startAt || dayjs().toISOString(),
          endAt: utcDeadline,
        });
        showSuccessToast('Success', 'Deadline updated successfully.');
      } else if (templateData && templateData.id) {
        const classId = await AsyncStorage.getItem('selectedClassId');
        if (!classId) {
          showErrorToast('Error', 'Cannot find class ID. Please select a class first.');
          return;
        }

        await createClassAssessment({
          classId: Number(classId),
          assessmentTemplateId: templateData.id,
          startAt: dayjs().toISOString(),
          endAt: utcDeadline,
        });
        showSuccessToast('Success', 'Deadline created successfully.');
      } else {
        showErrorToast(
          'Error',
          'This lab does not have an assessment template. Please create a template first to set the deadline.',
        );
        return;
      }

      const formattedDeadline = deadlineDate.format('YYYY-MM-DD HH:mm');
      setDeadline(formattedDeadline);
      
      if (elementId) {
        const data = await fetchCourseElementById(elementId);
        if (isMounted) {
          setElementData(data);
        }
        
        const classAssessmentsRes = await getClassAssessments({
          pageNumber: 1,
          pageSize: 1000,
        });
        const elementIdNum = Number(elementId);
        const relevantAssessment = (classAssessmentsRes?.items || []).find(
          ca => ca && ca.id && ca.courseElementId === elementIdNum,
        );
        if (isMounted && relevantAssessment) {
          setClassAssessment(relevantAssessment);
          if (relevantAssessment.endAt) {
            const date = dayjs.utc(relevantAssessment.endAt).tz('Asia/Ho_Chi_Minh');
            const formatted = date.isValid() ? date.format('YYYY-MM-DD HH:mm') : 'N/A';
            setDeadline(formatted);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to update deadline:', error);
      showErrorToast('Error', error.message || 'Failed to update deadline.');
    }
  };

  const handleBatchGrading = async () => {
    if (submissions.length === 0) {
      showErrorToast('Warning', 'No submissions to grade');
      return;
    }

    const assessmentTemplateId = templateData?.id || classAssessment?.assessmentTemplateId;
    if (!assessmentTemplateId) {
      showErrorToast('Error', 'Cannot find assessment template. Please contact administrator.');
      return;
    }

    try {
      setBatchGradingLoading(true);
      showSuccessToast('Info', `Starting batch grading for ${submissions.length} submission(s)...`);

      const gradingPromises = submissions.map(async (submission) => {
        try {
          await gradingService.autoGrading({
            submissionId: submission.id,
            assessmentTemplateId: assessmentTemplateId,
          });
          return { success: true, submissionId: submission.id };
        } catch (err: any) {
          console.error(`Failed to grade submission ${submission.id}:`, err);
          return { success: false, submissionId: submission.id, error: err.message };
        }
      });

      const results = await Promise.all(gradingPromises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      setBatchGradingLoading(false);

      if (successCount > 0) {
        showSuccessToast('Success', `Batch grading started for ${successCount}/${submissions.length} submission(s)`);
      }
      if (failCount > 0) {
        showErrorToast('Warning', `Failed to start grading for ${failCount} submission(s)`);
      }
    } catch (err: any) {
      console.error('Failed to start batch grading:', err);
      setBatchGradingLoading(false);
      showErrorToast('Error', err.message || 'Failed to start batch grading');
    }
  };

  if (isLoading) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.pr500} />
      </AppSafeView>
    );
  }

  if (!elementData) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <AppText style={styles.errorText}>
          Failed to load lab data.
        </AppText>
      </AppSafeView>
    );
  }

  const sections = [
    { title: 'Documents', data: dynamicDocumentList },
    {
      title: 'Submissions',
      data: submissionList,
      sectionButton: submissionList.length > 0 ? 'Download All' : undefined,
    },
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
          assignmentType="Lab"
          assignmentTitle={elementData.name}
          dueDate={deadline}
          lecturerName={classAssessment?.lecturerName || userProfile?.name || 'Lecturer'}
          description={elementData.description}
          isSubmitted={false}
          onSubmitPress={() => {
            navigation.navigate('SubmissionScreen');
          }}
          isAssessment={true}
          onDashboardPress={() => {
            navigation.navigate('DashboardTeacherScreen');
          }}
          onAutoGradePress={handleBatchGrading}
          onDeadlineChange={handleDeadlineChange}
        />
        <View />
        <View
          style={{ position: 'absolute', top: s(360), width: '100%' }}
          onLayout={e => setListHeight(e.nativeEvent.layout.height + s(100))}
        >
          <CurriculumList
            sections={sections}
            buttonText={submissionList.length > 0 ? 'Download All Submissions' : undefined}
            scrollEnabled={false}
            onDownloadAll={handleDownloadAllSubmissions}
            onSectionButtonPress={(sectionTitle) => {
              if (sectionTitle === 'Submissions') {
                handleDownloadAllSubmissions();
              }
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default LabDetailTeacherScreen;

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

