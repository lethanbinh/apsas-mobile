import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import { s } from 'react-native-size-matters';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../components/common/ScreenHeader';
import SubmissionHistoryItem from '../components/gradeHistory/SubmissionHistoryItem';
import AppSafeView from '../components/views/AppSafeView';
import AppText from '../components/texts/AppText';
import { AppColors } from '../styles/color';
import { FilterIcon } from '../assets/icons/icon';
import { useGetCurrentLecturerId } from '../hooks/useGetCurrentLecturerId';
import { getSubmissionList, Submission } from '../api/submissionService';
import { getGradingGroups, GradingGroup } from '../api/gradingGroupService';
import { getClassAssessments } from '../api/classAssessmentService';
import { assessmentTemplateService } from '../api/assessmentTemplateServiceWrapper';
import { fetchCourseElements } from '../api/courseElementService';
import { fetchSemesters, fetchSemesterPlanDetail } from '../api/semesterService';
import { showErrorToast } from '../components/toasts/AppToast';
import dayjs from 'dayjs';

interface EnrichedSubmission extends Submission {
  courseName?: string;
  courseCode?: string;
  assignmentTitle?: string;
  semesterCode?: string;
  deadline?: string;
  isLate?: boolean;
  gradingGroup?: GradingGroup;
  submissionNumber?: number;
}

interface FilterState {
  searchText: string;
  sortDate: 'oldest' | 'newest';
  sortGrade: 'highest' | 'lowest';
  selectedCategories: string[];
}

const GradingHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const { lecturerId, isLoading: isLecturerLoading } = useGetCurrentLecturerId();

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gradingGroups, setGradingGroups] = useState<GradingGroup[]>([]);
  const [filteredGradingGroups, setFilteredGradingGroups] = useState<GradingGroup[]>([]);
  const [semesterDetails, setSemesterDetails] = useState<any[]>([]);
  const [gradingGroupToSemesterMap, setGradingGroupToSemesterMap] = useState<
    Map<number, string>
  >(new Map());
  const [classAssessments, setClassAssessments] = useState<Map<number, any>>(new Map());
  const [courseElements, setCourseElements] = useState<Map<number, any>>(new Map());

  const [filterState, setFilterState] = useState<FilterState>({
    searchText: '',
    sortDate: 'newest',
    sortGrade: 'highest',
    selectedCategories: [],
  });

  useFocusEffect(
    useCallback(() => {
      // Load filter state from navigation params if available
      const params = navigation.getState()?.routes?.find(
        r => r.name === 'GradingHistoryScreen',
      )?.params as any;
      if (params?.filterState) {
        setFilterState(params.filterState);
      }
    }, [navigation]),
  );

  useEffect(() => {
    setIsMounted(true);

    const fetchAllData = async () => {
      if (isLecturerLoading || !lecturerId) {
        return;
      }

      if (!isMounted) return;
      setIsLoading(true);

      try {
        // Fetch grading groups
        const groups = await getGradingGroups({ lecturerId });
        if (!isMounted) return;
        setGradingGroups(groups);

        // Get unique assessmentTemplateIds
        const assessmentTemplateIds = Array.from(
          new Set(
            groups
              .filter(g => g.assessmentTemplateId !== null && g.assessmentTemplateId !== undefined)
              .map(g => Number(g.assessmentTemplateId)),
          ),
        );

        // Fetch assessment templates
        const assessmentTemplateMap = new Map<number, any>();
        if (assessmentTemplateIds.length > 0) {
          const templatesRes = await assessmentTemplateService.getAssessmentTemplates({
            pageNumber: 1,
            pageSize: 1000,
          });
          (templatesRes?.items || []).forEach(template => {
            if (assessmentTemplateIds.includes(template.id)) {
              assessmentTemplateMap.set(template.id, template);
            }
          });
        }

        // Get unique courseElementIds
        const courseElementIds = Array.from(
          new Set(
            Array.from(assessmentTemplateMap.values())
              .filter(t => t && t.courseElementId)
              .map(t => Number(t.courseElementId))
          ),
        );

        // Fetch course elements
        const courseElementMap = new Map<number, any>();
        if (courseElementIds.length > 0) {
          const courseElementsData = await fetchCourseElements();
          courseElementsData.forEach(element => {
            if (courseElementIds.includes(element.id)) {
              courseElementMap.set(element.id, element);
            }
          });
        }
        if (!isMounted) return;
        setCourseElements(courseElementMap);

        // Map grading groups to semester codes
        const groupToSemesterMap = new Map<number, string>();
        groups.forEach(group => {
          if (!group || group.assessmentTemplateId === null || group.assessmentTemplateId === undefined) {
            return;
          }
          try {
            const assessmentTemplate = assessmentTemplateMap.get(Number(group.assessmentTemplateId));
            if (assessmentTemplate && assessmentTemplate.courseElementId) {
              const courseElement = courseElementMap.get(Number(assessmentTemplate.courseElementId));
              if (courseElement?.semesterCourse?.semester?.semesterCode) {
                const semesterCode = courseElement.semesterCourse.semester.semesterCode;
                if (semesterCode) {
                  groupToSemesterMap.set(Number(group.id), semesterCode);
                }
              }
            }
          } catch (err) {
            console.error('Error mapping grading group to semester:', err);
          }
        });
        if (!isMounted) return;
        setGradingGroupToSemesterMap(groupToSemesterMap);

        // Filter grading groups: same semester, same assessment template, same lecturer, keep only latest
        const groupedMap = new Map<string, GradingGroup>();
        groups.forEach(group => {
          const semesterCode = groupToSemesterMap.get(group.id);
          const assessmentTemplateId = group.assessmentTemplateId;
          const lecturerId = group.lecturerId;

          if (!semesterCode || assessmentTemplateId === null || assessmentTemplateId === undefined) {
            return;
          }

          const key = `${semesterCode}_${assessmentTemplateId}_${lecturerId}`;
          const existing = groupedMap.get(key);

          if (!existing) {
            groupedMap.set(key, group);
          } else {
            const existingDate = existing.createdAt
              ? new Date(existing.createdAt).getTime()
              : 0;
            const currentDate = group.createdAt ? new Date(group.createdAt).getTime() : 0;

            if (currentDate > existingDate) {
              groupedMap.set(key, group);
            }
          }
        });
        const filtered = Array.from(groupedMap.values());
        if (!isMounted) return;
        setFilteredGradingGroups(filtered);

        // Fetch submissions - only graded ones (status = 2)
        const filteredGradingGroupIds = new Set(filtered.map(g => g.id));
        const allSubmissionPromises = filtered.map(group =>
          getSubmissionList({ gradingGroupId: group.id, status: 2 }).catch(() => []),
        );
        const allSubmissionResults = await Promise.all(allSubmissionPromises);
        const allSubmissions = allSubmissionResults.flat();
        if (!isMounted) return;
        setSubmissions(allSubmissions);

        // Fetch class assessments
        const classAssessmentIds = Array.from(
          new Set(
            allSubmissions
              .filter(s => s.classAssessmentId)
              .map(s => s.classAssessmentId!),
          ),
        );
        const classAssessmentMap = new Map<number, any>();
        if (classAssessmentIds.length > 0) {
          const classAssessmentsRes = await getClassAssessments({
            pageNumber: 1,
            pageSize: 1000,
          });
          (classAssessmentsRes?.items || []).forEach(ca => {
            if (ca && ca.id && classAssessmentIds.includes(ca.id)) {
              classAssessmentMap.set(ca.id, ca);
            }
          });
        }
        if (!isMounted) return;
        setClassAssessments(classAssessmentMap);

        // Fetch semesters
        try {
          const semesterList = await fetchSemesters({ pageNumber: 1, pageSize: 1000 });
          if (!isMounted) return;
          const details = await Promise.all(
            (semesterList || []).map(sem =>
              sem && sem.semesterCode
                ? fetchSemesterPlanDetail(sem.semesterCode).catch(() => null)
                : Promise.resolve(null),
            ),
          );
          if (!isMounted) return;
          setSemesterDetails(details.filter(d => d !== null));
        } catch (err) {
          console.error('Failed to fetch semesters:', err);
        }
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        if (isMounted) {
          showErrorToast('Error', error.message || 'Failed to load data.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllData();

    return () => {
      setIsMounted(false);
    };
  }, [lecturerId, isLecturerLoading]);

  const enrichedSubmissions: EnrichedSubmission[] = useMemo(() => {
    const filteredGradingGroupIds = new Set(
      filteredGradingGroups.filter(g => g && g.id).map(g => g.id)
    );
    return submissions
      .filter(sub => {
        return sub && sub.gradingGroupId !== undefined && filteredGradingGroupIds.has(sub.gradingGroupId);
      })
      .map(sub => {
        const semesterCode =
          sub.gradingGroupId !== undefined
            ? gradingGroupToSemesterMap.get(sub.gradingGroupId)
            : undefined;

        const classAssessment = sub.classAssessmentId
          ? classAssessments.get(sub.classAssessmentId)
          : undefined;

        const gradingGroup =
          sub.gradingGroupId !== undefined
            ? filteredGradingGroups.find(g => g.id === sub.gradingGroupId)
            : undefined;

        // Get course element to find deadline
        let deadline: string | undefined;
        let assignmentTitle: string | undefined;
        let courseCode: string | undefined;
        let courseName: string | undefined;
        if (gradingGroup?.assessmentTemplateId) {
          // We need to get course element from assessment template
          // For now, we'll use classAssessment data
          if (classAssessment) {
            assignmentTitle = classAssessment.assessmentName || gradingGroup.assessmentTemplateName;
            courseCode = classAssessment.courseCode;
            courseName = classAssessment.courseName;
          }
        }

        // Calculate if submission is late
        // We need deadline from course element, but for now we'll check if submittedAt is after a certain date
        // This is a simplified check - in real implementation, we'd compare with course element deadline
        const isLate = false; // TODO: Implement proper deadline check

        // Count submission number for this student in this grading group
        const studentSubmissions = submissions.filter(
          s =>
            s &&
            s.studentId &&
            sub.studentId &&
            s.studentId === sub.studentId &&
            s.gradingGroupId === sub.gradingGroupId &&
            s.submittedAt &&
            sub.submittedAt &&
            new Date(s.submittedAt).getTime() <= new Date(sub.submittedAt).getTime(),
        );
        const submissionNumber = studentSubmissions.length;

        return {
          ...sub,
          courseName: courseName || classAssessment?.courseName || 'N/A',
          courseCode: courseCode || 'N/A',
          assignmentTitle: assignmentTitle || gradingGroup?.assessmentTemplateName || 'N/A',
          semesterCode: semesterCode || undefined,
          deadline,
          isLate,
          gradingGroup,
          submissionNumber,
        };
      });
  }, [
    submissions,
    classAssessments,
    filteredGradingGroups,
    gradingGroupToSemesterMap,
    courseElements,
  ]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = enrichedSubmissions.filter(sub => {
      if (!sub) return false;
      // Filter by search text (student code)
      const searchMatch =
        filterState.searchText === '' ||
        (sub.studentCode && sub.studentCode.toLowerCase().includes(filterState.searchText.toLowerCase())) ||
        (sub.studentName && sub.studentName.toLowerCase().includes(filterState.searchText.toLowerCase()));

      // Filter by categories (if any selected)
      // For now, we'll skip category filtering as it requires more data
      const categoryMatch = true; // TODO: Implement category filtering

      return searchMatch && categoryMatch;
    });

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      if (filterState.sortDate === 'newest') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    // Sort by grade
    filtered.sort((a, b) => {
      const gradeA = a.lastGrade || 0;
      const gradeB = b.lastGrade || 0;
      if (filterState.sortGrade === 'highest') {
        return gradeB - gradeA;
      } else {
        return gradeA - gradeB;
      }
    });

    return filtered;
  }, [enrichedSubmissions, filterState]);

  const handleFilterPress = () => {
    navigation.navigate('GradingHistoryFilterScreen', {
      filterState,
      resultCount: filteredAndSortedData.length,
      onApplyFilter: (newFilterState: FilterState) => {
        setFilterState(newFilterState);
      },
    });
  };

  const getStatusForSubmission = (sub: EnrichedSubmission): 'On time' | 'Late' | 'Missing' => {
    if (sub.isLate) {
      return 'Late';
    }
    // If we have a deadline and submittedAt, check if late
    if (sub.deadline && sub.submittedAt) {
      const deadlineDate = new Date(sub.deadline);
      const submittedDate = new Date(sub.submittedAt);
      if (submittedDate > deadlineDate) {
        return 'Late';
      }
    }
    return 'On time';
  };

  const getBackgroundColor = (index: number): string => {
    const colors = [AppColors.pr100, AppColors.g100, AppColors.pur100];
    return colors[index % colors.length];
  };

  if (isLoading || isLecturerLoading) {
    return (
      <AppSafeView>
        <ScreenHeader title="Grading History" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader
        title="Grading History"
        rightIcon={<FilterIcon />}
        onRightIconPress={handleFilterPress}
      />
      <View style={styles.container}>
        {filteredAndSortedData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>No graded submissions found.</AppText>
          </View>
        ) : (
        <FlatList
            data={filteredAndSortedData}
          keyExtractor={item => item.id.toString()}
            renderItem={({ item, index }) => {
              const status = getStatusForSubmission(item);
              return (
                <SubmissionHistoryItem
                  backgroundColor={getBackgroundColor(index)}
                  submissionTime={item.submittedAt ? dayjs(item.submittedAt).format('DD/MM/YYYY – HH:mm') : 'N/A'}
                  courseCode={item.courseCode || 'N/A'}
                  courseName={item.courseName || 'N/A'}
                  assignmentTitle={item.assignmentTitle || 'N/A'}
                  teacherName={item.gradingGroup?.lecturerName || 'N/A'}
                  fileName={item.submissionFile?.name || 'N/A'}
                  status={status}
                  timeSubmit={`Submission ${item.submissionNumber || 1}`}
                  onNavigate={() => {
                    navigation.navigate('AssignmentGradingScreen', {
                      submissionId: item.id,
                    });
                  }}
                />
              );
            }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: s(15) }} />}
        />
        )}
      </View>
    </AppSafeView>
  );
};

export default GradingHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: s(25),
    paddingVertical: s(20),
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
    paddingVertical: s(40),
  },
  emptyText: {
    color: AppColors.n500,
    fontSize: s(14),
  },
});
