import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Platform,
  Alert,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { PermissionsAndroid } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import * as yup from 'yup';
import { assessmentPaperService } from '../api/assessmentPaperServiceWrapper';
import { AssessmentQuestion, assessmentQuestionService } from '../api/assessmentQuestionServiceWrapper';
import { assessmentTemplateService } from '../api/assessmentTemplateServiceWrapper';
import { getClassAssessments } from '../api/classAssessmentService';
import { getGradingGroupById, getGradingGroups } from '../api/gradingGroupService';
import { RubricItem, rubricItemService } from '../api/rubricItemServiceWrapper';
import { getSubmissionList, Submission, updateSubmissionGrade } from '../api/submissionService';
import { CurriculumIcon, DownloadIcon, NavigationIcon } from '../assets/icons/courses';
import { CheckTickIcon, HistoryIcon } from '../assets/icons/icon';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import CourseCardItem from '../components/courses/CourseCardItem';
import CurriculumItem from '../components/courses/CurriculumItem';
import ScoreQuestionAccordion from '../components/scoring/ScoreQuestionAccordion';
import AppText from '../components/texts/AppText';
import { showErrorToast, showSuccessToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

interface QuestionWithRubrics extends AssessmentQuestion {
  rubrics: RubricItem[];
  rubricScores: { [rubricId: number]: number };
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
      // Fetch submission
      let foundSubmission: Submission | null = null;

      // Try to find submission from grading groups first
      try {
        const gradingGroups = await getGradingGroups({});
        for (const group of gradingGroups) {
          const submissions = await getSubmissionList({ gradingGroupId: group.id });
          const sub = submissions.find(s => s.id === submissionId);
          if (sub) {
            foundSubmission = sub;
            break;
          }
        }
      } catch (err) {
        console.error('Failed to fetch from grading groups:', err);
      }

      // Try to find from class assessments
      if (!foundSubmission) {
        try {
          const allSubmissions = await getSubmissionList({});
          foundSubmission = allSubmissions.find(s => s.id === submissionId) || null;
        } catch (err) {
          console.error('Failed to fetch all submissions:', err);
        }
      }

      if (!foundSubmission) {
        if (isMounted) {
          showErrorToast('Error', 'Submission not found');
          navigation.goBack();
        }
        return;
      }

      if (!isMounted) return;
      setSubmission(foundSubmission);
      setTotalScore(foundSubmission?.lastGrade || 0);

      // Check semester status (simplified - always allow editing for now)
      setIsSemesterPassed(false);

      // Load feedback from AsyncStorage
      try {
        const savedFeedback = await AsyncStorage.getItem(`feedback_${submissionId}`);
        if (savedFeedback) {
          setFeedback(JSON.parse(savedFeedback));
        }
      } catch (err) {
        console.error('Failed to load saved feedback:', err);
      }

      // Fetch questions and rubrics
      await fetchQuestionsAndRubrics(foundSubmission);
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

  const fetchQuestionsAndRubrics = async (submission: Submission | null) => {
    if (!isMounted || !submission) return;

    try {
      let assessmentTemplateId: number | null = null;

      // Try to get assessmentTemplateId from gradingGroupId
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

      // Try to get from classAssessmentId
      let classAssessment: any = null;
      if (!assessmentTemplateId && submission.classAssessmentId) {
        try {
          const classAssessments = await getClassAssessments({
            pageNumber: 1,
            pageSize: 1000,
          });
          classAssessment = (classAssessments?.items || []).find(
            ca => ca && ca.id === submission.classAssessmentId,
          );
          if (classAssessment?.assessmentTemplateId) {
            assessmentTemplateId = classAssessment.assessmentTemplateId;
          }
          // Set assignment title from classAssessment
          if (classAssessment?.name && isMounted) {
            setAssignmentTitle(classAssessment.name);
          }
        } catch (err) {
          console.error('Failed to fetch class assessment:', err);
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
      if (!classAssessment?.name && template?.name && isMounted) {
        setAssignmentTitle(template.name);
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

          // Initialize rubric scores
          const rubricScores: { [rubricId: number]: number } = {};
          questionRubrics.forEach(rubric => {
            rubricScores[rubric.id] = 0;
          });

          // Load saved scores if available
          try {
            const savedScores = await AsyncStorage.getItem(`rubricScores_${submission.id}`);
            if (savedScores) {
              const parsed = JSON.parse(savedScores);
              if (parsed[question.id]) {
                Object.assign(rubricScores, parsed[question.id]);
              }
            }
          } catch (err) {
            console.error('Failed to load saved scores:', err);
          }

          allQuestions.push({
            ...question,
            rubrics: questionRubrics,
            rubricScores,
          });
        }
      }

      if (!isMounted) return;

      // Sort questions by questionNumber
      const sortedQuestions = allQuestions.sort(
        (a, b) => (a.questionNumber || 0) - (b.questionNumber || 0),
      );

      setQuestions(sortedQuestions);

      // Initialize form values
      const formQuestions = sortedQuestions.map(q => ({
        criteria: (q.rubrics || []).map(rubric => ({
          score: String((q.rubricScores && q.rubricScores[rubric.id]) || 0),
          comment: '',
        })),
      }));
      if (formQuestions.length > 0) {
        setValue('questions', formQuestions);
      }

      // Calculate total score
      let calculatedTotal = 0;
      sortedQuestions.forEach(q => {
        if (q && q.rubricScores) {
          const questionTotal = Object.values(q.rubricScores).reduce(
            (sum, score) => sum + (score || 0),
            0,
          );
          calculatedTotal += questionTotal;
        }
      });
      if (calculatedTotal > 0) {
        setTotalScore(calculatedTotal);
      }

      // Set first question expanded
      if (sortedQuestions.length > 0 && sortedQuestions[0]?.id) {
        setExpandedQuestionId(sortedQuestions[0].id);
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

      // Save feedback to AsyncStorage
      await AsyncStorage.setItem(`feedback_${submission.id}`, JSON.stringify(feedback));

      // Save rubric scores to AsyncStorage
      const rubricScoresMap: { [questionId: number]: { [rubricId: number]: number } } = {};
      questions.forEach(q => {
        if (q && q.id && q.rubricScores) {
          rubricScoresMap[q.id] = q.rubricScores;
        }
      });
      await AsyncStorage.setItem(`rubricScores_${submission.id}`, JSON.stringify(rubricScoresMap));

      // Save total score
      await updateSubmissionGrade(submission.id, totalScore);
      showSuccessToast('Success', 'Grade and feedback saved successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error('Failed to save:', error);
      showErrorToast('Error', error.message || 'Failed to save grade');
    } finally {
      setIsSaving(false);
    }
  };

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
        criteria: (q.rubrics || []).map((rubric) => ({
          id: rubric?.id || 0,
          description: rubric?.description || '',
          maxScore: rubric?.score || 0,
          currentScore: (q.rubricScores && q.rubricScores[rubric.id]) || 0,
        })),
      };
    });

  return (
    <AppSafeView>
      <View style={styles.headerContainer}>
        <ScreenHeader
          title={assignmentTitle}
          onRightIconPress={() => navigation.navigate('GradingHistoryScreen' as never)}
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
              {totalScore.toFixed(1)}/100
            </AppText>
          </View>
        </View>

        {/* Feedback */}
        <CourseCardItem
          title={'Feedback'}
          leftIcon={<CurriculumIcon />}
          backGroundColor={AppColors.b100}
          rightIcon={<NavigationIcon color={AppColors.b500} />}
          linkTo={'FeedbackTeacherScreen'}
          style={{ marginTop: vs(25) }}
        />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <AppButton
            title="Save Grade"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSemesterPassed}
            style={styles.saveButton}
            textVariant="body14pxRegular"
            leftIcon={<CheckTickIcon />}
          />
          <AppButton
            title="Auto Grade"
            onPress={() => {
              // TODO: Implement auto grade
              showErrorToast('Info', 'Auto grade feature coming soon');
            }}
            style={styles.autoGradeButton}
            textVariant="body14pxRegular"
            variant="secondary"
            textColor={AppColors.black}
            leftIcon={<CheckTickIcon color={AppColors.black} />}
          />
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(10),
    marginTop: vs(25),
  },
  saveButton: {
    width: s(120),
  },
  autoGradeButton: {
    width: s(120),
  },
});

export default AssignmentGradingScreen;

