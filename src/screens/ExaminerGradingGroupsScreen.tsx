import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import AppButton from '../components/buttons/AppButton';
import { AppColors } from '../styles/color';
import { showErrorToast, showSuccessToast } from '../components/toasts/AppToast';
import {
  getGradingGroups,
  GradingGroup,
  deleteGradingGroup,
} from '../api/gradingGroupService';
import { fetchLecturerList, LecturerListData } from '../api/lecturerService';
import { getSubmissionList, Submission } from '../api/submissionService';
import { assessmentTemplateService } from '../api/assessmentTemplateServiceWrapper';
import { fetchCourseElements } from '../api/courseElementService';
import { fetchSemesters, SemesterData } from '../api/semesterService';
import CreateGradingGroupModal from '../components/examiner/CreateGradingGroupModal';
import AssignSubmissionsModal from '../components/examiner/AssignSubmissionsModal';
import StatusTag from '../components/assessments/StatusTag';
import Feather from 'react-native-vector-icons/Feather';

interface GroupedByLecturer {
  lecturerId: number;
  lecturerName: string;
  lecturerCode: string | null;
  groups: (GradingGroup & { semesterCode?: string; submissionCount: number })[];
}

const ExaminerGradingGroupsScreen = () => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [allGroups, setAllGroups] = useState<GradingGroup[]>([]);
  const [allLecturers, setAllLecturers] = useState<LecturerListData[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [allSemesters, setAllSemesters] = useState<SemesterData[]>([]);
  const [gradingGroupToSemesterMap, setGradingGroupToSemesterMap] = useState<
    Map<number, string>
  >(new Map());
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GradingGroup | null>(null);

  const fetchData = useCallback(async () => {
    if (!isMounted) return;
    setIsLoading(true);

    try {
      // Fetch all data in parallel
      const [groupsRes, lecturersRes, semestersRes] = await Promise.all([
        getGradingGroups({}),
        fetchLecturerList(),
        fetchSemesters({ pageNumber: 1, pageSize: 1000 }).catch(() => []),
      ]);

      if (!isMounted) return;
      setAllGroups(groupsRes || []);
      setAllLecturers(lecturersRes || []);
      setAllSemesters(semestersRes || []);

      // Get unique assessmentTemplateIds
      const assessmentTemplateIds = Array.from(
        new Set(
          (groupsRes || [])
            .filter(g => g && g.assessmentTemplateId !== null && g.assessmentTemplateId !== undefined)
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
          if (template && template.id && assessmentTemplateIds.includes(template.id)) {
            assessmentTemplateMap.set(template.id, template);
          }
        });
      }

      // Get unique courseElementIds
      const courseElementIds = Array.from(
        new Set(
          Array.from(assessmentTemplateMap.values())
            .filter(t => t && t.courseElementId)
            .map(t => Number(t.courseElementId)),
        ),
      );

      // Fetch course elements
      const courseElementMap = new Map<number, any>();
      if (courseElementIds.length > 0) {
        const courseElements = await fetchCourseElements();
        (courseElements || []).forEach(element => {
          if (element && element.id && courseElementIds.includes(element.id)) {
            courseElementMap.set(element.id, element);
          }
        });
      }

      // Map grading groups to semester codes
      const groupToSemesterMap = new Map<number, string>();
      (groupsRes || []).forEach(group => {
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

      // Fetch all submissions for all grading groups
      const allSubmissionPromises = (groupsRes || [])
        .filter(g => g && g.id)
        .map(group =>
          getSubmissionList({ gradingGroupId: group.id }).catch(() => []),
        );
      const allSubmissionResults = await Promise.all(allSubmissionPromises);
      const submissions = allSubmissionResults.flat();
      if (!isMounted) return;
      setAllSubmissions(submissions || []);
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
  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
    return () => {
      setIsMounted(false);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isMounted) {
        fetchData();
      }
    }, [isMounted, fetchData]),
  );

  // Group by lecturer
  const groupedByLecturer = useMemo(() => {
    const lecturerMap = new Map<number, GroupedByLecturer>();

    (allGroups || []).forEach(group => {
      if (!group || !group.lecturerId) return;

      const semesterCode = gradingGroupToSemesterMap.get(Number(group.id));

      // Filter by selected semester
      if (selectedSemester !== 'all') {
        if (!semesterCode || semesterCode !== selectedSemester) {
          return;
        }
      }

      // Get submission count for this group
      const groupSubmissions = (allSubmissions || []).filter(
        s => s && s.gradingGroupId === group.id,
      );
      const submissionCount = groupSubmissions.length;

      if (!lecturerMap.has(group.lecturerId)) {
        lecturerMap.set(group.lecturerId, {
          lecturerId: group.lecturerId,
          lecturerName: group.lecturerName || 'Unknown',
          lecturerCode: group.lecturerCode,
          groups: [],
        });
      }

      const lecturerData = lecturerMap.get(group.lecturerId)!;
      lecturerData.groups.push({
        ...group,
        semesterCode,
        submissionCount,
      });
    });

    return Array.from(lecturerMap.values());
  }, [allGroups, allSubmissions, gradingGroupToSemesterMap, selectedSemester]);

  const availableSemesters = useMemo(() => {
    return (allSemesters || []).map(sem => sem.semesterCode).sort();
  }, [allSemesters]);

  const handleOpenAssign = (group: GradingGroup) => {
    setSelectedGroup(group);
    setIsAssignModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsCreateModalOpen(false);
    setIsAssignModalOpen(false);
    setSelectedGroup(null);
  };

  const handleModalOk = () => {
    setIsCreateModalOpen(false);
    setIsAssignModalOpen(false);
    setSelectedGroup(null);
    fetchData();
  };

  const handleDeleteGroup = async (group: GradingGroup) => {
    Alert.alert(
      'Delete Assignment',
      `Are you sure you want to delete this assignment for ${group.lecturerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!group || !group.id) return;
              await deleteGradingGroup(group.id);
              showSuccessToast('Success', 'Assignment deleted successfully');
              fetchData();
            } catch (error: any) {
              console.error('Failed to delete grading group:', error);
              showErrorToast('Error', error.message || 'Failed to delete assignment.');
            }
          },
        },
      ],
    );
  };

  const renderLecturerGroup = ({ item }: { item: GroupedByLecturer }) => {
    return (
      <View style={styles.lecturerSection}>
        <View style={styles.lecturerHeader}>
          <View style={styles.lecturerNameRow}>
            <View style={styles.lecturerAvatar}>
              <Feather name="user" size={s(20)} color={AppColors.pr500} />
            </View>
            <View style={styles.lecturerNameContainer}>
              <AppText variant="body16pxBold" style={styles.lecturerName}>
                {item.lecturerName}
              </AppText>
              {item.lecturerCode && (
                <AppText style={styles.lecturerCode}>({item.lecturerCode})</AppText>
              )}
            </View>
          </View>
        </View>

        <View style={styles.lecturerStats}>
          <View style={styles.statBadge}>
            <Feather name="file-text" size={s(16)} color={AppColors.pr500} />
            <AppText style={styles.statText}>
              {item.groups.length} assignment{item.groups.length !== 1 ? 's' : ''}
            </AppText>
          </View>
          <View style={styles.statBadge}>
            <Feather name="inbox" size={s(16)} color={AppColors.g500} />
            <AppText style={styles.statText}>
              {item.groups.reduce((sum, g) => sum + g.submissionCount, 0)} submissions
            </AppText>
          </View>
        </View>

        <View style={styles.groupsContainer}>
          {item.groups.map((group, index) => (
            <View key={group.id} style={styles.groupCard}>
              <AppText variant="body16pxBold" style={styles.groupTitle}>
                {group.assessmentTemplateName || 'No Template'}
              </AppText>
              <View style={styles.tagsContainer}>
                {group.semesterCode && (
                  <View style={styles.semesterTag}>
                    <Feather name="calendar" size={s(11)} color={AppColors.pr500} />
                    <AppText style={styles.semesterText}>{group.semesterCode}</AppText>
                  </View>
                )}
                <View style={styles.submissionCountTag}>
                  <Feather name="file" size={s(11)} color={AppColors.g500} />
                  <AppText style={styles.submissionCountText}>
                    {group.submissionCount} submission{group.submissionCount !== 1 ? 's' : ''}
                  </AppText>
                </View>
              </View>
              <View style={styles.groupActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleOpenAssign(group)}
                  activeOpacity={0.6}
                >
                  <Feather name="edit-3" size={s(16)} color={AppColors.pr500} />
                  <AppText style={styles.actionText}>Manage</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteGroup(group)}
                  activeOpacity={0.6}
                >
                  <Feather name="trash-2" size={s(16)} color={AppColors.r500} />
                  <AppText style={styles.deleteText}>Delete</AppText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <AppSafeView>
        <ScreenHeader title="Grading Groups" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader
        title="Grading Groups"
        rightIcon={
          <TouchableOpacity onPress={() => setIsCreateModalOpen(true)}>
            <Feather name="plus" size={s(24)} color={AppColors.pr500} />
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <AppText style={styles.filterLabel}>Filter by Semester:</AppText>
          <RNPickerSelect
            onValueChange={value => {
              setSelectedSemester(value || 'all');
            }}
            placeholder={{ label: 'All Semesters', value: 'all' }}
            items={[
              { label: 'All Semesters', value: 'all' },
              ...availableSemesters.map(sem => ({
                label: sem,
                value: sem,
              })),
            ]}
            value={selectedSemester}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        {groupedByLecturer.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>No grading groups found.</AppText>
          </View>
        ) : (
          <FlatList
            data={groupedByLecturer}
            keyExtractor={item => `lecturer-${item.lecturerId}`}
            renderItem={renderLecturerGroup}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {isCreateModalOpen && (
        <CreateGradingGroupModal
          visible={isCreateModalOpen}
          onDismiss={handleModalCancel}
          onSuccess={handleModalOk}
          allLecturers={allLecturers}
          existingGroups={allGroups}
          gradingGroupToSemesterMap={gradingGroupToSemesterMap}
        />
      )}

      {isAssignModalOpen && selectedGroup && (
        <AssignSubmissionsModal
          visible={isAssignModalOpen}
          onDismiss={handleModalCancel}
          onSuccess={handleModalOk}
          group={selectedGroup}
        />
      )}
    </AppSafeView>
  );
};

export default ExaminerGradingGroupsScreen;

const pickerSelectStyles = {
  inputIOS: {
    fontSize: s(14),
    paddingVertical: vs(12),
    paddingHorizontal: s(16),
    borderWidth: 1.5,
    borderColor: AppColors.n300,
    borderRadius: s(12),
    color: AppColors.n900,
    backgroundColor: AppColors.white,
    paddingRight: s(40),
  },
  inputAndroid: {
    fontSize: s(14),
    paddingVertical: vs(12),
    paddingHorizontal: s(16),
    borderWidth: 1.5,
    borderColor: AppColors.n300,
    borderRadius: s(12),
    color: AppColors.n900,
    backgroundColor: AppColors.white,
    paddingRight: s(40),
  },
  placeholder: {
    color: AppColors.n500,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
    backgroundColor: AppColors.n50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.n50,
  },
  filterContainer: {
    marginBottom: vs(20),
  },
  filterLabel: {
    fontSize: s(15),
    fontWeight: '700',
    color: AppColors.n900,
    marginBottom: vs(12),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(40),
  },
  emptyText: {
    color: AppColors.n500,
    fontSize: s(15),
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: vs(30),
  },
  lecturerSection: {
    marginBottom: vs(20),
    backgroundColor: AppColors.white,
    borderRadius: s(16),
    padding: s(20),
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: AppColors.n200,
  },
  lecturerHeader: {
    marginBottom: vs(15),
    paddingBottom: vs(15),
    borderBottomWidth: 1.5,
    borderBottomColor: AppColors.n100,
  },
  lecturerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lecturerAvatar: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: AppColors.pr100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
    borderWidth: 2,
    borderColor: AppColors.pr300,
  },
  lecturerNameContainer: {
    flex: 1,
  },
  lecturerName: {
    color: AppColors.n900,
    fontSize: s(16),
    marginBottom: vs(4),
    fontWeight: '700',
  },
  lecturerCode: {
    fontSize: s(13),
    color: AppColors.n600,
    fontWeight: '500',
  },
  lecturerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
    marginBottom: vs(15),
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    backgroundColor: AppColors.n100,
    borderRadius: s(12),
  },
  statText: {
    fontSize: s(12),
    color: AppColors.n700,
    fontWeight: '600',
  },
  groupsContainer: {
    gap: vs(12),
  },
  groupCard: {
    backgroundColor: AppColors.n50,
    borderRadius: s(12),
    padding: s(16),
    borderWidth: 1,
    borderColor: AppColors.n200,
  },
  groupTitle: {
    color: AppColors.n900,
    fontSize: s(15),
    marginBottom: vs(10),
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(8),
    marginBottom: vs(12),
  },
  semesterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    borderRadius: s(16),
    backgroundColor: AppColors.pr100,
    gap: s(4),
  },
  semesterText: {
    fontSize: s(11),
    color: AppColors.pr500,
    fontWeight: '600',
  },
  submissionCountTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    borderRadius: s(16),
    backgroundColor: AppColors.g100,
    gap: s(4),
  },
  submissionCountText: {
    fontSize: s(11),
    color: AppColors.g500,
    fontWeight: '600',
  },
  groupActions: {
    flexDirection: 'row',
    gap: s(10),
    flexWrap: 'wrap',
  },
  actionButton: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    borderRadius: s(10),
    backgroundColor: AppColors.pr100,
    gap: s(6),
    shadowColor: AppColors.pr500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: AppColors.pr300,
  },
  deleteButton: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    borderRadius: s(10),
    backgroundColor: AppColors.r100,
    gap: s(6),
    shadowColor: AppColors.r500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: AppColors.r300,
  },
  actionText: {
    fontSize: s(13),
    color: AppColors.pr500,
    fontWeight: '700',
  },
  deleteText: {
    fontSize: s(13),
    color: AppColors.r500,
    fontWeight: '700',
  },
});

