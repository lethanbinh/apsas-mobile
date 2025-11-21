import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import {
  AssessmentTemplateData,
  fetchAssessmentTemplates,
} from '../api/assessmentTemplateService';
import {
  AssignRequestData,
  fetchAssignRequestList,
} from '../api/assignRequestService';
import { fetchSemesters, SemesterData } from '../api/semesterService';
import AssignmentAccordion from '../components/assessments/AssignmentAccordion';
import StatusTag from '../components/assessments/StatusTag';
import ScreenHeader from '../components/common/ScreenHeader';
import SemesterDropdown from '../components/common/SemesterDropdown';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { useGetCurrentLecturerId } from '../hooks/useGetCurrentLecturerId';
import { AppColors } from '../styles/color';

interface CourseUI {
  id: string;
  title: string;
  status: string;
  assignmentsData: {
    assignRequest: AssignRequestData;
    template: AssessmentTemplateData | null;
  }[];
}

const TaskListScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const semesterCode = (route.params as { semesterCode?: string })?.semesterCode;
  const { lecturerId: currentLecturerId, isLoading: isLecturerLoading } = useGetCurrentLecturerId();
  const [courses, setCourses] = useState<CourseUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(semesterCode || null);
  const [semesterList, setSemesterList] = useState<SemesterData[]>([]);
  const [templateMap, setTemplateMap] = useState<Map<number, AssessmentTemplateData | null>>(new Map());
  const [loadingTemplates, setLoadingTemplates] = useState<Set<number>>(new Set());

  // Fetch semester list on mount
  useEffect(() => {
    let isMounted = true;

    const loadSemesters = async () => {
      try {
        const semesters = await fetchSemesters({ pageNumber: 1, pageSize: 1000 });
        if (isMounted) {
          setSemesterList(semesters || []);
        }
      } catch (error: any) {
        console.error('Failed to fetch semesters:', error);
      }
    };

    loadSemesters();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isLecturerLoading) {
      return;
    }

    if (!selectedSemester) {
      if (isMounted) {
        setIsLoading(false);
        setCourses([]);
      }
      return;
    }

    if (!currentLecturerId) {
      if (isMounted) {
        setIsLoading(false);
      }
      return;
    }

    const loadAssignments = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        // Fetch assign requests
        const response = await fetchAssignRequestList(
          selectedSemester,
          currentLecturerId,
          1,
          1000,
        );
        const assignRequests = response?.items || [];
        
        if (!isMounted) return;

        if (!assignRequests || assignRequests.length === 0) {
          setCourses([]);
          setIsLoading(false);
          return;
        }

        // Don't fetch templates upfront - lazy load when needed
        // This prevents crashes and improves performance
        const combinedData = assignRequests.map(ar => ({
          assignRequest: ar,
          template: null as AssessmentTemplateData | null,
        }));

        // Group data theo courseName
        const coursesMap = new Map<
          string,
          {
            assignRequest: AssignRequestData;
            template: AssessmentTemplateData | null;
          }[]
        >();

        combinedData.forEach(item => {
          if (item && item.assignRequest && item.assignRequest.courseName) {
            try {
              const courseName = item.assignRequest.courseName;
              if (courseName && typeof courseName === 'string') {
                if (!coursesMap.has(courseName)) {
                  coursesMap.set(courseName, []);
                }
                const existingItems = coursesMap.get(courseName);
                if (existingItems) {
                  existingItems.push(item);
                }
              }
            } catch (err) {
              console.error('Error processing assignment data:', err);
            }
          }
        });
        const coursesData: CourseUI[] = Array.from(coursesMap.entries())
          .filter(([courseName]) => courseName)
          .map(([courseName, assignmentsData]) => ({
            id: courseName,
            title: courseName,
            status: 'Pending',
            assignmentsData: assignmentsData || [],
          }));

        if (!isMounted) return;
        
        setCourses(coursesData);
        if (coursesData.length > 0 && coursesData[0] && coursesData[0].id) {
          try {
            setExpandedCourse(coursesData[0].id);
            const firstAssignment = coursesData[0].assignmentsData?.[0];
            if (firstAssignment?.assignRequest?.id) {
              setExpandedAssignment(
                String(firstAssignment.assignRequest.id),
              );
            }
          } catch (err) {
            console.error('Error setting initial expanded state:', err);
          }
        }
      } catch (error: any) {
        console.error(error);
        if (isMounted) {
          showErrorToast('Error', 'Failed to load assignments.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAssignments();

    return () => {
      isMounted = false;
    };
  }, [selectedSemester, currentLecturerId, isLecturerLoading]);

  const handleSemesterSelect = (semester: string) => {
    setSelectedSemester(semester);
    setExpandedCourse(null);
    setExpandedAssignment(null);
  };

  const handleRefresh = () => {
    // Trigger re-fetch by forcing a state update
    if (selectedSemester && currentLecturerId) {
      // Force re-fetch by temporarily clearing and resetting
      const currentSemester = selectedSemester;
      setSelectedSemester(null);
      setTimeout(() => {
        setSelectedSemester(currentSemester);
      }, 100);
    }
  };

  // Get semester codes from semester list
  const semesterOptions = (semesterList || [])
    .filter(sem => sem && sem.semesterCode)
    .map(sem => sem.semesterCode)
    .filter((code): code is string => !!code);

  if (isLoading || isLecturerLoading) {
    return (
      <AppSafeView>
        <ScreenHeader title="Tasks" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader title={`Tasks${selectedSemester ? ` (${selectedSemester})` : ''}`} />
      <View style={styles.contentContainer}>
        <View style={styles.dropdownContainer}>
          <SemesterDropdown
            semesters={semesterOptions}
            onSelect={handleSemesterSelect}
          />
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {courses.length > 0 ? (
              courses.map(course => (
                <View key={course.id} style={styles.courseCard}>
                  <TouchableOpacity
                    style={styles.courseHeader}
                    onPress={() =>
                      setExpandedCourse(
                        expandedCourse === course.id ? null : course.id,
                      )
                    }
                  >
                    <AppText variant="label16pxBold" style={{ flex: 1 }}>
                      {course.title}
                    </AppText>
                    <StatusTag status={course.status} />
                    <AppText style={styles.expandIcon}>
                      {expandedCourse === course.id ? '−' : '+'}
                    </AppText>
                  </TouchableOpacity>
                  {expandedCourse === course.id && (
                    <View style={styles.courseBody}>
                      {(course.assignmentsData || [])
                        .filter(item => item && item.assignRequest && item.assignRequest.id)
                        .map(
                          ({ assignRequest }) => {
                            const template = templateMap.get(assignRequest.id) ?? null;
                            const isLoadingTemplate = loadingTemplates.has(assignRequest.id);
                            
                            return (
                              <AssignmentAccordion
                                key={assignRequest.id}
                                assignRequest={assignRequest}
                                template={template}
                                isExpanded={
                                  expandedAssignment === String(assignRequest.id)
                                }
                                onToggle={async () => {
                                  const newExpandedId = expandedAssignment === String(assignRequest.id)
                                    ? null
                                    : String(assignRequest.id);
                                  setExpandedAssignment(newExpandedId);
                                  
                                  // Lazy load template when expanding
                                  if (newExpandedId && !templateMap.has(assignRequest.id) && !isLoadingTemplate) {
                                    setLoadingTemplates(prev => new Set(prev).add(assignRequest.id));
                                    try {
                                      const res = await fetchAssessmentTemplates({
                                        pageNumber: 1,
                                        pageSize: 1,
                                        assignRequestId: assignRequest.id,
                                      });
                                      const fetchedTemplate = (res?.items && res.items[0]) || null;
                                      setTemplateMap(prev => new Map(prev).set(assignRequest.id, fetchedTemplate));
                                    } catch (err) {
                                      console.error(`Error fetching template for AR ${assignRequest.id}:`, err);
                                      setTemplateMap(prev => new Map(prev).set(assignRequest.id, null));
                                    } finally {
                                      setLoadingTemplates(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(assignRequest.id);
                                        return newSet;
                                      });
                                    }
                                  }
                                }}
                                onSuccess={handleRefresh}
                              />
                            );
                          }
                        )}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <AppText style={styles.emptyText}>
                {selectedSemester 
                  ? 'No tasks found for this semester.' 
                  : 'Please select a semester to view tasks.'}
              </AppText>
            )}
          </ScrollView>
        )}
      </View>
    </AppSafeView>
  );
};

export default TaskListScreen;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: s(20),
    paddingTop: vs(8),
  },
  dropdownContainer: {
    marginBottom: vs(8),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(40),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    flex: 1,
  },
  courseCard: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: AppColors.pr100,
    marginBottom: vs(16),
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(12),
    paddingHorizontal: s(14),
  },
  expandIcon: {
    fontSize: s(18),
    marginLeft: s(6),
    color: AppColors.n700,
  },
  courseBody: {
    backgroundColor: AppColors.pr100,
    borderBottomLeftRadius: s(12),
    borderBottomRightRadius: s(12),
    paddingTop: vs(2),
    paddingBottom: vs(10),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vs(50),
    color: AppColors.n500,
  },
});
