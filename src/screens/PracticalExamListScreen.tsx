import React, { useState, useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Tabs, { TabType } from '../components/common/Tabs';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import SubmissionItem from '../components/score/SubmissionItem';
import AppText from '../components/texts/AppText';
import { AppColors } from '../styles/color';
import { showErrorToast } from '../components/toasts/AppToast';
import { fetchCourseElements, CourseElementData } from '../api/courseElementService';
import { fetchClassById, ClassData } from '../api/class';
import { assessmentTemplateService } from '../api/assessmentTemplateServiceWrapper';
import { getClassAssessments } from '../api/classAssessmentService';
import { getSubmissionList, Submission } from '../api/submissionService';
import { fetchAssignRequestList } from '../api/assignRequestService';
import dayjs from 'dayjs';

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
    'thực hành',
  ];
  return keywords.some(keyword => name.includes(keyword));
}

interface ExamWithSubmissions {
  exam: CourseElementData;
  templateId?: number;
  classAssessmentId?: number;
  submissions: Submission[];
  submissionCount: number;
}

const PracticalExamListScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ongoing');
  const navigation = useNavigation<any>();
  const route = useRoute();
  const classId = (route.params as { classId?: string })?.classId;

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [exams, setExams] = useState<ExamWithSubmissions[]>([]);
  const [classData, setClassData] = useState<ClassData | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const fetchData = async () => {
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
        // Fetch class data
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
            setExams([]);
            setIsLoading(false);
          }
          return;
        }

        // Fetch all course elements
        const allElements = await fetchCourseElements();
        if (!isMounted) return;
        
        // Filter practical exams for this class's semester course
        const practicalExams = (allElements || []).filter(
          el =>
            el &&
            el.id &&
            el.semesterCourseId &&
            el.semesterCourseId.toString() === classInfo.semesterCourseId.toString() &&
            isPracticalExam(el),
        );

        // Fetch assign requests to get approved ones (status = 5)
        const assignRequestResponse = await fetchAssignRequestList(
          null,
          null,
          1,
          1000,
        );
        const approvedAssignRequests = (assignRequestResponse?.items || []).filter(
          ar => ar && ar.status === 5,
        );
        const approvedAssignRequestIds = new Set(
          approvedAssignRequests.filter(ar => ar && ar.id).map(ar => ar.id)
        );

        // Fetch assessment templates
        const templateResponse = await assessmentTemplateService.getAssessmentTemplates({
          pageNumber: 1,
          pageSize: 1000,
        });
        const approvedTemplates = (templateResponse?.items || []).filter(
          t => t && t.assignRequestId && approvedAssignRequestIds.has(t.assignRequestId),
        );
        const templateMap = new Map<number, number>(); // courseElementId -> templateId
        approvedTemplates.forEach(t => {
          if (t && t.courseElementId && t.id) {
            templateMap.set(t.courseElementId, t.id);
          }
        });

        // Fetch class assessments
        const classAssessmentRes = await getClassAssessments({
          classId: Number(selectedClassId),
          pageNumber: 1,
          pageSize: 1000,
        });
        const assessmentMap = new Map<number, number>(); // courseElementId -> classAssessmentId
        (classAssessmentRes?.items || []).forEach(ca => {
          if (ca && ca.courseElementId && ca.id) {
            assessmentMap.set(ca.courseElementId, ca.id);
          }
        });

        // Fetch submissions for class assessments
        const classAssessmentIds = Array.from(assessmentMap.values());
        const submissionsByCourseElement = new Map<number, Submission[]>();

        if (classAssessmentIds.length > 0) {
          const submissionPromises = classAssessmentIds.map(caId =>
            getSubmissionList({ classAssessmentId: caId }).catch(() => []),
          );
          const submissionArrays = await Promise.all(submissionPromises);
          const allSubmissions = submissionArrays.flat();

          // Group submissions by course element and get latest per student
          for (const submission of allSubmissions) {
            if (!submission || !submission.classAssessmentId) continue;
            const classAssessment = (classAssessmentRes?.items || []).find(
              ca => ca && ca.id === submission.classAssessmentId,
            );
            if (classAssessment?.courseElementId) {
              const existing = submissionsByCourseElement.get(classAssessment.courseElementId) || [];
              existing.push(submission);
              submissionsByCourseElement.set(classAssessment.courseElementId, existing);
            }
          }

          // Sort and deduplicate by student (keep latest)
          for (const [courseElementId, subs] of submissionsByCourseElement.entries()) {
            const studentSubmissions = new Map<number, Submission>();
            for (const sub of subs) {
              if (!sub || !sub.studentId || !sub.submittedAt) continue;
              const existing = studentSubmissions.get(sub.studentId);
              if (
                !existing ||
                (existing.submittedAt && new Date(sub.submittedAt).getTime() > new Date(existing.submittedAt).getTime())
              ) {
                studentSubmissions.set(sub.studentId, sub);
              }
            }
            const latestSubs = Array.from(studentSubmissions.values())
              .filter(s => s && s.submittedAt)
              .sort(
                (a, b) => {
                  if (!a.submittedAt || !b.submittedAt) return 0;
                  return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
                }
              );
            submissionsByCourseElement.set(courseElementId, latestSubs);
          }
        }

        // Combine exams with their data
        const examsWithData: ExamWithSubmissions[] = practicalExams
          .filter(exam => exam && exam.id && exam.name)
          .map(exam => {
            if (!exam || !exam.id) return null;
            
            const templateId = templateMap.get(exam.id);
            const classAssessmentId = assessmentMap.get(exam.id);
            const submissions = (submissionsByCourseElement.get(exam.id) || []).filter(
              s => s && s.id
            );

            return {
              exam,
              templateId,
              classAssessmentId,
              submissions,
              submissionCount: submissions.length,
            };
          })
          .filter((item): item is ExamWithSubmissions => item !== null);

        if (!isMounted) return;
        setExams(examsWithData);
      } catch (error: any) {
        console.error('Failed to fetch practical exams:', error);
        if (isMounted) {
          showErrorToast('Error', error.message || 'Failed to load practical exams.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      setIsMounted(false);
    };
  }, [classId]);

  const categorizedExams = useMemo(() => {
    const now = new Date();
    const ongoing: ExamWithSubmissions[] = [];
    const ended: ExamWithSubmissions[] = [];
    const upcoming: ExamWithSubmissions[] = [];

    exams.forEach(examData => {
      // For now, categorize based on submission count and template existence
      // In a real implementation, you'd check exam dates
      if (examData.templateId && examData.submissionCount > 0) {
        ongoing.push(examData);
      } else if (examData.templateId) {
        upcoming.push(examData);
      } else {
        ended.push(examData);
      }
    });

    return { ongoing, ended, upcoming };
  }, [exams]);

  const renderList = (data: ExamWithSubmissions[]) => {
    if (data.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyText}>No exams found.</AppText>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        keyExtractor={item => item.exam.id.toString()}
        renderItem={({ item }) => {
          if (!item || !item.exam || !item.exam.id) return null;
          
          const handleNavigate = () => {
            try {
              if (item.exam && item.exam.id) {
                const targetClassId = classId || classData?.id;
                if (targetClassId) {
                  navigation.navigate('PracticalExamDetailScreen', {
                    elementId: String(item.exam.id),
                    classId: targetClassId,
                  });
                } else {
                  showErrorToast('Error', 'Class ID not available.');
                }
              }
            } catch (err) {
              console.error('Error navigating to exam detail:', err);
              showErrorToast('Error', 'Failed to open exam details.');
            }
          };
          
          return (
            <TouchableOpacity onPress={handleNavigate}>
              <SubmissionItem
                fileName={item.exam.name || 'Unknown Exam'}
                title={`${item.submissionCount} submission(s)`}
                onNavigate={handleNavigate}
              />
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: s(12) }} />}
        contentContainerStyle={{
          paddingBottom: s(40),
          paddingTop: s(20),
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <AppSafeView style={{ flex: 1 }}>
        <ScreenHeader title="Practical Exams" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView style={{ flex: 1 }}>
      <ScreenHeader title="Practical Exams" />
      <View style={{ flex: 1, paddingVertical: vs(20), paddingHorizontal: s(25) }}>
        <Tabs activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === 'ongoing' && renderList(categorizedExams.ongoing)}
        {activeTab === 'ended' && renderList(categorizedExams.ended)}
        {activeTab === 'upcoming' && renderList(categorizedExams.upcoming)}
      </View>
    </AppSafeView>
  );
};

export default PracticalExamListScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(40),
  },
  emptyText: {
    color: AppColors.n500,
    fontSize: s(14),
  },
});
