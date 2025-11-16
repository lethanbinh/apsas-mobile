import React, { useState, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import { AppColors } from '../styles/color';
import { showErrorToast } from '../components/toasts/AppToast';
import { fetchCourseElements, CourseElementData } from '../api/courseElementService';
import { fetchClassById, ClassData } from '../api/class';
import { assessmentTemplateService } from '../api/assessmentTemplateServiceWrapper';
import { getClassAssessments } from '../api/classAssessmentService';
import { fetchAssignRequestList } from '../api/assignRequestService';
import { getFilesForTemplate } from '../api/assessmentFileService';
import StatusTag from '../components/assessments/StatusTag';
import Feather from 'react-native-vector-icons/Feather';
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

interface AssignmentItem {
  id: string;
  courseElementId: number;
  title: string;
  status: string;
  deadline: string | null;
  startAt: string | null;
  description: string;
  classAssessmentId?: number;
  assessmentTemplateId?: number;
  requirementFile?: string;
  requirementFileUrl?: string;
  databaseFile?: string;
  databaseFileUrl?: string;
}

const AssignmentListScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const classId = (route.params as { classId?: string })?.classId;

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
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
            setAssignments([]);
            setIsLoading(false);
          }
          return;
        }
        
        const semesterCourseId = parseInt(String(classInfo.semesterCourseId), 10);
        if (isNaN(semesterCourseId)) {
          if (isMounted) {
            setAssignments([]);
            setIsLoading(false);
          }
          return;
        }

        // 2) Get all course elements and filter by this class's semesterCourseId (exclude practical exams)
        const allElements = await fetchCourseElements();
        if (!isMounted) return;
        
        const classElements = (allElements || []).filter(
          el =>
            el &&
            el.id &&
            el.semesterCourseId &&
            el.semesterCourseId.toString() === semesterCourseId.toString() &&
            !isPracticalExam(el),
        );

        // 3) Fetch assign requests and filter by status = 5 (Approved)
        let approvedAssignRequestIds = new Set<number>();
        let approvedCourseElementIds = new Set<number>();
        let approvedAssignRequestByCourseElementMap = new Map<number, number>();
        try {
          const assignRequestResponse = await fetchAssignRequestList(
            null,
            null,
            1,
            1000,
          );
          // Only include assign requests with status = 5 (Approved/COMPLETED)
          const approvedAssignRequests = assignRequestResponse.items.filter(
            ar => ar.status === 5,
          );
          approvedAssignRequestIds = new Set(
            approvedAssignRequests.map(ar => ar.id),
          );
          // Create map of courseElementIds that have approved assign requests
          approvedAssignRequests.forEach(ar => {
            if (ar.courseElementId) {
              approvedCourseElementIds.add(Number(ar.courseElementId));
              approvedAssignRequestByCourseElementMap.set(
                Number(ar.courseElementId),
                ar.id,
              );
            }
          });
        } catch (err) {
          console.error('Failed to fetch assign requests:', err);
          // Continue without filtering if assign requests cannot be fetched
        }

        // 4) Fetch assessment templates and filter by approved assign request IDs
        let approvedTemplateIds = new Set<number>();
        let approvedTemplates: any[] = [];
        let approvedTemplateByCourseElementMap = new Map<number, any>();
        let approvedTemplateByIdMap = new Map<number, any>();
        let templateToFilesMap = new Map<number, any[]>();
        
        try {
          const templateResponse = await assessmentTemplateService.getAssessmentTemplates({
            pageNumber: 1,
            pageSize: 1000,
          });
          // Only include templates with assignRequestId in approved assign requests (status = 5)
          approvedTemplates = (templateResponse?.items || []).filter(t => {
            if (!t.assignRequestId) {
              return false; // Skip templates without assignRequestId
            }
            return approvedAssignRequestIds.has(t.assignRequestId);
          });
          approvedTemplateIds = new Set(approvedTemplates.map(t => t.id));
          
          // Create map by courseElementId for quick lookup
          approvedTemplates.forEach(t => {
            if (t.courseElementId) {
              approvedTemplateByCourseElementMap.set(t.courseElementId, t);
            }
            // Also create map by template id for quick lookup
            approvedTemplateByIdMap.set(t.id, t);
          });
          
          // Fetch files for all approved templates
          const filesPromises = approvedTemplates.map(async (template: any) => {
            try {
              const filesRes = await getFilesForTemplate({
                assessmentTemplateId: template.id,
                pageNumber: 1,
                pageSize: 100,
              });
              return { templateId: template.id, files: filesRes.items };
            } catch (err) {
              console.error(`Failed to fetch files for template ${template.id}:`, err);
              return { templateId: template.id, files: [] };
            }
          });
          
          const filesResults = await Promise.all(filesPromises);
          filesResults.forEach(({ templateId, files }) => {
            templateToFilesMap.set(templateId, files);
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

        // 6) Map all course elements to AssignmentItem
        // Logic same as web: 
        // 1. If classAssessment exists, find template by classAssessment.assessmentTemplateId in approved templates
        // 2. If no classAssessment or template not found, find template by courseElementId in approved templates
        // Only use classAssessment if approved template exists AND matches classAssessment's template
        const mappedAssignments: AssignmentItem[] = classElements
          .filter(el => el && el.id && el.name)
          .map((el): AssignmentItem | null => {
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
                // Get files from template
                const files = templateToFilesMap.get(approvedTemplate.id) || [];
                const requirementFileObj = files.find((f: any) => f.fileTemplate === 0);
                const databaseFileObj = files.find((f: any) => f.fileTemplate === 1);
                
                return {
                  id: el.id.toString(),
                  courseElementId: el.id,
                  title: el.name || 'Assignment',
                  status: classAssessment ? 'Active Assignment' : 'Basic Assignment',
                  deadline: classAssessment?.endAt || null,
                  startAt: classAssessment?.startAt || null,
                  description: el.description || 'No description available',
                  classAssessmentId: classAssessment?.id,
                  assessmentTemplateId: approvedTemplate.id,
                  requirementFile: requirementFileObj?.name || '',
                  requirementFileUrl: requirementFileObj?.fileUrl || '',
                  databaseFile: databaseFileObj?.name || undefined,
                  databaseFileUrl: databaseFileObj?.fileUrl || '',
                };
              } else {
                // If approved template exists but classAssessment doesn't match, don't use classAssessment
                // But still show the course element (just without deadline)
                const files = templateToFilesMap.get(approvedTemplate.id) || [];
                const requirementFileObj = files.find((f: any) => f.fileTemplate === 0);
                const databaseFileObj = files.find((f: any) => f.fileTemplate === 1);
                
                return {
                  id: el.id.toString(),
                  courseElementId: el.id,
                  title: el.name || 'Assignment',
                  status: 'Basic Assignment',
                  deadline: null,
                  startAt: null,
                  description: el.description || 'No description available',
                  assessmentTemplateId: approvedTemplate.id,
                  requirementFile: requirementFileObj?.name || '',
                  requirementFileUrl: requirementFileObj?.fileUrl || '',
                  databaseFile: databaseFileObj?.name || undefined,
                  databaseFileUrl: databaseFileObj?.fileUrl || '',
                };
              }
            } else {
              // If no approved template found, don't use classAssessment
              return {
                id: el.id.toString(),
                courseElementId: el.id,
                title: el.name || 'Assignment',
                status: 'Basic Assignment',
                deadline: null,
                startAt: null,
                description: el.description || 'No description available',
              };
            }
          })
          .filter((item): item is AssignmentItem => item !== null);

        if (!isMounted) return;
        setAssignments(mappedAssignments);
        
        // Auto-expand first assignment if available
        if (mappedAssignments.length > 0 && !expandedId) {
          setExpandedId(mappedAssignments[0].id);
        }
      } catch (err: any) {
        console.error('Failed to fetch assignments:', err);
        if (isMounted) {
          showErrorToast('Error', err.message || 'Failed to load assignments.');
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

  const handleViewDetails = (assignment: AssignmentItem) => {
    try {
      if (assignment && assignment.courseElementId && classData && classData.id) {
        navigation.navigate('AssignmentDetailScreen', {
          elementId: String(assignment.courseElementId),
          classId: classData.id,
        });
      } else {
        showErrorToast('Error', 'Invalid assignment data.');
      }
    } catch (err) {
      console.error('Error navigating to assignment details:', err);
      showErrorToast('Error', 'Failed to open assignment details.');
    }
  };

  const renderAssignment = ({ item }: { item: AssignmentItem }) => {
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
      <View style={styles.assignmentCard}>
        <TouchableOpacity
          style={styles.assignmentHeader}
          onPress={() => handleToggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.assignmentHeaderContent}>
            <View style={styles.statusContainer}>
              <StatusTag status={item.status} />
            </View>
            <AppText variant="body16pxBold" style={styles.assignmentTitle}>
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
          <View style={styles.assignmentContent}>
            <AppText style={styles.description}>{item.description}</AppText>
            
            {(item.requirementFile || item.databaseFile) && (
              <View style={styles.filesContainer}>
                {item.requirementFile && (
                  <View style={styles.fileItem}>
                    <Feather name="file-text" size={s(16)} color={AppColors.pr500} />
                    <AppText style={styles.fileName}>{item.requirementFile}</AppText>
                  </View>
                )}
                {item.databaseFile && (
                  <View style={styles.fileItem}>
                    <Feather name="database" size={s(16)} color={AppColors.g500} />
                    <AppText style={styles.fileName}>{item.databaseFile}</AppText>
                  </View>
                )}
              </View>
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
        <ScreenHeader title="Assignments" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView style={styles.container}>
      <ScreenHeader title="Assignments" />
      {assignments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyText}>
            No assignments found for this class.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={item => item.id}
          renderItem={renderAssignment}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </AppSafeView>
  );
};

export default AssignmentListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.n50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: AppColors.n50,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: s(20),
    paddingBottom: vs(30),
  },
  assignmentCard: {
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
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(16),
  },
  assignmentHeaderContent: {
    flex: 1,
    marginRight: s(12),
  },
  statusContainer: {
    marginBottom: vs(8),
  },
  assignmentTitle: {
    color: AppColors.n900,
    marginBottom: vs(6),
    fontSize: s(16),
    fontWeight: '700',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    marginTop: vs(4),
  },
  deadlineText: {
    fontSize: s(13),
    color: AppColors.n600,
    fontWeight: '500',
  },
  deadlineTextOverdue: {
    color: AppColors.r500,
    fontWeight: '600',
  },
  assignmentContent: {
    padding: s(16),
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: AppColors.n100,
  },
  description: {
    fontSize: s(14),
    color: AppColors.n700,
    lineHeight: s(20),
    marginBottom: vs(12),
  },
  filesContainer: {
    gap: vs(8),
    marginBottom: vs(12),
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingVertical: vs(6),
  },
  fileName: {
    fontSize: s(13),
    color: AppColors.n700,
    flex: 1,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    paddingVertical: vs(10),
    paddingHorizontal: s(16),
    backgroundColor: AppColors.pr100,
    borderRadius: s(8),
    marginTop: vs(8),
  },
  viewDetailsText: {
    fontSize: s(14),
    color: AppColors.pr500,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(40),
  },
  emptyText: {
    fontSize: s(15),
    color: AppColors.n500,
    textAlign: 'center',
  },
});

