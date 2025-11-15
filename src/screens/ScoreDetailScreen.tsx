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
import { showErrorToast } from '../components/toasts/AppToast';
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

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [questions, setQuestions] = useState<QuestionWithRubrics[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const [lecturerName, setLecturerName] = useState<string>('Unknown');
  const [gradedAt, setGradedAt] = useState<string>('');

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
      // Fetch submission
      let foundSubmission: Submission | null = null;

      try {
        const allSubmissions = await getSubmissionList({});
        foundSubmission = (allSubmissions || []).find(s => s && s.id === submissionId) || null;
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

      if (!isMounted) return;
      setSubmission(foundSubmission);
      setTotalScore(foundSubmission?.lastGrade || 0);

      // Get lecturer name and graded date
      if (foundSubmission.gradingGroupId) {
        try {
          const gradingGroup = await getGradingGroupById(foundSubmission.gradingGroupId);
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

      if (!assessmentTemplateId && submission.classAssessmentId) {
        try {
          const classAssessments = await getClassAssessments({
            pageNumber: 1,
            pageSize: 1000,
          });
          const classAssessment = (classAssessments?.items || []).find(
            ca => ca && ca.id === submission.classAssessmentId,
          );
          if (classAssessment?.assessmentTemplateId) {
            assessmentTemplateId = classAssessment.assessmentTemplateId;
          }
        } catch (err) {
          console.error('Failed to fetch class assessment:', err);
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

          // Load saved scores from AsyncStorage
          const rubricScores: { [rubricId: number]: number } = {};
          (questionRubrics || []).forEach(rubric => {
            if (rubric && rubric.id) {
              rubricScores[rubric.id] = 0;
            }
          });

          try {
            if (submission && submission.id) {
              const savedScores = await AsyncStorage.getItem(`rubricScores_${submission.id}`);
              if (savedScores) {
                const parsed = JSON.parse(savedScores);
                if (parsed && question.id && parsed[question.id]) {
                  Object.assign(rubricScores, parsed[question.id]);
                }
              }
            }
          } catch (err) {
            console.error('Failed to load saved scores:', err);
          }

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
                submissionId: submission.id,
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
