import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import * as yup from 'yup';
import { assessmentPaperService } from '../api/assessmentPaperServiceWrapper';
import { AssessmentQuestion, assessmentQuestionService } from '../api/assessmentQuestionServiceWrapper';
import { assessmentTemplateService } from '../api/assessmentTemplateServiceWrapper';
import { getClassAssessments } from '../api/classAssessmentService';
import { GradeItemData, gradeItemService } from '../api/gradeItemService';
import { getGradingGroupById, getGradingGroups } from '../api/gradingGroupService';
import { gradingService, GradingSession } from '../api/gradingService';
import { RubricItem, rubricItemService } from '../api/rubricItemServiceWrapper';
import { SubmissionFeedback, submissionFeedbackService } from '../api/submissionFeedbackService';
import { getSubmissionList, Submission } from '../api/submissionService';
import { DownloadIcon } from '../assets/icons/courses';
import { HistoryIcon } from '../assets/icons/icon';
import AppButton from '../components/buttons/AppButton';
import CollapsibleSection from '../components/common/CollapsibleSection';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import CurriculumItem from '../components/courses/CurriculumItem';
import ScoreQuestionAccordion from '../components/scoring/ScoreQuestionAccordion';
import AppText from '../components/texts/AppText';
import { showErrorToast, showSuccessToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

dayjs.extend(utc);
dayjs.extend(timezone);

// Helper function to convert UTC to Vietnam time (UTC+7)
const toVietnamTime = (dateString: string) => {
  return dayjs.utc(dateString).tz('Asia/Ho_Chi_Minh');
};

interface QuestionWithRubrics extends AssessmentQuestion {
  rubrics: RubricItem[];
  rubricScores: { [rubricId: number]: number };
  rubricComments?: { [key: number]: string };
}

interface FeedbackData {
  overallFeedback: string;
  strengths: string;
  weaknesses: string;
  codeQuality: string;
  algorithmEfficiency: string;
  suggestionsForImprovement: string;
  bestPractices: string;
  errorHandling: string;
}

const schema = yup.object({
  questions: yup.array().of(
    yup.object({
      criteria: yup.array().of(
        yup.object({
          score: yup.string().required('Score is required'),
          comment: yup.string(),
        }),
      ),
    }),
  ),
});

const AssignmentGradingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as { submissionId?: number | string } | undefined;
  // Convert submissionId to number if it's a string
  const submissionId = routeParams?.submissionId
    ? typeof routeParams.submissionId === 'string'
      ? parseInt(routeParams.submissionId, 10)
      : routeParams.submissionId
    : undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [questions, setQuestions] = useState<QuestionWithRubrics[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const [isSemesterPassed, setIsSemesterPassed] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState<string>('Assignment');
  const [feedback, setFeedback] = useState<FeedbackData>({
    overallFeedback: '',
    strengths: '',
    weaknesses: '',
    codeQuality: '',
    algorithmEfficiency: '',
    suggestionsForImprovement: '',
    bestPractices: '',
    errorHandling: '',
  });
  const [autoGradingLoading, setAutoGradingLoading] = useState(false);
  const [loadingAiFeedback, setLoadingAiFeedback] = useState(false);
  const [gradingHistoryModalVisible, setGradingHistoryModalVisible] = useState(false);
  const [gradingHistory, setGradingHistory] = useState<GradingSession[]>([]);
  const [loadingGradingHistory, setLoadingGradingHistory] = useState(false);
  const [latestGradingSession, setLatestGradingSession] = useState<GradingSession | null>(null);
  const [latestGradeItems, setLatestGradeItems] = useState<GradeItemData[]>([]);
  const autoGradingPollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [expandedGradingHistorySessions, setExpandedGradingHistorySessions] = useState<Set<number>>(new Set());
  const [sessionGradeItems, setSessionGradeItems] = useState<{ [sessionId: number]: GradeItemData[] }>({});
  const [currentFeedback, setCurrentFeedback] = useState<SubmissionFeedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm<{ questions: Array<{ criteria: Array<{ score: string; comment: string }> }> }>({
    resolver: yupResolver(schema) as any,
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
      // Fetch submission by ID first to get student and assignment info
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
      if (foundSubmission.studentId) {
        try {
          let relatedSubmissions: Submission[] = [];

          if (foundSubmission.classAssessmentId) {
            // Fetch all submissions for this classAssessment and student
            const submissions = await getSubmissionList({
              classAssessmentId: foundSubmission.classAssessmentId,
              studentId: foundSubmission.studentId,
            });
            relatedSubmissions = submissions || [];
          } else if (foundSubmission.gradingGroupId) {
            // Fetch all submissions for this gradingGroup and student
            const submissions = await getSubmissionList({
              gradingGroupId: foundSubmission.gradingGroupId,
              studentId: foundSubmission.studentId,
            });
            relatedSubmissions = submissions || [];
          }

          // Get the latest submission (by submittedAt)
          if (relatedSubmissions.length > 0) {
            const sortedSubmissions = relatedSubmissions
              .filter(s => s && s.submittedAt)
              .sort((a, b) => {
                if (!a.submittedAt || !b.submittedAt) return 0;
                return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
              });

            if (sortedSubmissions.length > 0 && sortedSubmissions[0]) {
              foundSubmission = sortedSubmissions[0];
              console.log('Using latest submission:', foundSubmission.id, 'submittedAt:', foundSubmission.submittedAt);
            }
          }
        } catch (err) {
          console.error('Failed to fetch latest submission:', err);
          // Continue with original submission if error
        }
      }

      if (!isMounted) return;
      setSubmission(foundSubmission);
      setTotalScore(foundSubmission?.lastGrade || 0);

      // Check semester status (simplified - always allow editing for now)
      setIsSemesterPassed(false);

      // Load feedback from API - use latest submission ID
      await fetchFeedbackFromAPI(foundSubmission.id);

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
        
        // Map grade items to rubric scores and comments
        if (latestGradeItems.length > 0) {
          setQuestions((prevQuestions) => {
            return prevQuestions.map((question) => {
              const newRubricScores = { ...question.rubricScores };
              const newRubricComments = { ...(question.rubricComments || {}) };
              
              // Find grade items that match this question's rubrics
              let questionComment = "";
              question.rubrics.forEach((rubric) => {
                const matchingGradeItem = latestGradeItems.find(
                  (item) => item.rubricItemId === rubric.id
                );
                if (matchingGradeItem) {
                  newRubricScores[rubric.id] = matchingGradeItem.score;
                  // Get comment from first grade item (all grade items in a question share the same comment)
                  if (!questionComment && matchingGradeItem.comments) {
                    questionComment = matchingGradeItem.comments;
                  }
                }
              });
              
              // Set comment for the question (using question.id as key)
              newRubricComments[question.id] = questionComment;
              
              return { 
                ...question, 
                rubricScores: newRubricScores,
                rubricComments: newRubricComments
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

  const fetchQuestionsAndRubrics = async (submission: Submission | null) => {
    if (!isMounted || !submission) return;

    try {
      let assessmentTemplateId: number | null = null;

      // Try to get assessmentTemplateId from gradingGroupId first (most reliable) - like web app
      if (submission?.gradingGroupId) {
        try {
          const gradingGroups = await getGradingGroups({});
          const gradingGroup = gradingGroups.find((gg) => gg.id === submission.gradingGroupId);
          if (gradingGroup?.assessmentTemplateId) {
            assessmentTemplateId = gradingGroup.assessmentTemplateId;
            console.log("Found assessmentTemplateId from gradingGroup:", assessmentTemplateId);
          }
        } catch (err) {
          console.error("Failed to fetch from gradingGroup:", err);
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
              // Set assignment title from classAssessment
              if (classAssessment?.courseElementName && isMounted) {
                setAssignmentTitle(classAssessment.courseElementName);
              }
            }
          } catch (err) {
            console.error("Failed to fetch all class assessments:", err);
            // If that fails, try fetching from multiple classes (like web app)
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
                    // Set assignment title from classAssessment
                    if (classAssessment?.courseElementName && isMounted) {
                      setAssignmentTitle(classAssessment.courseElementName);
                    }
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
        showErrorToast('Error', 'Could not find assessment template');
        return;
      }

      // Fetch template
      const templates = await assessmentTemplateService.getAssessmentTemplates({
        pageNumber: 1,
        pageSize: 1000,
      });
      const template = templates?.items?.find(t => t.id === assessmentTemplateId);

      if (!template) {
        showErrorToast('Error', 'Assessment template not found');
        return;
      }

      // Set assignment title from template if not set from classAssessment
      if (!assignmentTitle || assignmentTitle === 'Assignment') {
        if (template?.name && isMounted) {
          setAssignmentTitle(template.name);
        }
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

          // Initialize rubric scores and comments as empty (like web app)
          const rubricScores: { [rubricId: number]: number } = {};
          const rubricComments: { [rubricId: number]: string } = {};

          allQuestions.push({
            ...question,
            rubrics: questionRubrics,
            rubricScores,
            rubricComments,
          });
        }
      }

      if (!isMounted) return;

      if (allQuestions.length === 0) {
        setQuestions([]);
      } else {
        // Sort questions by questionNumber and ensure rubricComments exists (like web app)
        const sortedQuestions = [...allQuestions].sort((a, b) => 
          (a.questionNumber || 0) - (b.questionNumber || 0)
        ).map(q => ({
          ...q,
          rubricComments: { ...(q.rubricComments || {}) },
        }));
        setQuestions(sortedQuestions);
        
        // Set first question expanded
        if (sortedQuestions.length > 0 && sortedQuestions[0]?.id) {
          setExpandedQuestionId(sortedQuestions[0].id);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch questions and rubrics:', error);
      if (isMounted) {
        showErrorToast('Error', 'Failed to load questions and rubrics');
      }
    }
  };

  const handleRubricScoreChange = (
    questionId: number,
    rubricId: number,
    score: number,
  ) => {
    if (!questionId || !rubricId) return;
    
    setQuestions(prev => {
      const updated = prev.map(q => {
        if (q && q.id === questionId) {
          const newRubricScores = { ...(q.rubricScores || {}) };
          newRubricScores[rubricId] = score;
          return { ...q, rubricScores: newRubricScores };
        }
        return q;
      });

      // Calculate total score
      let total = 0;
      updated.forEach(q => {
        if (q && q.rubricScores) {
          const questionTotal = Object.values(q.rubricScores).reduce(
            (sum, score) => sum + (score || 0),
            0,
          );
          total += questionTotal;
        }
      });
      setTotalScore(total);

      return updated;
    });
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

  const handleSave = async () => {
    if (isSemesterPassed) {
      showErrorToast('Error', 'The semester has ended. You cannot edit grades.');
      return;
    }

    if (!submission) return;

    try {
      setIsSaving(true);

      // Calculate total score
      let calculatedTotal = 0;
      questions.forEach(q => {
        if (q && q.rubricScores) {
          const questionTotal = Object.values(q.rubricScores).reduce(
            (sum, score) => sum + (score || 0),
            0,
          );
          calculatedTotal += questionTotal;
        }
      });

      // Get assessmentTemplateId (same logic as fetchQuestionsAndRubrics) - like web app
      let assessmentTemplateId: number | null = null;

      // Try to get assessmentTemplateId from gradingGroupId first (most reliable)
      if (submission.gradingGroupId) {
        try {
          const gradingGroups = await getGradingGroups({});
          const gradingGroup = gradingGroups.find((gg) => gg.id === submission.gradingGroupId);
          if (gradingGroup?.assessmentTemplateId) {
            assessmentTemplateId = gradingGroup.assessmentTemplateId;
            console.log("Found assessmentTemplateId from gradingGroup:", assessmentTemplateId);
          }
        } catch (err) {
          console.error("Failed to fetch from gradingGroup:", err);
        }
      }

      // Try to get assessmentTemplateId from classAssessmentId
      if (!assessmentTemplateId && submission.classAssessmentId) {
        try {
          // First try fetching all class assessments without classId filter
          try {
            const allClassAssessmentsRes = await getClassAssessments({
              pageNumber: 1,
              pageSize: 10000, // Large page size to get all
            });
            const classAssessment = (allClassAssessmentsRes?.items || []).find(
              (ca) => ca && ca.id === submission.classAssessmentId
            );
            if (classAssessment?.assessmentTemplateId) {
              assessmentTemplateId = classAssessment.assessmentTemplateId;
              console.log("Found assessmentTemplateId from classAssessment (all classes):", assessmentTemplateId);
            }
          } catch (err) {
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
        showErrorToast('Error', 'Cannot find assessment template. Please contact administrator.');
        setIsSaving(false);
        return;
      }

      // Get or create grading session
      let gradingSessionId: number;
      if (latestGradingSession) {
        gradingSessionId = latestGradingSession.id;
      } else {
        // Create new grading session (manual grading, not auto grading)
        await gradingService.createGrading({
          submissionId: submission.id,
          assessmentTemplateId: assessmentTemplateId,
        });

        // Fetch the newly created session
        const gradingSessionsResult = await gradingService.getGradingSessions({
          submissionId: submission.id,
          pageNumber: 1,
          pageSize: 100,
        });

        if (gradingSessionsResult.items.length > 0) {
          const sortedSessions = [...gradingSessionsResult.items].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
          gradingSessionId = sortedSessions[0].id;
          setLatestGradingSession(sortedSessions[0]);
        } else {
          showErrorToast('Error', 'Failed to create grading session');
          setIsSaving(false);
          return;
        }
      }

      // Save all grade items (create or update)
      for (const question of questions) {
        const questionComment = question.rubricComments?.[question.id] || '';
        
        for (const rubric of question.rubrics) {
          const score = question.rubricScores[rubric.id] || 0;
          const existingGradeItem = latestGradeItems.find(
            (item) => item.rubricItemId === rubric.id
          );

          if (existingGradeItem) {
            // Update existing grade item
            await gradeItemService.updateGradeItem(existingGradeItem.id, {
              score: score,
              comments: questionComment,
            });
          } else {
            // Create new grade item
            await gradeItemService.createGradeItem({
              gradingSessionId: gradingSessionId,
              rubricItemId: rubric.id,
              score: score,
              comments: questionComment,
            });
          }
        }
      }

      // Update grading session with total score (status defaults to COMPLETED)
      await gradingService.updateGradingSession(gradingSessionId, {
        grade: calculatedTotal,
        status: 1, // COMPLETED
      });

      showSuccessToast('Success', 'Grade saved successfully');
      
      // Refresh latest grading data
      await fetchLatestGradingData(submission.id);
    } catch (error: any) {
      console.error('Failed to save:', error);
      showErrorToast('Error', error.message || 'Failed to save grade');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoGrading = async () => {
    if (!submissionId || !submission) {
      showErrorToast('Error', 'No submission selected');
      return;
    }

    try {
      setAutoGradingLoading(true);

      // Get assessmentTemplateId (same logic as fetchQuestionsAndRubrics) - like web app
      let assessmentTemplateId: number | null = null;

      // Try to get assessmentTemplateId from gradingGroupId first (most reliable)
      if (submission.gradingGroupId) {
        try {
          const gradingGroups = await getGradingGroups({});
          const gradingGroup = gradingGroups.find((gg) => gg.id === submission.gradingGroupId);
          if (gradingGroup?.assessmentTemplateId) {
            assessmentTemplateId = gradingGroup.assessmentTemplateId;
            console.log("Found assessmentTemplateId from gradingGroup:", assessmentTemplateId);
          }
        } catch (err) {
          console.error("Failed to fetch from gradingGroup:", err);
        }
      }

      // Try to get assessmentTemplateId from classAssessmentId
      if (!assessmentTemplateId && submission.classAssessmentId) {
        try {
          // First try fetching all class assessments without classId filter
          try {
            const allClassAssessmentsRes = await getClassAssessments({
              pageNumber: 1,
              pageSize: 10000, // Large page size to get all
            });
            const classAssessment = (allClassAssessmentsRes?.items || []).find(
              (ca) => ca && ca.id === submission.classAssessmentId
            );
            if (classAssessment?.assessmentTemplateId) {
              assessmentTemplateId = classAssessment.assessmentTemplateId;
              console.log("Found assessmentTemplateId from classAssessment (all classes):", assessmentTemplateId);
            }
          } catch (err) {
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
        showErrorToast('Error', 'Cannot find assessment template. Please contact administrator.');
        setAutoGradingLoading(false);
        return;
      }

      // Call auto grading API
      const gradingSession = await gradingService.autoGrading({
        submissionId: submission.id,
        assessmentTemplateId: assessmentTemplateId,
      });

      setLatestGradingSession(gradingSession);

      // If status is 0 (PROCESSING), start polling
      if (gradingSession.status === 0) {
        showSuccessToast('Info', 'Auto grading in progress...');
        
        // Poll every 2 seconds until status changes
        const pollInterval = setInterval(async () => {
          try {
            const sessionsResult = await gradingService.getGradingSessions({
              submissionId: submission.id,
              pageNumber: 1,
              pageSize: 100,
            });

            if (sessionsResult.items.length > 0) {
              const sortedSessions = [...sessionsResult.items].sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
              });

              const latestSession = sortedSessions[0];
              setLatestGradingSession(latestSession);

              // If status is no longer PROCESSING (0), stop polling
              if (latestSession.status !== 0) {
                if (autoGradingPollIntervalRef.current) {
                  clearInterval(autoGradingPollIntervalRef.current);
                  autoGradingPollIntervalRef.current = null;
                }
                setAutoGradingLoading(false);
                
                // Refresh grading data and questions
                await fetchLatestGradingData(submission.id);
                
                // Refresh questions to show updated scores
                await fetchQuestionsAndRubrics(submission);
                
                if (latestSession.status === 1) {
                  showSuccessToast('Success', 'Auto grading completed successfully');
                } else if (latestSession.status === 2) {
                  showErrorToast('Error', 'Auto grading failed');
                }
              }
            }
          } catch (err: any) {
            console.error('Failed to poll grading status:', err);
            if (autoGradingPollIntervalRef.current) {
              clearInterval(autoGradingPollIntervalRef.current);
              autoGradingPollIntervalRef.current = null;
            }
            setAutoGradingLoading(false);
            showErrorToast('Error', 'Failed to check grading status');
          }
        }, 2000);

        autoGradingPollIntervalRef.current = pollInterval;
      } else {
        setAutoGradingLoading(false);
        await fetchLatestGradingData(submission.id);
        // Refresh questions to show updated scores
        await fetchQuestionsAndRubrics(submission);
        if (gradingSession.status === 1) {
          showSuccessToast('Success', 'Auto grading completed');
        } else {
          showErrorToast('Error', 'Auto grading failed');
        }
      }
    } catch (error: any) {
      console.error('Failed to start auto grading:', error);
      setAutoGradingLoading(false);
      showErrorToast('Error', error.message || 'Failed to start auto grading');
    }
  };

  const handleGetAiFeedback = async () => {
    if (!submission || !submission.id) {
      showErrorToast('Error', 'No submission selected');
      return;
    }

    try {
      setLoadingAiFeedback(true);
      showSuccessToast('Info', 'Getting AI feedback...');

      // Get formatted feedback using Gemini (same as web) - use latest submission ID
      const formattedFeedback = await gradingService.getFormattedAiFeedback(submission.id, 'OpenAI');

      setFeedback(formattedFeedback);
      
      // Save feedback to API - use latest submission ID
      await saveFeedback(formattedFeedback);
      
      showSuccessToast('Success', 'AI feedback retrieved and saved successfully!');
    } catch (error: any) {
      console.error('Failed to get AI feedback:', error);
      let errorMessage = 'Failed to get AI feedback. Please try again.';
      
      if (error?.response?.data) {
        const apiError = error.response.data;
        if (apiError.errorMessages && apiError.errorMessages.length > 0) {
          errorMessage = apiError.errorMessages.join(', ');
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showErrorToast('Error', errorMessage);
    } finally {
      setLoadingAiFeedback(false);
    }
  };

  /**
   * Serialize feedback data to JSON string
   */
  const serializeFeedback = (feedbackData: FeedbackData): string => {
    return JSON.stringify(feedbackData);
  };

  /**
   * Deserialize JSON string to feedback data
   * Returns null if feedback is not JSON format
   */
  const deserializeFeedback = (feedbackText: string): FeedbackData | null => {
    if (!feedbackText || feedbackText.trim() === '') {
      return {
        overallFeedback: '',
        strengths: '',
        weaknesses: '',
        codeQuality: '',
        algorithmEfficiency: '',
        suggestionsForImprovement: '',
        bestPractices: '',
        errorHandling: '',
      };
    }

    try {
      const parsed = JSON.parse(feedbackText);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          overallFeedback: parsed.overallFeedback || '',
          strengths: parsed.strengths || '',
          weaknesses: parsed.weaknesses || '',
          codeQuality: parsed.codeQuality || '',
          algorithmEfficiency: parsed.algorithmEfficiency || '',
          suggestionsForImprovement: parsed.suggestionsForImprovement || '',
          bestPractices: parsed.bestPractices || '',
          errorHandling: parsed.errorHandling || '',
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const fetchFeedbackFromAPI = async (submissionId: number) => {
    try {
      setLoadingFeedback(true);
      const feedbackList = await submissionFeedbackService.getSubmissionFeedbackList({
        submissionId: submissionId, // Use latest submission ID
      });

      if (feedbackList.length > 0) {
        const existingFeedback = feedbackList[0];
        setCurrentFeedback(existingFeedback);
        
        // Try to deserialize feedback
        let parsedFeedback = deserializeFeedback(existingFeedback.feedbackText);
        
        // If deserialize returns null, it means it's plain text/markdown
        // Use Gemini to parse it into structured format
        if (parsedFeedback === null) {
          try {
            parsedFeedback = await gradingService.getFormattedAiFeedback(submissionId, 'OpenAI'); // Use latest submission ID
          } catch (error: any) {
            console.error('Failed to parse feedback with Gemini:', error);
            // Fallback: put entire text into overallFeedback
            parsedFeedback = {
              overallFeedback: existingFeedback.feedbackText,
              strengths: '',
              weaknesses: '',
              codeQuality: '',
              algorithmEfficiency: '',
              suggestionsForImprovement: '',
              bestPractices: '',
              errorHandling: '',
            };
          }
        }
        
        if (parsedFeedback) {
          setFeedback(parsedFeedback);
        }
      } else {
        setCurrentFeedback(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch feedback:', error);
      // Don't show error to user, just log it
    } finally {
      setLoadingFeedback(false);
    }
  };

  /**
   * Save or update feedback
   */
  const saveFeedback = async (feedbackData: FeedbackData) => {
    if (!submission || !submission.id) {
      throw new Error('No submission selected');
    }

    const feedbackText = serializeFeedback(feedbackData);

    if (currentFeedback) {
      // Update existing feedback
      await submissionFeedbackService.updateSubmissionFeedback(currentFeedback.id, {
        feedbackText: feedbackText,
      });
    } else {
      // Create new feedback - use latest submission ID
      const newFeedback = await submissionFeedbackService.createSubmissionFeedback({
        submissionId: submission.id,
        feedbackText: feedbackText,
      });
      setCurrentFeedback(newFeedback);
    }
  };

  /**
   * Save feedback manually (when user edits feedback fields)
   */
  const handleSaveFeedback = async () => {
    if (!submission || !submission.id) {
      showErrorToast('Error', 'No submission selected');
      return;
    }

    try {
      setSavingFeedback(true);
      await saveFeedback(feedback);
      showSuccessToast('Success', 'Feedback saved successfully');
    } catch (error: any) {
      console.error('Failed to save feedback:', error);
      showErrorToast('Error', error?.message || 'Failed to save feedback');
    } finally {
      setSavingFeedback(false);
    }
  };


  const handleOpenGradingHistory = async () => {
    if (!submission || !submission.id) {
      showErrorToast('Error', 'No submission selected');
      return;
    }

    setGradingHistoryModalVisible(true);
    await fetchGradingHistory();
  };

  const fetchGradingHistory = async () => {
    if (!submission || !submission.id) {
      return;
    }

    try {
      setLoadingGradingHistory(true);
      
      const result = await gradingService.getGradingSessions({
        submissionId: submission.id, // Use latest submission ID
        pageNumber: 1,
        pageSize: 1000,
      });
      
      if (result && result.items && result.items.length > 0) {
        const sortedHistory = [...result.items].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        
        setGradingHistory(sortedHistory);
      } else {
        setGradingHistory([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch grading history:', err);
      showErrorToast('Error', err?.message || 'Failed to load grading history');
      setGradingHistory([]);
    } finally {
      setLoadingGradingHistory(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup polling interval on unmount
      if (autoGradingPollIntervalRef.current) {
        clearInterval(autoGradingPollIntervalRef.current);
        autoGradingPollIntervalRef.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <AppSafeView>
        <View style={styles.headerContainer}>
          <ScreenHeader title={assignmentTitle} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  // Sample data for demo when no submission found
  const sampleSubmission: Submission | null = !submission ? {
    id: 1,
    studentId: 1,
    studentName: 'Nguyen Van A',
    studentCode: 'SE12345',
    submittedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    status: 1,
    lastGrade: 0,
    submissionFile: {
      id: 1,
      name: 'assignment_submission.zip',
      submissionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  } : null;

  const displaySubmission = submission || sampleSubmission;

  if (!displaySubmission) {
    return (
      <AppSafeView>
        <View style={styles.headerContainer}>
          <ScreenHeader title={assignmentTitle} />
        </View>
        <View style={styles.emptyContainer}>
          <AppText>Submission not found</AppText>
        </View>
      </AppSafeView>
    );
  }

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
        criteria: (q.rubrics || []).map((rubric) => {
          const rubricScore = (q.rubricScores && q.rubricScores[rubric.id]) || 0;
          const questionComment = q.rubricComments?.[q.id] || '';
          return {
            id: rubric?.id || 0,
            description: rubric?.description || '',
            maxScore: rubric?.score || 0,
            currentScore: rubricScore,
            comment: questionComment,
          };
        }),
      };
    });

  return (
    <AppSafeView>
      <View style={styles.headerContainer}>
        <ScreenHeader
          title={assignmentTitle}
          onRightIconPress={handleOpenGradingHistory}
          rightIcon={<HistoryIcon fill={AppColors.pr500} stroke={AppColors.pr500} />}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: vs(20) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Submission Info */}
        <SectionHeader
          title={`File Submit - ${displaySubmission.studentName || 'Unknown'} - ${displaySubmission.studentCode || 'N/A'}`}
          style={{ marginBottom: vs(20), marginTop: vs(10) }}
        />
        {displaySubmission.submissionFile && (
          <CurriculumItem
            id={1}
            number={'01'}
            title={'File Submit'}
            linkFile={displaySubmission.submissionFile.name}
            rightIcon={<DownloadIcon />}
            detailNavigation={''}
            onAction={() => handleDownloadFile(displaySubmission.submissionFile!)}
          />
        )}

        {/* Submission Details */}
        <View style={styles.infoCard}>
          <AppText variant="body12pxRegular" style={styles.infoLabel}>
            Submission ID: {displaySubmission.id}
          </AppText>
          <AppText variant="body12pxRegular" style={styles.infoLabel}>
            Submitted At:{' '}
            {displaySubmission.submittedAt
              ? dayjs(displaySubmission.submittedAt).format('YYYY-MM-DD HH:mm')
              : 'N/A'}
          </AppText>
        </View>

        {/* Questions */}
        <SectionHeader title="Score" style={{ marginBottom: vs(10), marginTop: vs(20) }} />

        {questionsForDisplay.map((question, index) => (
          <ScoreQuestionAccordion
            key={question.id}
            question={question}
            index={index}
            isExpanded={expandedQuestionId === question.id}
            onToggle={() =>
              setExpandedQuestionId(prevId => (prevId === question.id ? null : question.id))
            }
            control={control}
            editable={!isSemesterPassed}
          />
        ))}

        {/* Total Score */}
        <View style={styles.totalGradeBar}>
          <AppText variant="label16pxBold">Total Grade</AppText>
          <View style={styles.totalScoreBadge}>
            <AppText variant="body14pxBold" style={{ color: AppColors.pr500 }}>
              {totalScore.toFixed(2)}/{questions.reduce((sum, q) => {
                return sum + q.rubrics.reduce((rubricSum, rubric) => rubricSum + (rubric?.score || 0), 0);
              }, 0).toFixed(2)}
            </AppText>
          </View>
        </View>

        {/* Feedback Section - Collapsible like web */}
        <CollapsibleSection
          title="Detailed Feedback"
          defaultExpanded={false}
          style={{ marginTop: vs(20) }}
        >
          <AppText variant="body12pxRegular" style={{ color: AppColors.n600, marginBottom: vs(16) }}>
            Provide comprehensive feedback for the student's submission
          </AppText>
          
          {/* Overall Feedback */}
          <View style={styles.feedbackField}>
            <AppText variant="label14pxBold" style={styles.feedbackLabel}>
              Overall Feedback
            </AppText>
            <TextInput
              style={styles.feedbackTextInput}
              multiline
              numberOfLines={6}
              value={feedback.overallFeedback}
              onChangeText={(text) => setFeedback(prev => ({ ...prev, overallFeedback: text }))}
              placeholder="Enter overall feedback..."
              editable={!isSemesterPassed}
            />
          </View>

          {/* Two column layout for other fields */}
          <View style={styles.feedbackRow}>
            <View style={styles.feedbackFieldHalf}>
              <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                Strengths
              </AppText>
              <TextInput
                style={styles.feedbackTextInput}
                multiline
                numberOfLines={8}
                value={feedback.strengths}
                onChangeText={(text) => setFeedback(prev => ({ ...prev, strengths: text }))}
                placeholder="Enter strengths..."
                editable={!isSemesterPassed}
              />
            </View>
            <View style={styles.feedbackFieldHalf}>
              <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                Weaknesses
              </AppText>
              <TextInput
                style={styles.feedbackTextInput}
                multiline
                numberOfLines={8}
                value={feedback.weaknesses}
                onChangeText={(text) => setFeedback(prev => ({ ...prev, weaknesses: text }))}
                placeholder="Enter weaknesses..."
                editable={!isSemesterPassed}
              />
            </View>
          </View>

          <View style={styles.feedbackRow}>
            <View style={styles.feedbackFieldHalf}>
              <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                Code Quality
              </AppText>
              <TextInput
                style={styles.feedbackTextInput}
                multiline
                numberOfLines={6}
                value={feedback.codeQuality}
                onChangeText={(text) => setFeedback(prev => ({ ...prev, codeQuality: text }))}
                placeholder="Enter code quality assessment..."
                editable={!isSemesterPassed}
              />
            </View>
            <View style={styles.feedbackFieldHalf}>
              <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                Algorithm Efficiency
              </AppText>
              <TextInput
                style={styles.feedbackTextInput}
                multiline
                numberOfLines={6}
                value={feedback.algorithmEfficiency}
                onChangeText={(text) => setFeedback(prev => ({ ...prev, algorithmEfficiency: text }))}
                placeholder="Enter algorithm efficiency assessment..."
                editable={!isSemesterPassed}
              />
            </View>
          </View>

          {/* Suggestions for Improvement - Full width */}
          <View style={styles.feedbackField}>
            <AppText variant="label14pxBold" style={styles.feedbackLabel}>
              Suggestions for Improvement
            </AppText>
            <TextInput
              style={styles.feedbackTextInput}
              multiline
              numberOfLines={6}
              value={feedback.suggestionsForImprovement}
              onChangeText={(text) => setFeedback(prev => ({ ...prev, suggestionsForImprovement: text }))}
              placeholder="Enter suggestions for improvement..."
              editable={!isSemesterPassed}
            />
          </View>

          <View style={styles.feedbackRow}>
            <View style={styles.feedbackFieldHalf}>
              <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                Best Practices
              </AppText>
              <TextInput
                style={styles.feedbackTextInput}
                multiline
                numberOfLines={5}
                value={feedback.bestPractices}
                onChangeText={(text) => setFeedback(prev => ({ ...prev, bestPractices: text }))}
                placeholder="Enter best practices comments..."
                editable={!isSemesterPassed}
              />
            </View>
            <View style={styles.feedbackFieldHalf}>
              <AppText variant="label14pxBold" style={styles.feedbackLabel}>
                Error Handling
              </AppText>
              <TextInput
                style={styles.feedbackTextInput}
                multiline
                numberOfLines={5}
                value={feedback.errorHandling}
                onChangeText={(text) => setFeedback(prev => ({ ...prev, errorHandling: text }))}
                placeholder="Enter error handling assessment..."
                editable={!isSemesterPassed}
              />
            </View>
          </View>
        </CollapsibleSection>

        {/* Action Buttons - 2 buttons per row */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <AppButton
              title="Save Grade"
              onPress={handleSave}
              loading={isSaving}
              disabled={isSemesterPassed}
              style={styles.saveButton}
              textVariant="body14pxRegular"
            />
            <AppButton
              title="Auto Grade"
              onPress={handleAutoGrading}
              loading={autoGradingLoading}
              style={styles.autoGradeButton}
              textVariant="body14pxRegular"
              variant="secondary"
              textColor={AppColors.black}
            />
          </View>
          <View style={styles.buttonRow}>
            <AppButton
              title="AI Feedback"
              onPress={handleGetAiFeedback}
              loading={loadingAiFeedback}
              style={styles.aiFeedbackButton}
              textVariant="body14pxRegular"
              variant="secondary"
              textColor={AppColors.black}
            />
            <AppButton
              title="Save Feedback"
              onPress={handleSaveFeedback}
              loading={savingFeedback}
              disabled={savingFeedback || loadingFeedback || isSemesterPassed}
              style={styles.feedbackSaveButtonMain}
              textVariant="body14pxRegular"
              variant="primary"
            />
          </View>
        </View>
      </ScrollView>

      {/* Grading History Modal */}
      <Modal
        visible={gradingHistoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setGradingHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="label16pxBold">Grading History</AppText>
              <TouchableOpacity onPress={() => setGradingHistoryModalVisible(false)}>
                <AppText variant="body14pxBold" style={{ color: AppColors.pr500 }}>Close</AppText>
              </TouchableOpacity>
            </View>
            
            {loadingGradingHistory ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color={AppColors.pr500} />
              </View>
            ) : gradingHistory.length === 0 ? (
              <View style={styles.modalEmptyContainer}>
                <AppText>No grading history found</AppText>
              </View>
            ) : (
              <ScrollView style={styles.modalList} nestedScrollEnabled>
                {gradingHistory.map((session) => {
                  const isExpanded = expandedGradingHistorySessions.has(session.id);
                  const gradeItems = sessionGradeItems[session.id] || [];
                  const totalScore = gradeItems.reduce((sum, item) => sum + item.score, 0);

                  const getGradingTypeLabel = (type: number) => {
                    switch (type) {
                      case 0: return 'AI';
                      case 1: return 'LECTURER';
                      case 2: return 'BOTH';
                      default: return 'UNKNOWN';
                    }
                  };

                  const getStatusLabel = (status: number) => {
                    switch (status) {
                      case 0: return 'PROCESSING';
                      case 1: return 'COMPLETED';
                      case 2: return 'FAILED';
                      default: return 'UNKNOWN';
                    }
                  };

                  const getStatusColor = (status: number) => {
                    switch (status) {
                      case 0: return AppColors.b500;
                      case 1: return AppColors.g500;
                      case 2: return AppColors.r500;
                      default: return AppColors.n600;
                    }
                  };

                  const handleExpandSession = async (sessionId: number) => {
                    const newExpanded = new Set(expandedGradingHistorySessions);
                    const isCurrentlyExpanded = newExpanded.has(sessionId);
                    
                    if (isCurrentlyExpanded) {
                      newExpanded.delete(sessionId);
                      setExpandedGradingHistorySessions(newExpanded);
                      return;
                    }

                    // Expand - fetch or use cached data
                    if (sessionGradeItems[sessionId]) {
                      newExpanded.add(sessionId);
                      setExpandedGradingHistorySessions(newExpanded);
                      return;
                    }

                    // Fetch grade items for this session
                    try {
                      const result = await gradeItemService.getGradeItems({
                        gradingSessionId: sessionId,
                        pageNumber: 1,
                        pageSize: 1000,
                      });
                      
                      setSessionGradeItems((prev) => ({
                        ...prev,
                        [sessionId]: result.items,
                      }));
                      
                      newExpanded.add(sessionId);
                      setExpandedGradingHistorySessions(newExpanded);
                    } catch (err: any) {
                      console.error('Failed to fetch grade items:', err);
                      showErrorToast('Error', 'Failed to load grade items');
                    }
                  };

                  return (
                    <View key={session.id} style={styles.historyItem}>
                      <TouchableOpacity
                        style={styles.historyItemHeader}
                        onPress={() => handleExpandSession(session.id)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <AppText variant="body14pxBold" style={{ marginBottom: vs(6) }}>Session #{session.id}</AppText>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: s(6), marginBottom: vs(4) }}>
                            <View style={[styles.statusTag, { backgroundColor: getStatusColor(session.status) + '20' }]}>
                              <AppText variant="body12pxRegular" style={{ color: getStatusColor(session.status) }}>
                                {getStatusLabel(session.status)}
                              </AppText>
                            </View>
                            <View style={[styles.typeTag, { backgroundColor: AppColors.n200 }]}>
                              <AppText variant="body12pxRegular" style={{ color: AppColors.n700 }}>
                                {getGradingTypeLabel(session.gradingType)}
                              </AppText>
                            </View>
                            <View style={[styles.gradeTag, { backgroundColor: AppColors.b100 }]}>
                              <AppText variant="body12pxRegular" style={{ color: AppColors.b500 }}>
                                Grade: {session.grade.toFixed(2)}
                              </AppText>
                            </View>
                            {gradeItems.length > 0 && (
                              <View style={[styles.totalTag, { backgroundColor: AppColors.g100 }]}>
                                <AppText variant="body12pxRegular" style={{ color: AppColors.g500 }}>
                                  Total: {gradeItems.reduce((sum, item) => sum + item.score, 0).toFixed(2)}
                                </AppText>
                              </View>
                            )}
                          </View>
                          <AppText variant="body12pxRegular" style={{ color: AppColors.n600 }}>
                            {toVietnamTime(session.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                          </AppText>
                        </View>
                        <Feather
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={s(20)}
                          color={AppColors.n600}
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.historyItemContent}>
                          <View style={styles.sessionDetails}>
                            <View style={styles.detailRow}>
                              <AppText variant="body12pxRegular" style={styles.detailLabel}>
                                Grading Session ID:
                              </AppText>
                              <AppText variant="body12pxRegular">{session.id}</AppText>
                            </View>
                            <View style={styles.detailRow}>
                              <AppText variant="body12pxRegular" style={styles.detailLabel}>
                                Grade Item Count:
                              </AppText>
                              <AppText variant="body12pxRegular">{session.gradeItemCount || gradeItems.length}</AppText>
                            </View>
                            <View style={styles.detailRow}>
                              <AppText variant="body12pxRegular" style={styles.detailLabel}>
                                Updated At:
                              </AppText>
                              <AppText variant="body12pxRegular">
                                {toVietnamTime(session.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                              </AppText>
                            </View>
                          </View>

                          {gradeItems.length === 0 ? (
                            <AppText variant="body12pxRegular" style={{ color: AppColors.n600, marginTop: vs(10) }}>
                              No grade items
                            </AppText>
                          ) : (
                            <View style={styles.gradeItemsContainer}>
                              <AppText variant="label14pxBold" style={{ marginBottom: vs(8) }}>
                                Grade Items ({gradeItems.length})
                              </AppText>
                              {gradeItems.map((item, idx) => (
                                <View key={item.id} style={styles.gradeItemRow}>
                                  <View style={styles.gradeItemInfo}>
                                    <AppText variant="body12pxRegular" style={{ flex: 1 }}>
                                      {item.rubricItemDescription || `Item ${idx + 1}`}
                                    </AppText>
                                    <View style={styles.gradeItemScores}>
                                      <View style={[styles.scoreTag, { backgroundColor: AppColors.b100 }]}>
                                        <AppText variant="body12pxRegular" style={{ color: AppColors.b500 }}>
                                          Max: {item.rubricItemMaxScore}
                                        </AppText>
                                      </View>
                                      <View style={[styles.scoreTag, { backgroundColor: item.score > 0 ? AppColors.g100 : AppColors.n200 }]}>
                                        <AppText variant="body12pxRegular" style={{ color: item.score > 0 ? AppColors.g500 : AppColors.n600 }}>
                                          Score: {item.score.toFixed(2)}
                                        </AppText>
                                      </View>
                                    </View>
                                  </View>
                                  {item.comments && (
                                    <AppText variant="body12pxRegular" style={{ color: AppColors.n600, marginTop: vs(4) }}>
                                      Comments: {item.comments}
                                    </AppText>
                                  )}
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </AppSafeView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: vs(10),
  },
  container: {
    flex: 1,
    paddingHorizontal: s(25),
    paddingTop: vs(10),
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
  infoCard: {
    backgroundColor: AppColors.n100,
    borderRadius: s(8),
    padding: s(12),
    marginBottom: vs(16),
  },
  infoLabel: {
    color: AppColors.n700,
    marginBottom: vs(4),
  },
  totalGradeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.n100,
    borderRadius: s(12),
    padding: s(15),
    marginTop: vs(10),
  },
  totalScoreBadge: {
    backgroundColor: AppColors.pr100,
    paddingHorizontal: s(12),
    paddingVertical: vs(5),
    borderRadius: s(6),
  },
  buttonContainer: {
    marginTop: vs(25),
    marginBottom: vs(20),
    gap: vs(10),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: s(10),
    marginBottom: vs(10),
  },
  saveButton: {
    flex: 1,
    minWidth: 0,
  },
  autoGradeButton: {
    flex: 1,
    minWidth: 0,
  },
  aiFeedbackButton: {
    flex: 1,
    minWidth: 0,
  },
  feedbackSaveButtonMain: {
    flex: 1,
    minWidth: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    width: '90%',
    maxHeight: '80%',
    padding: s(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(20),
    paddingBottom: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  modalLoadingContainer: {
    padding: vs(40),
    alignItems: 'center',
  },
  modalEmptyContainer: {
    padding: vs(40),
    alignItems: 'center',
  },
  modalList: {
    maxHeight: vs(400),
  },
  historyItem: {
    padding: s(15),
    marginBottom: vs(10),
    backgroundColor: AppColors.n100,
    borderRadius: s(8),
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(12),
  },
  historyItemContent: {
    padding: s(12),
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: AppColors.n200,
  },
  statusTag: {
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: s(4),
    marginLeft: s(8),
  },
  typeTag: {
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: s(4),
    marginLeft: s(8),
  },
  gradeTag: {
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: s(4),
    marginLeft: s(8),
  },
  totalTag: {
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: s(4),
    marginLeft: s(8),
  },
  sessionDetails: {
    marginBottom: vs(12),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(4),
  },
  detailLabel: {
    color: AppColors.n600,
    fontWeight: '600',
  },
  gradeItemsContainer: {
    marginTop: vs(8),
  },
  gradeItemRow: {
    padding: s(12),
    marginBottom: vs(8),
    backgroundColor: AppColors.n100,
    borderRadius: s(8),
  },
  gradeItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeItemScores: {
    flexDirection: 'row',
    gap: s(8),
  },
  scoreTag: {
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: s(4),
  },
  feedbackField: {
    marginBottom: vs(16),
  },
  feedbackFieldHalf: {
    flex: 1,
    marginBottom: vs(16),
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: s(16),
    marginBottom: vs(16),
  },
  feedbackLabel: {
    marginBottom: vs(8),
    color: AppColors.n900,
  },
  feedbackTextInput: {
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(8),
    padding: s(12),
    fontSize: s(14),
    color: AppColors.n900,
    textAlignVertical: 'top',
    minHeight: vs(100),
    backgroundColor: AppColors.white,
  },
});

export default AssignmentGradingScreen;

