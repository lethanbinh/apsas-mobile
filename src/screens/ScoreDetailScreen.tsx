import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Platform, Alert } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import {
  CurriculumIcon,
  DownloadIcon,
  NavigationIcon,
} from '../assets/icons/courses';
import { HistoryIcon } from '../assets/icons/icon';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import CourseCardItem from '../components/courses/CourseCardItem';
import CurriculumItem from '../components/courses/CurriculumItem';
import ScoreQuestionAccordion from '../components/scoring/ScoreQuestionAccordion';
import AppText from '../components/texts/AppText';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { useForm } from 'react-hook-form';
import ParticipantItem from '../components/courses/ParticipantItem';
import { getSubmissionList, Submission } from '../api/submissionService';
import { getGradingGroupById, getGradingGroups } from '../api/gradingGroupService';
import { getClassAssessments } from '../api/classAssessmentService';
import { assessmentTemplateService } from '../api/assessmentTemplateServiceWrapper';
import { assessmentPaperService } from '../api/assessmentPaperServiceWrapper';
import { assessmentQuestionService } from '../api/assessmentQuestionServiceWrapper';
import { rubricItemService } from '../api/rubricItemServiceWrapper';
import { gradingService, GradingSession } from '../api/gradingService';
import { gradeItemService, GradeItemData } from '../api/gradeItemService';
import { showErrorToast } from '../components/toasts/AppToast';
import { useGetCurrentStudentId } from '../hooks/useGetCurrentStudentId';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNBlobUtil from 'react-native-blob-util';
import { PermissionsAndroid } from 'react-native';

interface QuestionWithRubrics {
  id: number;
  questionNumber: number;
  questionText: string;
  rubrics: any[];
  rubricScores: { [rubricId: number]: number };
}

const ScoreDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const routeParams = route.params as { submissionId?: number | string } | undefined;
  const submissionId = routeParams?.submissionId
    ? typeof routeParams.submissionId === 'string'
      ? parseInt(routeParams.submissionId, 10)
      : routeParams.submissionId
    : undefined;

  const { studentId } = useGetCurrentStudentId();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [questions, setQuestions] = useState<QuestionWithRubrics[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const [lecturerName, setLecturerName] = useState<string>('Unknown');
  const [gradedAt, setGradedAt] = useState<string>('');
  const [latestGradingSession, setLatestGradingSession] = useState<GradingSession | null>(null);
  const [latestGradeItems, setLatestGradeItems] = useState<GradeItemData[]>([]);

  const { control } = useForm({
    defaultValues: {
      questions: [],
    },
  });

  useEffect(() => {
    setIsMounted(true);
    if (submissionId && !isNaN(submissionId)) {
      fetchData();
    } else {
      if (isMounted) {
        showErrorToast('Error', 'No submission ID provided');
        navigation.goBack();
      }
    }

    return () => {
      setIsMounted(false);
    };
  }, [submissionId]);

  const fetchData = async () => {
    if (!submissionId || !isMounted) return;

    setIsLoading(true);
    try {
      // Fetch submission by ID first
      let foundSubmission: Submission | null = null;

      // Try to fetch all submissions and find the one with matching ID
      try {
        const allSubmissions = await getSubmissionList({});
        foundSubmission = allSubmissions.find((s) => s.id === submissionId) || null;
      } catch (err) {
        console.error('Failed to fetch submission:', err);
      }

      if (!foundSubmission) {
        if (isMounted) {
          showErrorToast('Error', 'Submission not found');
          navigation.goBack();
        }
        return;
      }

      // Verify submission belongs to current student (if studentId is available)
      if (studentId) {
        // Check if submission belongs to current student
        if (foundSubmission.studentId !== Number(studentId)) {
          // If not, try to get the latest submission for current student and this assignment
          try {
            let relatedSubmissions: Submission[] = [];

            if (foundSubmission.classAssessmentId) {
              // Fetch all submissions for this classAssessment and current student
              const submissions = await getSubmissionList({
                classAssessmentId: foundSubmission.classAssessmentId,
                studentId: Number(studentId),
              });
              relatedSubmissions = submissions || [];
            } else if (foundSubmission.gradingGroupId) {
              // Fetch all submissions for this gradingGroup and current student
              const submissions = await getSubmissionList({
                gradingGroupId: foundSubmission.gradingGroupId,
                studentId: Number(studentId),
              });
              relatedSubmissions = submissions || [];
            }

            // Get the latest submission (by submittedAt) for current student
            if (relatedSubmissions.length > 0) {
              const sortedSubmissions = relatedSubmissions
                .filter(s => s && s.submittedAt && s.studentId === Number(studentId))
                .sort((a, b) => {
                  if (!a.submittedAt || !b.submittedAt) return 0;
                  return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
                });

              if (sortedSubmissions.length > 0 && sortedSubmissions[0]) {
                foundSubmission = sortedSubmissions[0];
                console.log('Using latest submission for current student:', foundSubmission.id, 'submittedAt:', foundSubmission.submittedAt);
              } else {
                // If no submissions found for current student, show error
                if (isMounted) {
                  showErrorToast('Error', 'This submission does not belong to you');
                  navigation.goBack();
                }
                return;
              }
            } else {
              // If no submissions found for current student, show error
              if (isMounted) {
                showErrorToast('Error', 'This submission does not belong to you');
                navigation.goBack();
              }
              return;
            }
          } catch (err) {
            console.error('Failed to fetch latest submission:', err);
            // If error, verify original submission belongs to current student
            if (foundSubmission.studentId !== Number(studentId)) {
              if (isMounted) {
                showErrorToast('Error', 'This submission does not belong to you');
                navigation.goBack();
              }
              return;
            }
          }
        } else {
          // Submission belongs to current student, use it as is
          console.log('Using provided submission:', foundSubmission.id);
        }
      } else {
        // No studentId available, use submission as is
        console.log('No studentId available, using provided submission:', foundSubmission.id);
      }

      if (!isMounted) return;
      setSubmission(foundSubmission);
      setTotalScore(foundSubmission?.lastGrade || 0);

      // Get lecturer name and graded date
      if (foundSubmission.gradingGroupId) {
        try {
          const gradingGroups = await getGradingGroups({});
          const gradingGroup = gradingGroups.find((gg) => gg.id === foundSubmission.gradingGroupId);
          if (gradingGroup?.lecturerName) {
            setLecturerName(gradingGroup.lecturerName);
          }
        } catch (err) {
          console.error('Failed to fetch grading group:', err);
        }
      }

      if (foundSubmission.updatedAt) {
        setGradedAt(dayjs(foundSubmission.updatedAt).format('HH:mm DD/MM/YYYY'));
      }

      // Fetch questions and rubrics
      await fetchQuestionsAndRubrics(foundSubmission);
      
      // Fetch latest grading session and grade items - use latest submission ID
      await fetchLatestGradingData(foundSubmission.id);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      if (isMounted) {
        showErrorToast('Error', error.message || 'Failed to load data');
        navigation.goBack();
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  const fetchLatestGradingData = async (submissionId: number) => {
    try {
      // Fetch latest grading session for this submission
      const gradingSessionsResult = await gradingService.getGradingSessions({
        submissionId: submissionId,
        pageNumber: 1,
        pageSize: 100,
      });

      if (gradingSessionsResult.items.length > 0) {
        // Sort by createdAt desc to get the latest session
        const sortedSessions = [...gradingSessionsResult.items].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        
        const latestSession = sortedSessions[0];
        setLatestGradingSession(latestSession);
        
        // Fetch grade items for this grading session
        const gradeItemsResult = await gradeItemService.getGradeItems({
          gradingSessionId: latestSession.id,
          pageNumber: 1,
          pageSize: 1000,
        });
        
        // Filter to get only the latest grade item for each rubricItemDescription
        // Sort by updatedAt descending, then group by rubricItemDescription and take the first one
        const sortedItems = [...gradeItemsResult.items].sort((a, b) => {
          const dateA = new Date(a.updatedAt).getTime();
          const dateB = new Date(b.updatedAt).getTime();
          if (dateB !== dateA) {
            return dateB - dateA; // Descending order by updatedAt
          }
          // If updatedAt is same, sort by createdAt descending
          const createdA = new Date(a.createdAt).getTime();
          const createdB = new Date(b.createdAt).getTime();
          return createdB - createdA;
        });
        
        const latestGradeItemsMap = new Map<string, GradeItemData>();
        sortedItems.forEach((item) => {
          const rubricKey = item.rubricItemDescription || "";
          if (!latestGradeItemsMap.has(rubricKey)) {
            latestGradeItemsMap.set(rubricKey, item);
          }
        });
        
        const latestGradeItems = Array.from(latestGradeItemsMap.values());
        setLatestGradeItems(latestGradeItems);
        
        // Map grade items to rubric scores
        if (latestGradeItems.length > 0) {
          setQuestions((prevQuestions) => {
            return prevQuestions.map((question) => {
              const newRubricScores = { ...question.rubricScores };
              
              // Find grade items that match this question's rubrics
              question.rubrics.forEach((rubric) => {
                const matchingGradeItem = latestGradeItems.find(
                  (item) => item.rubricItemId === rubric.id
                );
                if (matchingGradeItem) {
                  newRubricScores[rubric.id] = matchingGradeItem.score;
                }
              });
              
              return { 
                ...question, 
                rubricScores: newRubricScores,
              };
            });
          });
          
          // Calculate total score
          const total = latestGradeItems.reduce((sum, item) => sum + item.score, 0);
          setTotalScore(total);
        } else {
          // If no grade items, use the grade from session
          setTotalScore(latestSession.grade);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch latest grading data:', error);
    }
  };

  const fetchQuestionsAndRubrics = async (submission: Submission) => {
    if (!isMounted || !submission) return;

    try {
      let assessmentTemplateId: number | null = null;

      if (submission?.gradingGroupId) {
        try {
          const gradingGroup = await getGradingGroupById(submission.gradingGroupId);
          if (gradingGroup?.assessmentTemplateId) {
            assessmentTemplateId = gradingGroup.assessmentTemplateId;
          }
        } catch (err) {
          console.error('Failed to fetch grading group:', err);
        }
      }

      // Try to get assessmentTemplateId from classAssessmentId
      if (!assessmentTemplateId && submission.classAssessmentId) {
        try {
          // First try fetching all class assessments without classId filter (like web app)
          try {
            const allClassAssessmentsRes = await getClassAssessments({
              pageNumber: 1,
              pageSize: 10000, // Large page size to get all (like web app)
            });
            const classAssessment = (allClassAssessmentsRes?.items || []).find(
              (ca) => ca && ca.id === submission.classAssessmentId
            );
            if (classAssessment?.assessmentTemplateId) {
              assessmentTemplateId = classAssessment.assessmentTemplateId;
              console.log("Found assessmentTemplateId from classAssessment (all classes):", assessmentTemplateId);
            }
          } catch (err) {
            console.error("Failed to fetch all class assessments:", err);
            // If that fails, try fetching from multiple classes
            try {
              const { fetchClassList } = await import('../api/classService');
              const classes = await fetchClassList();
              for (const classItem of classes || []) {
                try {
                  const classAssessmentsRes = await getClassAssessments({
                    classId: Number(classItem.id),
                    pageNumber: 1,
                    pageSize: 1000,
                  });
                  const classAssessment = (classAssessmentsRes?.items || []).find(
                    (ca) => ca && ca.id === submission.classAssessmentId
                  );
                  if (classAssessment?.assessmentTemplateId) {
                    assessmentTemplateId = classAssessment.assessmentTemplateId;
                    console.log(`Found assessmentTemplateId from classAssessment (classId ${classItem.id}):`, assessmentTemplateId);
                    break;
                  }
                } catch (err) {
                  // Continue to next class
                }
              }
            } catch (err) {
              console.error("Failed to fetch from multiple classes:", err);
            }
          }
        } catch (err) {
          console.error("Failed to fetch from classAssessment:", err);
        }
      }

      if (!assessmentTemplateId) {
        if (isMounted) {
          showErrorToast('Error', 'Could not find assessment template');
        }
        return;
      }

      // Fetch template
      const templates = await assessmentTemplateService.getAssessmentTemplates({
        pageNumber: 1,
        pageSize: 1000,
      });
      const template = (templates?.items || []).find(t => t && t.id === assessmentTemplateId);

      if (!template) {
        if (isMounted) {
          showErrorToast('Error', 'Assessment template not found');
        }
        return;
      }

      // Fetch papers
      const papers = await assessmentPaperService.getAssessmentPapers({
        assessmentTemplateId: template.id,
        pageNumber: 1,
        pageSize: 100,
      });

      const allQuestions: QuestionWithRubrics[] = [];

      // Fetch questions and rubrics for each paper
      for (const paper of papers?.items || []) {
        if (!isMounted) return;

        const questionsRes = await assessmentQuestionService.getAssessmentQuestions({
          assessmentPaperId: paper.id,
          pageNumber: 1,
          pageSize: 100,
        });

        const paperQuestions = (questionsRes?.items || []).sort(
          (a, b) => (a.questionNumber || 0) - (b.questionNumber || 0),
        );

        for (const question of paperQuestions) {
          if (!isMounted) return;

          // Fetch rubrics
          const rubricsRes = await rubricItemService.getRubricsForQuestion({
            assessmentQuestionId: question.id,
            pageNumber: 1,
            pageSize: 100,
          });

          const questionRubrics = rubricsRes?.items || [];

          // Initialize rubric scores as empty (will be populated from grade items)
          const rubricScores: { [rubricId: number]: number } = {};
          (questionRubrics || []).forEach(rubric => {
            if (rubric && rubric.id) {
              rubricScores[rubric.id] = 0;
            }
          });

          if (question && question.id) {
            allQuestions.push({
              id: question.id,
              questionNumber: question.questionNumber || 0,
              questionText: question.questionText || '',
              rubrics: questionRubrics || [],
              rubricScores,
            });
          }
        }
      }

      if (!isMounted) return;

      // Sort questions by questionNumber
      const sortedQuestions = allQuestions.sort(
        (a, b) => (a.questionNumber || 0) - (b.questionNumber || 0),
      );

      setQuestions(sortedQuestions);

      // Set first question expanded
      if (sortedQuestions.length > 0 && sortedQuestions[0]?.id) {
        setExpandedQuestionId(sortedQuestions[0].id);
      }
      
      // Note: Total score will be calculated from grade items in fetchLatestGradingData
    } catch (error: any) {
      console.error('Failed to fetch questions and rubrics:', error);
      if (isMounted) {
        showErrorToast('Error', 'Failed to load questions and rubrics');
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

  const handleDownloadFile = async (file: { name: string; submissionUrl: string }) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        showErrorToast('Permission Denied', 'Storage permission is required to download.');
        return;
      }

      const fileName = file.name || `submission_${submission?.id || 'file'}.zip`;
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
          Alert.alert('Download Complete', `${fileName} has been saved.`);
        })
        .catch(error => {
          console.error('Download error:', error);
          Alert.alert('Download Error', 'An error occurred while downloading the file.');
        });
    } catch (error: any) {
      console.error('Download error:', error);
      showErrorToast('Error', error.message || 'Failed to download file.');
    }
  };

  // Prepare questions data for ScoreQuestionAccordion
  const questionsForDisplay = questions
    .filter(q => q && q.id)
    .map(q => {
      const questionTotalScore = q.rubricScores
        ? Object.values(q.rubricScores).reduce((sum, score) => sum + (score || 0), 0)
        : 0;
      const questionMaxScore = (q.rubrics || []).reduce((sum, r) => sum + (r?.score || 0), 0);
      const questionText = q.questionText || '';
      const truncatedText = questionText.length > 50 ? questionText.substring(0, 50) + '...' : questionText;

      return {
        id: q.id,
        title: `Q${q.questionNumber || '?'}: ${truncatedText}`,
        score: questionTotalScore,
        maxScore: questionMaxScore,
        criteria: (q.rubrics || []).map((rubric) => ({
          id: rubric?.id || 0,
          description: rubric?.description || '',
          maxScore: rubric?.score || 0,
          currentScore: (q.rubricScores && q.rubricScores[rubric.id]) || 0,
        })),
      };
    });

  if (isLoading) {
    return (
      <AppSafeView>
        <ScreenHeader title="Score Detail" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  if (!submission) {
    return (
      <AppSafeView>
        <ScreenHeader title="Score Detail" />
        <View style={styles.emptyContainer}>
          <AppText>Submission not found</AppText>
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader
        onRightIconPress={() =>
          navigation.navigate('SubmissionHistoryScreen')
        }
        rightIcon={
          <HistoryIcon fill={AppColors.pr500} stroke={AppColors.pr500} />
        }
        title={'Score Detail'}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <SectionHeader
          title="Your Submission"
          style={{ marginBottom: vs(20) }}
        />

        {submission.submissionFile && (
          <CurriculumItem
            id={1}
            number={'01'}
            title={'File Submit'}
            linkFile={submission.submissionFile.name}
            rightIcon={<DownloadIcon />}
            detailNavigation={''}
            onAction={() => handleDownloadFile(submission.submissionFile!)}
          />
        )}

        <SectionHeader title="Grade By" style={{ marginTop: vs(20) }} />
        <ParticipantItem
          title={lecturerName}
          joinDate={`Grade at ${gradedAt}`}
          role="Lecturer"
          containerStyle={{ paddingHorizontal: 0 }}
        />

        <SectionHeader
          title="Score"
          style={{ marginBottom: vs(10), marginTop: vs(20) }}
        />

        {questionsForDisplay
          .filter(q => q && q.id)
          .map((question, index) => (
            <ScoreQuestionAccordion
              key={question.id}
              question={question}
              index={index}
              isExpanded={expandedQuestionId === question.id}
              onToggle={() =>
                setExpandedQuestionId(prevId => (prevId === question.id ? null : question.id))
              }
              control={control}
              editable={false}
            />
          ))}

        <View style={styles.totalGradeBar}>
          <AppText variant="label16pxBold">Total Grade</AppText>
          <View style={styles.totalScoreBadge}>
            <AppText variant="body14pxBold" style={{ color: AppColors.r500 }}>
              {totalScore.toFixed(1)}/100
            </AppText>
          </View>
        </View>

        <CourseCardItem
          title={'Feedback'}
          leftIcon={<CurriculumIcon />}
          backGroundColor={AppColors.b100}
          rightIcon={<NavigationIcon color={AppColors.b500} />}
          onPress={() => {
            if (submission && submission.id) {
              navigation.navigate('FeedbackScreen', {
                submissionId: submission.id, // Use latest submission ID
              });
            }
          }}
          style={{ marginTop: vs(25) }}
        />
      </ScrollView>
    </AppSafeView>
  );
};

export default ScoreDetailScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: s(20),
    paddingHorizontal: s(25),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  totalGradeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.n100,
    borderRadius: 12,
    padding: s(15),
    marginTop: vs(10),
  },
  totalScoreBadge: {
    backgroundColor: AppColors.r100,
    paddingHorizontal: s(12),
    paddingVertical: vs(5),
    borderRadius: 6,
  },
});
