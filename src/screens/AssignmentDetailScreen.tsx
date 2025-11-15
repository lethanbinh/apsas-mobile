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
import ScreenHeader from '../components/common/ScreenHeader';
import AssignmentCardInfo from '../components/courses/AssignmentCardInfo';
import CurriculumList from '../components/courses/CurriculumList';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { DocumentList } from '../data/coursesData';
import { RootState } from '../store/store';
import { AppColors } from '../styles/color';
import { useGetCurrentStudentId } from '../hooks/useGetCurrentStudentId';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const userProfile = useSelector(
    (state: RootState) => state.userSlice.profile,
  );
  const { studentId } = useGetCurrentStudentId();

  useEffect(() => {
    setIsMounted(true);
    if (!elementId) {
      showErrorToast('Error', 'No Assignment ID provided.');
      setIsLoading(false);
      return;
    }
    const loadDetails = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        const element = await fetchCourseElementById(elementId);
        if (!isMounted) return;
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

        // Fetch class assessment to get deadline
        if (classId && foundTemplate) {
          try {
            const classAssessmentsRes = await getClassAssessments({
              classId: Number(classId),
              assessmentTemplateId: foundTemplate.id,
              pageNumber: 1,
              pageSize: 1000,
            });
            const relevantAssessment = (classAssessmentsRes?.items || []).find(
              ca => ca && ca.courseElementId === Number(elementId),
            );
            if (!isMounted) return;
            if (relevantAssessment) {
              setClassAssessment(relevantAssessment);

              // Fetch latest submission for this student
              if (studentId) {
                try {
                  const submissions = await getSubmissionList({
                    classAssessmentId: relevantAssessment.id,
                    studentId: studentId,
                  });
                  if (submissions && submissions.length > 0) {
                    const sorted = submissions
                      .filter(s => s && s.submittedAt)
                      .sort((a, b) => {
                        if (!a.submittedAt || !b.submittedAt) return 0;
                        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
                      });
                    if (!isMounted) return;
                    if (sorted.length > 0 && sorted[0]) {
                      setLatestSubmission(sorted[0]);
                    }
                  }
                } catch (err) {
                  console.error('Failed to fetch submissions:', err);
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

  const navigateToRequirement = () => {
    if (templateData) {
      navigation.navigate('RequirementScreen', {
        assessmentTemplate: templateData,
      });
    } else {
      showErrorToast(
        'Error',
        'No requirement details found for this assignment.',
      );
    }
  };

  const dynamicDocumentList = DocumentList.map(item => {
    if (item.title === 'Requirement') {
      return {
        ...item,
        detailNavigation: undefined,
        onPress: navigateToRequirement,
      };
    }
    return item;
  });

  // Build submission list dynamically
  const submissionListData = latestSubmission && latestSubmission.id
    ? [
        {
          id: latestSubmission.id,
          number: '01',
          title: 'Your Submission',
          linkFile: latestSubmission.submissionFile?.name || 'submission.zip',
          rightIcon: null,
          detailNavigation: 'ScoreDetailScreen',
          onAction: () => {
            if (latestSubmission.id) {
              navigation.navigate('ScoreDetailScreen', {
                submissionId: latestSubmission.id,
              });
            }
          },
        },
      ]
    : [];

  const sections = [
    { title: 'Documents', data: dynamicDocumentList },
    ...(submissionListData.length > 0 ? [{ title: 'Submissions', data: submissionListData }] : []),
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
          dueDate={classAssessment?.endAt ? dayjs(classAssessment.endAt).format('YYYY-MM-DD HH:mm') : 'N/A'}
          lecturerName={classAssessment?.lecturerName || userProfile?.fullName || 'Lecturer'}
          description={elementData.description}
          isSubmitted={!!latestSubmission}
          onSubmitPress={() => {
            if (elementData?.id) {
              navigation.navigate('SubmissionScreen', {
                elementId: elementData.id,
                classAssessmentId: classAssessment?.id,
              });
            }
          }}
          isAssessment={false}
        />
        <View />
        <View
          style={{ position: 'absolute', top: s(320), width: '100%' }}
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
