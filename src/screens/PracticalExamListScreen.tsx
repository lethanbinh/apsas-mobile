import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { assessmentTemplateService } from '../api/assessmentTemplateServiceWrapper';
import { fetchAssignRequestList } from '../api/assignRequestService';
import { ClassData, fetchClassById } from '../api/class';
import { getClassAssessments } from '../api/classAssessmentService';
import { CourseElementData, fetchCourseElements } from '../api/courseElementService';
import { getSubmissionList, Submission } from '../api/submissionService';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

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
  return keywords.some(keyword => name.includes(keyword));
}

interface ExamItem {
  id: string;
  courseElementId: number;
  title: string;
  status: string;
  deadline: string | null;
  startAt: string | null;
  description: string;
  classAssessmentId?: number;
  assessmentTemplateId?: number;
  submissions: Submission[];
}

const PracticalExamListScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const classId = (route.params as { classId?: string })?.classId;
  const userProfile = useSelector((state: RootState) => state.userSlice.profile);
  const userRole = Array.isArray(userProfile?.role)
    ? userProfile?.role[0]?.toUpperCase()
    : userProfile?.role?.toUpperCase();

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const fetchData = async () => {
      let selectedClassId = classId;
      
      // If no classId in params, try to get from AsyncStorage
      if (!selectedClassId) {
        try {
          const stored = await AsyncStorage.getItem('selectedClassId');
          selectedClassId = stored || undefined;
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
            setExams([]);
            setIsLoading(false);
          }
          return;
        }

        // 2) Get all course elements and filter practical exams
        const allElements = await fetchCourseElements();
        if (!isMounted) return;
        
        const classExams = (allElements || []).filter(
          el =>
            el &&
            el.id &&
            el.semesterCourseId &&
            el.semesterCourseId.toString() === classInfo.semesterCourseId.toString() &&
            isPracticalExam(el),
        );

        // 3) Fetch assign requests to get approved ones (status = 5)
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

        // 4) Fetch assessment templates and filter by approved assign request IDs
        let approvedTemplateByCourseElementMap = new Map<number, any>();
        let approvedTemplateByIdMap = new Map<number, any>();
        try {
          const templateResponse = await assessmentTemplateService.getAssessmentTemplates({
            pageNumber: 1,
            pageSize: 1000,
          });
          // Only include templates with assignRequestId in approved assign requests (status = 5)
          const approvedTemplates = (templateResponse?.items || []).filter(t => {
            if (!t.assignRequestId) {
              return false; // Skip templates without assignRequestId
            }
            return approvedAssignRequestIds.has(t.assignRequestId);
          });
          
          // Create map by courseElementId for quick lookup
          approvedTemplates.forEach(t => {
            if (t && t.courseElementId && t.id) {
              approvedTemplateByCourseElementMap.set(t.courseElementId, t);
            }
            // Also create map by template id for quick lookup
            if (t && t.id) {
              approvedTemplateByIdMap.set(t.id, t);
            }
          });
        } catch (err) {
          console.error('Failed to fetch assessment templates:', err);
          // Continue without filtering if templates cannot be fetched
        }

        // 5) Fetch class assessments for this class
        let classAssessmentMap = new Map<number, any>();
        try {
          if (classInfo.id) {
            const classAssessmentRes = await getClassAssessments({
              classId: Number(classInfo.id),
              pageNumber: 1,
              pageSize: 1000,
            });
            if (!isMounted) return;
            
            for (const assessment of classAssessmentRes?.items || []) {
              if (assessment && assessment.courseElementId && assessment.id) {
                classAssessmentMap.set(assessment.courseElementId, assessment);
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch class assessments:', err);
          // Continue without class assessments
        }
        
        if (!isMounted) return;

        // 6) Fetch submissions for class assessments
        const classAssessmentIds = Array.from(classAssessmentMap.values()).map(ca => ca.id);
        const submissionsByCourseElement = new Map<number, Submission[]>();
        
        if (classAssessmentIds.length > 0) {
          try {
            // Fetch submissions for each class assessment
            const submissionPromises = classAssessmentIds.map(classAssessmentId =>
              getSubmissionList({ classAssessmentId: classAssessmentId }).catch(() => [])
            );
            const submissionArrays = await Promise.all(submissionPromises);
            const allSubmissions = submissionArrays.flat();
            
            // Map submissions by course element via class assessment
            for (const submission of allSubmissions) {
              const classAssessment = Array.from(classAssessmentMap.values()).find(ca => ca.id === submission.classAssessmentId);
              if (classAssessment && classAssessment.courseElementId) {
                const existing = submissionsByCourseElement.get(classAssessment.courseElementId) || [];
                existing.push(submission);
                submissionsByCourseElement.set(classAssessment.courseElementId, existing);
              }
            }
            
            // Sort submissions by submittedAt (most recent first) and get latest per student
            for (const [courseElementId, subs] of submissionsByCourseElement.entries()) {
              // Group by studentId and get latest submission for each student
              const studentSubmissions = new Map<number, Submission>();
              for (const sub of subs) {
                const existing = studentSubmissions.get(sub.studentId);
                if (!existing || new Date(sub.submittedAt) > new Date(existing.submittedAt)) {
                  studentSubmissions.set(sub.studentId, sub);
                }
              }
              // Convert back to array and sort by submittedAt
              const latestSubs = Array.from(studentSubmissions.values()).sort(
                (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
              );
              submissionsByCourseElement.set(courseElementId, latestSubs);
            }
          } catch (err) {
            console.error('Failed to fetch submissions:', err);
            // Continue without submissions
          }
        }

        // 7) Map all course elements to ExamItem
        // Logic same as web: 
        // 1. If classAssessment exists, find template by classAssessment.assessmentTemplateId in approved templates
        // 2. If no classAssessment or template not found, find template by courseElementId in approved templates
        // Only use classAssessment if approved template exists AND matches classAssessment's template
        const mappedExams: ExamItem[] = classExams
          .filter(el => el && el.id && el.name)
          .map((el): ExamItem | null => {
            if (!el || !el.id) return null;
            
            const classAssessment = classAssessmentMap.get(el.id);
            let approvedTemplate: any | undefined;
            
            // Find approved template (same logic as web)
            if (classAssessment?.assessmentTemplateId) {
              // First try: find template by classAssessment's assessmentTemplateId in approved templates
              approvedTemplate = approvedTemplateByIdMap.get(
                classAssessment.assessmentTemplateId,
              );
            }
            
            // Second try: if no template found via classAssessment, find by courseElementId
            if (!approvedTemplate) {
              approvedTemplate = approvedTemplateByCourseElementMap.get(el.id);
            }
            
            // Only use classAssessment if approved template exists AND matches classAssessment's template
            if (approvedTemplate) {
              // Use classAssessment only if it matches the approved template
              if (
                classAssessment?.assessmentTemplateId === approvedTemplate.id
              ) {
                return {
                  id: el.id.toString(),
                  courseElementId: el.id,
                  title: el.name || 'Exam',
                  status: classAssessment ? 'Active Exam' : 'No Approved Template',
                  deadline: classAssessment?.endAt || null,
                  startAt: classAssessment?.startAt || null,
                  description: el.description || 'No description available',
                  classAssessmentId: classAssessment?.id,
                  assessmentTemplateId: approvedTemplate.id,
                  submissions: submissionsByCourseElement.get(el.id) || [],
                };
              } else {
                // If approved template exists but classAssessment doesn't match, don't use classAssessment
                // But still show the course element (just without deadline)
                return {
                  id: el.id.toString(),
                  courseElementId: el.id,
                  title: el.name || 'Exam',
                  status: 'No Approved Template',
                  deadline: null,
                  startAt: null,
                  description: el.description || 'No description available',
                  assessmentTemplateId: approvedTemplate.id,
                  submissions: [],
                };
              }
            } else {
              // If no approved template found, don't use classAssessment
              return {
                id: el.id.toString(),
                courseElementId: el.id,
                title: el.name || 'Exam',
                status: 'No Approved Template',
                deadline: null,
                startAt: null,
                description: el.description || 'No description available',
                submissions: [],
              };
            }
          })
          .filter((item): item is ExamItem => item !== null);

        if (!isMounted) return;
        setExams(mappedExams);
        
        // Auto-expand first exam if available
        if (mappedExams.length > 0 && !expandedId) {
          setExpandedId(mappedExams[0].id);
        }
      } catch (err: any) {
        console.error('Failed to fetch exams:', err);
        if (isMounted) {
          showErrorToast('Error', err.message || 'Failed to load practical exams.');
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

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmissionClick = (submission: Submission) => {
    try {
      // Save submissionId to AsyncStorage for the grading page
      AsyncStorage.setItem('selectedSubmissionId', submission.id.toString());
      navigation.navigate('AssignmentGradingScreen');
    } catch (err) {
      console.error('Error navigating to grading:', err);
      showErrorToast('Error', 'Failed to open grading page.');
    }
  };

  const handleViewDetails = (exam: ExamItem) => {
    try {
      if (exam && exam.courseElementId && classData && classData.id) {
        // Navigate to different screens based on user role
        if (userRole === 'STUDENT') {
          navigation.navigate('PracticalExamDetailScreen', {
            elementId: String(exam.courseElementId),
            classId: classData.id,
          });
        } else {
          // Teacher or other roles
          navigation.navigate('PracticalExamDetailTeacherScreen', {
            elementId: String(exam.courseElementId),
            classId: classData.id,
          });
        }
      } else {
        showErrorToast('Error', 'Invalid exam data.');
      }
    } catch (err) {
      console.error('Error navigating to exam details:', err);
      showErrorToast('Error', 'Failed to open exam details.');
    }
  };

  const renderExam = (item: ExamItem) => {
    if (!item || !item.id) return null;
    
    const isExpanded = expandedId === item.id;
    const hasDeadline = !!item.deadline;
    let deadlineDate: dayjs.Dayjs | null = null;
    let isOverdue = false;
    
    try {
      if (item.deadline) {
        deadlineDate = dayjs(item.deadline);
        if (deadlineDate.isValid()) {
          const now = dayjs();
          isOverdue = now.isAfter(deadlineDate);
        }
      }
    } catch (err) {
      console.error('Error parsing deadline:', err);
    }

    return (
      <View style={styles.examCard} key={item.id}>
        <TouchableOpacity
          style={styles.examHeader}
          onPress={() => handleToggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.examHeaderContent}>
            <View style={styles.statusContainer}>
              <AppText
                variant="body12pxBold"
                style={[
                  styles.statusText,
                  item.status === 'Active Exam'
                    ? { color: '#E86A92' }
                    : { color: AppColors.n600 },
                ]}
              >
                {item.status}
              </AppText>
            </View>
            <AppText variant="body16pxBold" style={styles.examTitle}>
              {item.title}
            </AppText>
            {hasDeadline && deadlineDate && (
              <View style={styles.deadlineContainer}>
                <Feather
                  name="clock"
                  size={s(14)}
                  color={isOverdue ? AppColors.r500 : AppColors.n600}
                />
                <AppText
                  style={[
                    styles.deadlineText,
                    isOverdue && styles.deadlineTextOverdue,
                  ]}
                >
                  {deadlineDate.format('DD/MM/YYYY HH:mm')}
                </AppText>
              </View>
            )}
          </View>
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={s(20)}
            color={AppColors.n600}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.examContent}>
            <AppText style={styles.description}>{item.description}</AppText>

            {/* Submissions Section */}
            {item.submissions.length > 0 && (
              <View style={styles.submissionsSection}>
                <AppText variant="body14pxBold" style={styles.submissionsTitle}>
                  Submissions ({item.submissions.length})
                </AppText>
                {item.submissions.map((submission) => (
                  <TouchableOpacity
                    key={submission.id}
                    style={styles.submissionItem}
                    onPress={() => handleSubmissionClick(submission)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.submissionContent}>
                      <Feather name="folder" size={s(16)} color={AppColors.pr500} />
                      <View style={styles.submissionInfo}>
                        <AppText variant="body14pxBold" style={styles.submissionName}>
                          {submission.studentName || 'Unknown Student'}
                        </AppText>
                        <AppText style={styles.submissionFile}>
                          {submission.submissionFile?.name || 'No file'}
                        </AppText>
                        <AppText style={styles.submissionDate}>
                          Submitted: {dayjs(submission.submittedAt).format('DD MMM YYYY, HH:mm')}
                        </AppText>
                      </View>
                    </View>
                    {submission.submissionFile?.submissionUrl && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          // Handle download if needed
                        }}
                      >
                        <Feather name="download" size={s(18)} color={AppColors.pr500} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {item.submissions.length === 0 && (
              <AppText style={styles.noSubmissionsText}>
                No submissions yet.
              </AppText>
            )}

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => handleViewDetails(item)}
              activeOpacity={0.7}
            >
              <AppText style={styles.viewDetailsText}>View Details</AppText>
              <Feather name="arrow-right" size={s(16)} color={AppColors.pr500} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ScreenHeader title="Practical Exams" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView style={styles.container}>
      <ScreenHeader title="Practical Exams" />
      {exams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyText}>
            No practical exams found for this class.
          </AppText>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {exams.map(exam => renderExam(exam))}
        </ScrollView>
      )}
    </AppSafeView>
  );
};

export default PracticalExamListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.n100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: AppColors.n100,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: s(20),
    paddingBottom: vs(30),
  },
  examCard: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: AppColors.n200,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(16),
  },
  examHeaderContent: {
    flex: 1,
    flexDirection: 'column',
    gap: vs(8),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: s(12),
  },
  examTitle: {
    color: AppColors.n900,
    marginTop: vs(4),
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    marginTop: vs(4),
  },
  deadlineText: {
    fontSize: s(12),
    color: AppColors.n600,
  },
  deadlineTextOverdue: {
    color: AppColors.r500,
  },
  examContent: {
    padding: s(16),
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: AppColors.n200,
  },
  description: {
    fontSize: s(14),
    color: AppColors.n700,
    marginBottom: vs(16),
    lineHeight: s(20),
  },
  submissionsSection: {
    marginBottom: vs(16),
  },
  submissionsTitle: {
    color: AppColors.n900,
    marginBottom: vs(12),
  },
  submissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(12),
    backgroundColor: AppColors.n100,
    borderRadius: s(8),
    marginBottom: vs(8),
  },
  submissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: s(12),
  },
  submissionInfo: {
    flex: 1,
  },
  submissionName: {
    color: AppColors.n900,
    marginBottom: vs(4),
  },
  submissionFile: {
    fontSize: s(12),
    color: AppColors.n700,
    marginBottom: vs(2),
  },
  submissionDate: {
    fontSize: s(11),
    color: AppColors.n600,
  },
  noSubmissionsText: {
    fontSize: s(14),
    color: AppColors.n600,
    fontStyle: 'italic',
    marginBottom: vs(16),
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(12),
    paddingHorizontal: s(16),
    backgroundColor: AppColors.pr100,
    borderRadius: s(8),
    gap: s(8),
  },
  viewDetailsText: {
    color: AppColors.pr500,
    fontSize: s(14),
    fontWeight: '600',
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
