import React, { useEffect, useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { Modal, Portal } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as XLSX from 'xlsx';
import RNBlobUtil from 'react-native-blob-util';
import { PermissionsAndroid } from 'react-native';
import dayjs from 'dayjs';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import AppButton from '../components/buttons/AppButton';
import AppTextInput from '../components/inputs/AppTextInput';
import { AppColors } from '../styles/color';
import { showErrorToast, showSuccessToast } from '../components/toasts/AppToast';
import { useGetCurrentLecturerId } from '../hooks/useGetCurrentLecturerId';
import { getSubmissionList, Submission } from '../api/submissionService';
import { getGradingGroups, GradingGroup } from '../api/gradingGroupService';
import { getClassAssessments } from '../api/classAssessmentService';
import { assessmentTemplateService } from '../api/assessmentTemplateServiceWrapper';
import { assessmentPaperService } from '../api/assessmentPaperServiceWrapper';
import { assessmentQuestionService } from '../api/assessmentQuestionServiceWrapper';
import { rubricItemService } from '../api/rubricItemServiceWrapper';
import { fetchCourseElements } from '../api/courseElementService';
import { fetchSemesters, fetchSemesterPlanDetail, SemesterData } from '../api/semesterService';
import { fetchLecturerList } from '../api/lecturerService';
import Feather from 'react-native-vector-icons/Feather';

interface EnrichedSubmission extends Submission {
  courseName?: string;
  semesterCode?: string;
  semesterEndDate?: string;
  isSemesterPassed?: boolean;
  gradingGroup?: GradingGroup;
}

const getStatusTag = (status: number) => {
  switch (status) {
    case 0:
      return { text: 'Not graded', color: AppColors.n500, bgColor: AppColors.n100 };
    case 1:
      return { text: 'Grading', color: AppColors.b500, bgColor: AppColors.b100 };
    case 2:
      return { text: 'Graded', color: AppColors.g500, bgColor: AppColors.g100 };
    default:
      return { text: 'Unknown', color: AppColors.n500, bgColor: AppColors.n100 };
  }
};

const isSemesterPassed = (endDate?: string): boolean => {
  if (!endDate) return false;
  const now = new Date();
  const semesterEnd = new Date(endDate.endsWith('Z') ? endDate : endDate + 'Z');
  return now > semesterEnd;
};

const MyGradingGroupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { lecturerId, isLoading: isLecturerLoading } = useGetCurrentLecturerId();

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gradingGroups, setGradingGroups] = useState<GradingGroup[]>([]);
  const [filteredGradingGroups, setFilteredGradingGroups] = useState<GradingGroup[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [semesterDetails, setSemesterDetails] = useState<any[]>([]);
  const [gradingGroupToSemesterMap, setGradingGroupToSemesterMap] = useState<
    Map<number, string>
  >(new Map());
  const [classAssessments, setClassAssessments] = useState<Map<number, any>>(new Map());

  const [searchText, setSearchText] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [selectedGradingGroupId, setSelectedGradingGroupId] = useState<number | undefined>(
    undefined,
  );
  const [isViewExamModalVisible, setIsViewExamModalVisible] = useState(false);
  const [selectedGradingGroup, setSelectedGradingGroup] = useState<GradingGroup | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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
          new Set(Array.from(assessmentTemplateMap.values())
            .filter(t => t && t.courseElementId)
            .map(t => Number(t.courseElementId))),
        );

        // Fetch course elements
        const courseElementMap = new Map<number, any>();
        if (courseElementIds.length > 0) {
          const courseElements = await fetchCourseElements();
          courseElements.forEach(element => {
            if (courseElementIds.includes(element.id)) {
              courseElementMap.set(element.id, element);
            }
          });
        }

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

        // Fetch submissions
        const filteredGradingGroupIds = new Set(
          filtered.filter(g => g && g.id).map(g => g.id)
        );
        const allSubmissionPromises = filtered
          .filter(g => g && g.id)
          .map(group =>
            getSubmissionList({ gradingGroupId: group.id }).catch(() => []),
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
          setSemesters(semesterList || []);
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

        const semesterDetail = semesterCode
          ? semesterDetails.find(s => s?.semesterCode === semesterCode)
          : undefined;
        const semesterEndDate = semesterDetail?.endDate;
        const isPassed = isSemesterPassed(semesterEndDate);

        const classAssessment = sub.classAssessmentId
          ? classAssessments.get(sub.classAssessmentId)
          : undefined;

        const gradingGroup =
          sub.gradingGroupId !== undefined
            ? filteredGradingGroups.find(g => g.id === sub.gradingGroupId)
            : undefined;

        return {
          ...sub,
          courseName: classAssessment?.courseName || 'N/A',
          semesterCode: semesterCode || undefined,
          semesterEndDate,
          isSemesterPassed: isPassed,
          gradingGroup,
        };
      });
  }, [
    submissions,
    classAssessments,
    semesterDetails,
    filteredGradingGroups,
    gradingGroupToSemesterMap,
  ]);

  const filteredData = useMemo(() => {
    let filtered = enrichedSubmissions.filter(sub => {
      if (!sub) return false;
      
      // Filter by semester
      let semesterMatch = true;
      if (selectedSemester !== undefined) {
        const selectedSemesterDetail = semesterDetails.find(
          s => s && s.id && Number(s.id) === Number(selectedSemester),
        );
        const selectedSemesterCode = selectedSemesterDetail?.semesterCode;
        semesterMatch =
          selectedSemesterCode !== undefined &&
          sub.semesterCode !== undefined &&
          sub.semesterCode === selectedSemesterCode;
      }

      // Filter by grading group
      let gradingGroupMatch = true;
      if (selectedGradingGroupId !== undefined) {
        gradingGroupMatch =
          sub.gradingGroupId !== undefined && sub.gradingGroupId === selectedGradingGroupId;
      }

      // Filter by search text
      const searchLower = (searchText || '').toLowerCase();
      const searchMatch =
        searchText === '' ||
        (sub.studentName && sub.studentName.toLowerCase().includes(searchLower)) ||
        (sub.studentCode && sub.studentCode.toLowerCase().includes(searchLower)) ||
        (sub.submissionFile?.name && sub.submissionFile.name.toLowerCase().includes(searchLower));

      return semesterMatch && gradingGroupMatch && searchMatch;
    });

    // Group by (semesterCode, studentId, gradingGroupId) and keep only latest
    const groupedMap = new Map<string, EnrichedSubmission>();
    filtered.forEach(sub => {
      if (!sub || !sub.studentId) return;
      const key = `${sub.semesterCode || 'unknown'}_${sub.studentId}_${sub.gradingGroupId || 'unknown'}`;
      const existing = groupedMap.get(key);

      if (!existing) {
        groupedMap.set(key, sub);
      } else {
        const existingDate = existing.submittedAt
          ? new Date(existing.submittedAt).getTime()
          : 0;
        const currentDate = sub.submittedAt ? new Date(sub.submittedAt).getTime() : 0;

        if (currentDate > existingDate) {
          groupedMap.set(key, sub);
        }
      }
    });

    // Sort by submittedAt (newest first)
    const result = Array.from(groupedMap.values());
    result.sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    });

    return result;
  }, [enrichedSubmissions, searchText, selectedSemester, selectedGradingGroupId, semesterDetails]);

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

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        showErrorToast('Permission Denied', 'Storage permission is required to export.');
        setIsExporting(false);
        return;
      }

      const exportData: any[] = [];
      const filteredGradingGroupIds = new Set(
        filteredGradingGroups.filter(g => g && g.id).map(g => g.id)
      );

      for (const sub of submissions) {
        if (!sub || !sub.gradingGroupId || !filteredGradingGroupIds.has(sub.gradingGroupId)) {
          continue;
        }

        // Load feedback from AsyncStorage
        let feedback: any = {};
        try {
          const savedFeedback = await AsyncStorage.getItem(`feedback_${sub.id}`);
          if (savedFeedback) {
            feedback = JSON.parse(savedFeedback);
          }
        } catch (err) {
          console.error(`Failed to load feedback for submission ${sub.id}:`, err);
        }

        const baseRow: any = {
          'No.': exportData.length + 1,
          'Submission ID': sub.id || 'N/A',
          'Student Code': sub.studentCode || 'N/A',
          'Student Name': sub.studentName || 'N/A',
          'Submission File': sub.submissionFile?.name || 'N/A',
          'Submitted At': sub.submittedAt
            ? dayjs(sub.submittedAt).format('DD/MM/YYYY HH:mm')
            : 'N/A',
          'Total Grade': (sub.lastGrade && sub.lastGrade > 0) ? `${sub.lastGrade}/100` : 'Not graded',
          Status:
            sub.status === 0
              ? 'Not graded'
              : sub.status === 1
              ? 'Grading'
              : 'Graded',
        };

        exportData.push(baseRow);

        // Add feedback rows
        const feedbackRows = [
          { 'Feedback Category': 'Overall Feedback', 'Feedback Content': feedback.overallFeedback || 'N/A' },
          { 'Feedback Category': 'Strengths', 'Feedback Content': feedback.strengths || 'N/A' },
          { 'Feedback Category': 'Weaknesses', 'Feedback Content': feedback.weaknesses || 'N/A' },
          { 'Feedback Category': 'Code Quality', 'Feedback Content': feedback.codeQuality || 'N/A' },
          {
            'Feedback Category': 'Algorithm Efficiency',
            'Feedback Content': feedback.algorithmEfficiency || 'N/A',
          },
          {
            'Feedback Category': 'Suggestions for Improvement',
            'Feedback Content': feedback.suggestionsForImprovement || 'N/A',
          },
          {
            'Feedback Category': 'Best Practices',
            'Feedback Content': feedback.bestPractices || 'N/A',
          },
          {
            'Feedback Category': 'Error Handling',
            'Feedback Content': feedback.errorHandling || 'N/A',
          },
        ];

        feedbackRows.forEach(row => {
          exportData.push({
            ...baseRow,
            'No.': '',
            'Feedback Category': row['Feedback Category'],
            'Feedback Content': row['Feedback Content'],
          });
        });

        // Fetch questions and rubrics
        const gradingGroup = filteredGradingGroups.find(g => g && g.id === sub.gradingGroupId);
        if (gradingGroup && gradingGroup.assessmentTemplateId) {
          try {
            const papersRes = await assessmentPaperService.getAssessmentPapers({
              assessmentTemplateId: gradingGroup.assessmentTemplateId,
              pageNumber: 1,
              pageSize: 100,
            });
            const papers = papersRes?.items || [];

            for (const paper of papers) {
              const questionsRes = await assessmentQuestionService.getAssessmentQuestions({
                assessmentPaperId: paper.id,
                pageNumber: 1,
                pageSize: 100,
              });
              const questions = questionsRes?.items || [];

              for (const question of questions) {
                const rubricsRes = await rubricItemService.getRubricsForQuestion({
                  assessmentQuestionId: question.id,
                  pageNumber: 1,
                  pageSize: 100,
                });
                const rubrics = rubricsRes?.items || [];

                for (const rubric of rubrics) {
                  exportData.push({
                    ...baseRow,
                    'No.': '',
                    'Feedback Category': '',
                    'Feedback Content': '',
                    Question: question.questionText || 'N/A',
                    Criteria: rubric.description || 'N/A',
                    Score: rubric.score || 0,
                    Description: rubric.description || 'N/A',
                  });
                }
              }
            }
          } catch (err) {
            console.error(`Failed to fetch questions/rubrics for submission ${sub.id}:`, err);
          }
        }
      }

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Grading Report');
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      const path = `${RNBlobUtil.fs.dirs.DownloadDir}/Grading_Report_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
      await RNBlobUtil.fs.writeFile(path, wbout, 'base64');

      if (Platform.OS === 'android') {
        await RNBlobUtil.android.addCompleteDownload({
          title: `Grading_Report_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`,
          description: 'Download complete',
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          path: path,
          showNotification: true,
        });
      }

      showSuccessToast('Success', 'Export successful');
    } catch (err: any) {
      console.error('Export error:', err);
      showErrorToast('Error', 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewDetail = (submission: EnrichedSubmission) => {
    if (submission?.id) {
      navigation.navigate('AssignmentGradingScreen', {
        submissionId: Number(submission.id),
      });
    }
  };

  const handleViewExam = (gradingGroup: GradingGroup) => {
    setSelectedGradingGroup(gradingGroup);
    setIsViewExamModalVisible(true);
  };

  const semesterOptions = useMemo(() => {
    return (semesterDetails || [])
      .filter(s => s && s.id)
      .map(s => ({
        label: s?.semesterCode || 'Unknown',
        value: Number(s?.id),
      }));
  }, [semesterDetails]);

  const gradingGroupOptions = useMemo(() => {
    return (filteredGradingGroups || [])
      .filter(g => g && g.id)
      .map(g => ({
        label: g.assessmentTemplateName || `Grading Group ${g.id}`,
        value: g.id,
      }));
  }, [filteredGradingGroups]);

  if (isLoading || isLecturerLoading) {
    return (
      <AppSafeView>
        <ScreenHeader title="My Grading Group" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader
        title="My Grading Group"
        rightIcon={
          <View style={styles.headerActions}>
            {filteredGradingGroups.length > 0 && (
              <TouchableOpacity
                onPress={() => handleViewExam(filteredGradingGroups[0])}
                style={styles.iconButton}
              >
                <Feather name="eye" size={s(20)} color={AppColors.pr500} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleExportExcel}
              disabled={isExporting}
              style={styles.iconButton}
            >
              <Feather
                name="download"
                size={s(20)}
                color={isExporting ? AppColors.n400 : AppColors.pr500}
              />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.container}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={value => setSelectedSemester(value || undefined)}
                items={[{ label: 'All Semesters', value: null }, ...semesterOptions]}
                placeholder={{ label: 'Filter by Semester', value: null }}
                value={selectedSemester}
                style={pickerSelectStyles}
              />
            </View>

            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={value => setSelectedGradingGroupId(value || undefined)}
                items={[{ label: 'All Assessments', value: null }, ...gradingGroupOptions]}
                placeholder={{ label: 'Filter by Assessment', value: null }}
                value={selectedGradingGroupId}
                style={pickerSelectStyles}
              />
            </View>
          </View>

          <AppTextInput
            placeholder="Search student or file..."
            value={searchText}
            onChangeText={setSearchText}
            icon={<Feather name="search" size={s(18)} color={AppColors.n500} />}
            style={styles.searchInput}
            searchType={true}
          />
        </View>

        {/* Submissions List */}
        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>No submissions found.</AppText>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => {
              const statusTag = getStatusTag(item.status);
              return (
                <TouchableOpacity
                  style={styles.submissionCard}
                  onPress={() => handleViewDetail(item)}
                  disabled={item.isSemesterPassed}
                >
                  <View style={styles.submissionHeader}>
                    <View style={styles.submissionInfo}>
                      <AppText variant="body14pxBold" style={styles.studentName}>
                        {item.studentName}
                      </AppText>
                      <AppText variant="body12pxRegular" style={styles.studentCode}>
                        {item.studentCode}
                      </AppText>
                    </View>
                    <View
                      style={[
                        styles.statusTag,
                        { backgroundColor: statusTag.bgColor },
                      ]}
                    >
                      <AppText
                        variant="body12pxRegular"
                        style={[styles.statusText, { color: statusTag.color }]}
                      >
                        {statusTag.text}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.submissionDetails}>
                    <View style={styles.detailRow}>
                      <Feather name="file" size={s(14)} color={AppColors.n500} />
                      <AppText variant="body12pxRegular" style={styles.detailText}>
                        {item.submissionFile?.name || 'N/A'}
                      </AppText>
                    </View>
                    <View style={styles.detailRow}>
                      <Feather name="clock" size={s(14)} color={AppColors.n500} />
                      <AppText variant="body12pxRegular" style={styles.detailText}>
                        {item.submittedAt
                          ? dayjs(item.submittedAt).format('DD/MM/YYYY HH:mm')
                          : 'N/A'}
                      </AppText>
                    </View>
                    <View style={styles.detailRow}>
                      <Feather name="award" size={s(14)} color={AppColors.n500} />
                      <AppText
                        variant="body12pxBold"
                        style={[
                          styles.gradeText,
                          { color: item.lastGrade > 0 ? AppColors.g500 : AppColors.n500 },
                        ]}
                      >
                        {item.lastGrade > 0 ? `${item.lastGrade}/100` : 'Not graded'}
                      </AppText>
                    </View>
                  </View>

                  {item.isSemesterPassed && (
                    <View style={styles.warningBanner}>
                      <AppText variant="body12pxRegular" style={styles.warningText}>
                        Semester has ended. Cannot edit grades.
                      </AppText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* View Exam Modal */}
      <ViewExamModal
        visible={isViewExamModalVisible}
        onClose={() => {
          setIsViewExamModalVisible(false);
          setSelectedGradingGroup(null);
        }}
        gradingGroup={selectedGradingGroup}
      />
    </AppSafeView>
  );
};

// View Exam Modal Component
const ViewExamModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  gradingGroup: GradingGroup | null;
}> = ({ visible, onClose, gradingGroup }) => {
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<{ [paperId: number]: any[] }>({});
  const [rubrics, setRubrics] = useState<{ [questionId: number]: any[] }>({});

  useEffect(() => {
    if (visible && gradingGroup?.assessmentTemplateId) {
      fetchExamData();
    }
  }, [visible, gradingGroup]);

  const fetchExamData = async () => {
    if (!gradingGroup?.assessmentTemplateId) return;

    setLoading(true);
    try {
      const papersRes = await assessmentPaperService.getAssessmentPapers({
        assessmentTemplateId: gradingGroup.assessmentTemplateId,
        pageNumber: 1,
        pageSize: 100,
      });
      const papersData = papersRes?.items || [];
      setPapers(papersData);

      const questionsMap: { [paperId: number]: any[] } = {};
      const rubricsMap: { [questionId: number]: any[] } = {};

      for (const paper of papersData) {
        const questionsRes = await assessmentQuestionService.getAssessmentQuestions({
          assessmentPaperId: paper.id,
          pageNumber: 1,
          pageSize: 100,
        });
        const questionsData = (questionsRes?.items || []).sort(
          (a, b) => (a.questionNumber || 0) - (b.questionNumber || 0),
        );
        questionsMap[paper.id] = questionsData;

        for (const question of questionsData) {
          const rubricsRes = await rubricItemService.getRubricsForQuestion({
            assessmentQuestionId: question.id,
            pageNumber: 1,
            pageSize: 100,
          });
          const rubricsData = rubricsRes?.items || [];
          rubricsMap[question.id] = rubricsData;
        }
      }

      setQuestions(questionsMap);
      setRubrics(rubricsMap);
    } catch (err) {
      console.error('Failed to fetch exam data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <AppText variant="h4" style={styles.modalTitle}>
            View Exam
          </AppText>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={s(24)} color={AppColors.n700} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.modalLoadingContainer}>
            <ActivityIndicator size="large" color={AppColors.pr500} />
          </View>
        ) : (
          <View style={styles.modalContent}>
            {gradingGroup && (
              <>
                <AppText variant="h5" style={styles.examTitle}>
                  {gradingGroup.assessmentTemplateName || 'Exam'}
                </AppText>
                <AppText variant="body12pxRegular" style={styles.examDescription}>
                  {gradingGroup.assessmentTemplateDescription || 'No description'}
                </AppText>

                {papers.length === 0 ? (
                  <AppText style={styles.emptyText}>No papers found.</AppText>
                ) : (
                  papers.map(paper => (
                    <View key={paper.id} style={styles.paperSection}>
                      <AppText variant="body14pxBold" style={styles.paperTitle}>
                        {paper.name || `Paper ${paper.id}`}
                      </AppText>
                      <AppText variant="body12pxRegular" style={styles.paperDescription}>
                        {paper.description || 'No description'}
                      </AppText>

                      {questions[paper.id] && questions[paper.id].length > 0 && (
                        <View style={styles.questionsContainer}>
                          {questions[paper.id].map(question => (
                            <View key={question.id} style={styles.questionCard}>
                              <AppText variant="body14pxBold" style={styles.questionTitle}>
                                Q{question.questionNumber || '?'}: {question.questionText || 'No question text'}
                              </AppText>
                              {rubrics[question.id] && rubrics[question.id].length > 0 && (
                                <View style={styles.rubricsContainer}>
                                  {rubrics[question.id].map(rubric => (
                                    <View key={rubric.id} style={styles.rubricItem}>
                                      <AppText variant="body12pxRegular">
                                        • {rubric.description} (Score: {rubric.score})
                                      </AppText>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        )}
      </Modal>
    </Portal>
  );
};

const pickerSelectStyles = {
  inputIOS: {
    fontSize: s(14),
    paddingVertical: vs(12),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(8),
    color: AppColors.n900,
    backgroundColor: AppColors.white,
  },
  inputAndroid: {
    fontSize: s(14),
    paddingVertical: vs(12),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: AppColors.n300,
    borderRadius: s(8),
    color: AppColors.n900,
    backgroundColor: AppColors.white,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: s(20),
    paddingTop: vs(10),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: s(12),
  },
  iconButton: {
    padding: s(4),
  },
  filtersContainer: {
    marginBottom: vs(16),
  },
  filterRow: {
    flexDirection: 'row',
    gap: s(10),
    marginBottom: vs(10),
  },
  pickerContainer: {
    flex: 1,
  },
  searchInput: {
    marginTop: vs(8),
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
  listContent: {
    paddingBottom: vs(20),
  },
  separator: {
    height: vs(12),
  },
  submissionCard: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    padding: s(16),
    borderWidth: 1,
    borderColor: AppColors.n200,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(12),
  },
  submissionInfo: {
    flex: 1,
  },
  studentName: {
    marginBottom: vs(4),
  },
  studentCode: {
    color: AppColors.n600,
  },
  statusTag: {
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(6),
  },
  statusText: {
    fontWeight: '500',
  },
  submissionDetails: {
    gap: vs(6),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  detailText: {
    color: AppColors.n700,
    flex: 1,
  },
  gradeText: {
    fontWeight: '600',
  },
  warningBanner: {
    marginTop: vs(8),
    padding: s(8),
    backgroundColor: AppColors.r100,
    borderRadius: s(6),
  },
  warningText: {
    color: AppColors.r500,
  },
  modalContainer: {
    backgroundColor: AppColors.white,
    margin: s(20),
    borderRadius: s(12),
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(20),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  modalTitle: {
    fontWeight: '600',
  },
  modalLoadingContainer: {
    padding: vs(40),
    alignItems: 'center',
  },
  modalContent: {
    padding: s(20),
  },
  examTitle: {
    marginBottom: vs(8),
    fontWeight: '600',
  },
  examDescription: {
    color: AppColors.n600,
    marginBottom: vs(20),
  },
  paperSection: {
    marginBottom: vs(20),
    paddingBottom: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  paperTitle: {
    marginBottom: vs(4),
  },
  paperDescription: {
    color: AppColors.n600,
    marginBottom: vs(12),
  },
  questionsContainer: {
    gap: vs(12),
  },
  questionCard: {
    backgroundColor: AppColors.n100,
    borderRadius: s(8),
    padding: s(12),
  },
  questionTitle: {
    marginBottom: vs(8),
  },
  rubricsContainer: {
    gap: vs(4),
  },
  rubricItem: {
    paddingLeft: s(8),
  },
});

export default MyGradingGroupScreen;

