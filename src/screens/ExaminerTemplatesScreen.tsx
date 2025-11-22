import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { getFilesForTemplate } from '../api/assessmentFileService';
import { getAssessmentPapers } from '../api/assessmentPaperService';
import { getAssessmentQuestions } from '../api/assessmentQuestionService';
import { assessmentTemplateService } from '../api/assessmentTemplateServiceWrapper';
import { fetchCourseElements } from '../api/courseElementService';
import { getRubricsForQuestion } from '../api/rubricItemService';
import { fetchSemesterPlanDetail, fetchSemesters, SemesterData } from '../api/semesterService';
import AppButton from '../components/buttons/AppButton';
import CollapsibleSection from '../components/common/CollapsibleSection';
import ScreenHeader from '../components/common/ScreenHeader';
import TemplateTable from '../components/examiner/TemplateTable';
import CustomModal from '../components/modals/CustomModal';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

interface AssessmentTemplate {
  id: number;
  name: string;
  description: string;
  courseElementName: string;
  lecturerName: string;
  lecturerCode: string;
  createdAt: string;
  courseElementId: number;
  templateType: number;
  status?: number;
}

interface AssessmentPaper {
  id: number;
  name: string;
  description: string;
}

interface AssessmentQuestion {
  id: number;
  questionText: string;
  questionSampleInput: string;
  questionSampleOutput: string;
  score: number;
  questionNumber?: number;
}

interface RubricItem {
  id: number;
  description: string;
  score: number;
}

interface AssessmentFile {
  id: number;
  name: string;
  fileUrl: string;
}

// Helper function to check if an assessment template is a PE (Practical Exam)
function isPracticalExamTemplate(template: AssessmentTemplate): boolean {
  const name = (template.courseElementName || '').toLowerCase();
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
  return keywords.some((keyword) => name.includes(keyword));
}

const ExaminerTemplatesScreen = () => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [allTemplates, setAllTemplates] = useState<AssessmentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<AssessmentTemplate[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseElements, setCourseElements] = useState<any[]>([]);
  const [allCourseElementsMap, setAllCourseElementsMap] = useState<Map<number, any>>(new Map());

  const [selectedSemesterCode, setSelectedSemesterCode] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourseElementId, setSelectedCourseElementId] = useState<number | null>(null);

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingCourseElements, setLoadingCourseElements] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [papers, setPapers] = useState<AssessmentPaper[]>([]);
  const [questions, setQuestions] = useState<{ [paperId: number]: AssessmentQuestion[] }>({});
  const [rubrics, setRubrics] = useState<{ [questionId: number]: RubricItem[] }>({});
  const [files, setFiles] = useState<AssessmentFile[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch semesters
      const semesterList = await fetchSemesters({ pageNumber: 1, pageSize: 1000 });
      setSemesters(semesterList || []);

      // Fetch all assessment templates
      const response = await assessmentTemplateService.getAssessmentTemplates({
        pageNumber: 1,
        pageSize: 1000,
      });

      // Filter only PE (Practical Exam) templates
      const peTemplates = (response?.items || []).filter(isPracticalExamTemplate);
      setAllTemplates(peTemplates);
      setFilteredTemplates(peTemplates);

      // Fetch all course elements for filtering and create a map
      const allCourseElementsRes = await fetchCourseElements();
      const courseElementMap = new Map<number, any>();
      (allCourseElementsRes || []).forEach((ce: any) => {
        courseElementMap.set(ce.id, ce);
      });
      setAllCourseElementsMap(courseElementMap);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      showErrorToast('Error', err.message || 'Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchCourses = useCallback(async (semesterCode: string) => {
    setLoadingCourses(true);
    try {
      // Fetch semester plan detail to get courses
      const semesterDetail = await fetchSemesterPlanDetail(semesterCode);
      setCourses(semesterDetail.semesterCourses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      // Fallback: get courses from course elements filtered by semester
      try {
        const courseElementsRes = await fetchCourseElements();
        const filtered = (courseElementsRes || []).filter((ce: any) =>
          ce.semesterCourse?.semester?.semesterCode === semesterCode
        );
        const uniqueCourses = new Map<number, any>();
        filtered.forEach((ce: any) => {
          if (ce.semesterCourse?.course) {
            const courseId = ce.semesterCourse.course.id;
            if (!uniqueCourses.has(courseId)) {
              uniqueCourses.set(courseId, ce.semesterCourse.course);
            }
          }
        });
        setCourses(Array.from(uniqueCourses.values()));
      } catch (fallbackErr) {
        console.error('Failed to fetch courses from course elements:', fallbackErr);
        setCourses([]);
      }
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  const fetchCourseElementsForFilter = useCallback(async (semesterCode: string, courseId?: number) => {
    setLoadingCourseElements(true);
    try {
      const courseElementsRes = await fetchCourseElements();
      let filtered = (courseElementsRes || []).filter((ce: any) =>
        ce.semesterCourse?.semester?.semesterCode === semesterCode
      );
      if (courseId) {
        filtered = filtered.filter((ce: any) =>
          ce.semesterCourse?.courseId === courseId
        );
      }
      setCourseElements(filtered);
    } catch (err) {
      console.error('Failed to fetch course elements:', err);
      setCourseElements([]);
    } finally {
      setLoadingCourseElements(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSemesterCode) {
      fetchCourses(selectedSemesterCode);
      fetchCourseElementsForFilter(selectedSemesterCode, selectedCourseId || undefined);
    } else {
      setCourses([]);
      setCourseElements([]);
      setSelectedCourseId(null);
      setSelectedCourseElementId(null);
    }
  }, [selectedSemesterCode, fetchCourses, fetchCourseElementsForFilter]);

  useEffect(() => {
    if (selectedSemesterCode) {
      fetchCourseElementsForFilter(selectedSemesterCode, selectedCourseId || undefined);
    }
    setSelectedCourseElementId(null);
  }, [selectedCourseId, selectedSemesterCode, fetchCourseElementsForFilter]);

  // Filter templates based on selected filters
  useEffect(() => {
    let filtered = [...allTemplates];

    if (selectedSemesterCode) {
      const semesterCourseElementIds = Array.from(allCourseElementsMap.values())
        .filter((ce: any) => {
          const semesterCode = ce.semesterCourse?.semester?.semesterCode;
          return semesterCode === selectedSemesterCode;
        })
        .map((ce: any) => ce.id);

      filtered = filtered.filter((template) =>
        semesterCourseElementIds.includes(template.courseElementId)
      );
    }

    if (selectedCourseId) {
      const courseElementIds = Array.from(allCourseElementsMap.values())
        .filter((ce: any) => {
          const courseId = ce.semesterCourse?.course?.id || ce.semesterCourse?.courseId;
          return courseId === selectedCourseId;
        })
        .map((ce: any) => ce.id);

      filtered = filtered.filter((template) =>
        courseElementIds.includes(template.courseElementId)
      );
    }

    if (selectedCourseElementId) {
      filtered = filtered.filter(
        (template) => template.courseElementId === selectedCourseElementId
      );
    }

    setFilteredTemplates(filtered);
  }, [allTemplates, selectedSemesterCode, selectedCourseId, selectedCourseElementId, allCourseElementsMap]);

  const handleSemesterChange = (value: string | null) => {
    setSelectedSemesterCode(value);
    setSelectedCourseId(null);
    setSelectedCourseElementId(null);
  };

  const handleCourseChange = (value: number | null) => {
    setSelectedCourseId(value);
    setSelectedCourseElementId(null);
  };

  const handleCourseElementChange = (value: number | null) => {
    setSelectedCourseElementId(value);
  };

  const handleViewTemplate = async (template: AssessmentTemplate) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
    setModalLoading(true);

    try {
      // Use /AssessmentFile/page endpoint (same as web version)
      try {
        const filesRes = await getFilesForTemplate({
          assessmentTemplateId: template.id,
          pageNumber: 1,
          pageSize: 100,
        });
        setFiles(filesRes.items || []);
      } catch (err: any) {
        // Silently handle 404 errors as they're expected when template has no files
        if (err?.response?.status === 404 || err?.message?.includes('404')) {
          setFiles([]);
        } else {
          console.error('Failed to fetch files:', err);
          setFiles([]);
        }
      }

      // Fetch papers
      let papersData: AssessmentPaper[] = [];
      try {
        const papersRes = await getAssessmentPapers({
          assessmentTemplateId: template.id,
          pageNumber: 1,
          pageSize: 100,
        });
        papersData = papersRes.items || [];
      } catch (err) {
        console.error('Failed to fetch papers:', err);
        papersData = [];
      }
      setPapers(papersData);

      // Fetch questions for each paper
      const questionsMap: { [paperId: number]: AssessmentQuestion[] } = {};
      const rubricsMap: { [questionId: number]: RubricItem[] } = {};

      for (const paper of papersData) {
        try {
          const questionsRes = await getAssessmentQuestions({
            assessmentPaperId: paper.id,
            pageNumber: 1,
            pageSize: 100,
          });
          const sortedQuestions = [...(questionsRes.items || [])].sort(
            (a, b) => (a.questionNumber || 0) - (b.questionNumber || 0)
          );
          questionsMap[paper.id] = sortedQuestions;

          // Fetch rubrics for each question
          for (const question of sortedQuestions) {
            try {
              const rubricsRes = await getRubricsForQuestion({
                assessmentQuestionId: question.id,
                pageNumber: 1,
                pageSize: 100,
              });
              rubricsMap[question.id] = rubricsRes.items || [];
            } catch (err) {
              console.error(`Failed to fetch rubrics for question ${question.id}:`, err);
              rubricsMap[question.id] = [];
            }
          }
        } catch (err) {
          console.error(`Failed to fetch questions for paper ${paper.id}:`, err);
          questionsMap[paper.id] = [];
        }
      }

      setQuestions(questionsMap);
      setRubrics(rubricsMap);
    } catch (err: any) {
      console.error('Failed to fetch template data:', err);
      showErrorToast('Error', 'Failed to load template details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTemplate(null);
    setPapers([]);
    setQuestions({});
    setRubrics({});
    setFiles([]);
  };

  const getTypeText = (type: number) => {
    const typeMap: Record<number, string> = {
      0: 'Assignment',
      1: 'API',
      2: 'Code',
    };
    return typeMap[type] || 'Unknown';
  };

  const getStatusText = (status: number | undefined) => {
    if (status === undefined) return 'N/A';
    const statusMap: Record<number, string> = {
      1: 'PENDING',
      2: 'ACCEPTED',
      3: 'REJECTED',
      4: 'IN_PROGRESS',
      5: 'COMPLETED',
    };
    return statusMap[status] || 'UNKNOWN';
  };

  const getStatusColor = (status: number | undefined) => {
    if (status === undefined) return AppColors.n400;
    const colorMap: Record<number, string> = {
      1: AppColors.y500,
      2: AppColors.g500,
      3: AppColors.r500,
      4: AppColors.b500,
      5: AppColors.g500,
    };
    return colorMap[status] || AppColors.n400;
  };

  // Removed renderTemplateItem - using TemplateTable instead

  if (isLoading) {
    return (
      <AppSafeView>
        <ScreenHeader title="Practical Exam Templates" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader
        title="Practical Exam Templates"
        rightIcon={
          <TouchableOpacity onPress={fetchData}>
            <Feather name="refresh-cw" size={s(24)} color={AppColors.pr500} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {/* Filters */}
        <View style={styles.filtersCard}>
          <AppText style={styles.filtersTitle}>Filters</AppText>
          <View style={styles.filtersRow}>
            <View style={styles.filterItem}>
              <AppText style={styles.filterLabel}>Semester</AppText>
              <RNPickerSelect
                onValueChange={handleSemesterChange}
                placeholder={{ label: 'Select semester', value: null }}
                items={[
                  { label: 'All Semesters', value: null },
                  ...semesters.map((s) => ({
                    label: `${s.semesterCode} (${s.academicYear})`,
                    value: s.semesterCode,
                  })),
                ]}
                value={selectedSemesterCode}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
              />
            </View>
            <View style={styles.filterItem}>
              <AppText style={styles.filterLabel}>Course</AppText>
              <RNPickerSelect
                onValueChange={handleCourseChange}
                placeholder={{ label: 'Select course', value: null }}
                disabled={!selectedSemesterCode}
                items={[
                  { label: 'All Courses', value: null },
                  ...courses.map((c) => ({
                    label: `${c.course?.code || ''} - ${c.course?.name || ''}`,
                    value: c.course?.id,
                  })).filter(opt => opt.value),
                ]}
                value={selectedCourseId}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
              />
            </View>
            <View style={styles.filterItem}>
              <AppText style={styles.filterLabel}>Course Element</AppText>
              <RNPickerSelect
                onValueChange={handleCourseElementChange}
                placeholder={{ label: 'Select course element', value: null }}
                disabled={!selectedSemesterCode}
                items={[
                  { label: 'All Course Elements', value: null },
                  ...courseElements.map((ce) => ({
                    label: ce.name,
                    value: ce.id,
                  })),
                ]}
                value={selectedCourseElementId}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
              />
            </View>
          </View>
        </View>

        {/* Templates Table */}
        <TemplateTable
          isLoading={isLoading}
          data={filteredTemplates}
          onView={handleViewTemplate}
        />
      </ScrollView>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <CustomModal
          visible={isViewModalOpen}
          onClose={handleCloseViewModal}
          title="Template Details"
          disableScrollView={true}
        >
          {modalLoading ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color={AppColors.pr500} />
            </View>
          ) : (
            <View style={styles.modalWrapper}>
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Feather name="info" size={s(18)} color={AppColors.pr500} />
                    <AppText variant="body16pxBold" style={styles.modalSectionTitle}>
                      Template Information
                    </AppText>
                  </View>
                  <View style={styles.modalInfoCard}>
                    <View style={styles.modalInfoRow}>
                      <AppText style={styles.modalInfoLabel}>Template Name:</AppText>
                      <AppText style={styles.modalInfoValue}>{selectedTemplate.name}</AppText>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalInfoRow}>
                      <AppText style={styles.modalInfoLabel}>Course Element:</AppText>
                      <AppText style={styles.modalInfoValue}>
                        {selectedTemplate.courseElementName}
                      </AppText>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalInfoRow}>
                      <AppText style={styles.modalInfoLabel}>Description:</AppText>
                      <AppText style={styles.modalInfoValue}>
                        {selectedTemplate.description || 'No description'}
                      </AppText>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalInfoRow}>
                      <AppText style={styles.modalInfoLabel}>Type:</AppText>
                      <View style={styles.typeBadge}>
                        <AppText style={styles.typeBadgeText}>
                          {getTypeText(selectedTemplate.templateType)}
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalInfoRow}>
                      <AppText style={styles.modalInfoLabel}>Status:</AppText>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTemplate.status) }]}>
                        <AppText style={styles.statusBadgeText}>
                          {getStatusText(selectedTemplate.status)}
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalInfoRow}>
                      <AppText style={styles.modalInfoLabel}>Lecturer:</AppText>
                      <AppText style={styles.modalInfoValue}>
                        {selectedTemplate.lecturerName} ({selectedTemplate.lecturerCode})
                      </AppText>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalInfoRow}>
                      <AppText style={styles.modalInfoLabel}>Created At:</AppText>
                      <AppText style={styles.modalInfoValue}>
                        {(() => {
                          try {
                            if (!selectedTemplate.createdAt) return 'N/A';
                            const date = dayjs(selectedTemplate.createdAt);
                            if (date.isValid()) {
                              return date.format('DD/MM/YYYY HH:mm');
                            }
                            return 'N/A';
                          } catch (err) {
                            console.error('Error formatting createdAt:', err);
                            return 'N/A';
                          }
                        })()}
                      </AppText>
                    </View>
                  </View>
                </View>

                {files.length > 0 && (
                  <View style={styles.modalSection}>
                    <View style={styles.modalSectionHeader}>
                      <Feather name="file-text" size={s(18)} color={AppColors.pr500} />
                      <AppText variant="body16pxBold" style={styles.modalSectionTitle}>
                        Files ({files.length})
                      </AppText>
                    </View>
                    <View style={styles.filesContainer}>
                      {files.map((file) => (
                        <TouchableOpacity
                          key={file.id}
                          style={styles.fileItem}
                          onPress={() => {
                            // Handle file download
                          }}
                        >
                          <View style={styles.fileIconContainer}>
                            <Feather name="file" size={s(20)} color={AppColors.pr500} />
                          </View>
                          <AppText style={styles.fileName} numberOfLines={1}>{file.name}</AppText>
                          <Feather name="download" size={s(18)} color={AppColors.n500} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {papers.length > 0 ? (
                  <View style={styles.modalSection}>
                    <View style={styles.modalSectionHeader}>
                      <Feather name="book-open" size={s(18)} color={AppColors.pr500} />
                      <AppText variant="body16pxBold" style={styles.modalSectionTitle}>
                        Papers & Questions ({papers.length})
                      </AppText>
                    </View>
                    {papers.map((paper) => (
                      <CollapsibleSection
                        key={paper.id}
                        title={`${paper.name || `Paper ${paper.id}`}${paper.description ? ` - ${paper.description}` : ''}`}
                        defaultExpanded={false}
                        style={styles.paperSection}
                      >
                        {questions[paper.id] && questions[paper.id].length > 0 ? (
                          <View style={styles.questionsContainer}>
                            {questions[paper.id].map((question, index) => (
                              <View key={question.id} style={styles.questionCard}>
                                <View style={styles.questionHeader}>
                                  <View style={styles.questionNumberBadge}>
                                    <AppText style={styles.questionNumberText}>
                                      Q{question.questionNumber || index + 1}
                                    </AppText>
                                  </View>
                                  {question.score && (
                                    <View style={styles.scoreBadge}>
                                      <AppText style={styles.scoreText}>
                                        {question.score} pts
                                      </AppText>
                                    </View>
                                  )}
                                </View>
                                <AppText style={styles.questionText}>
                                  {question.questionText}
                                </AppText>
                                {question.questionSampleInput && (
                                  <View style={styles.sampleContainer}>
                                    <View style={styles.sampleHeader}>
                                      <Feather name="code" size={s(14)} color={AppColors.n600} />
                                      <AppText style={styles.sampleLabel}>Sample Input:</AppText>
                                    </View>
                                    <View style={styles.codeBlock}>
                                      <AppText style={styles.codeText}>
                                        {question.questionSampleInput}
                                      </AppText>
                                    </View>
                                  </View>
                                )}
                                {question.questionSampleOutput && (
                                  <View style={styles.sampleContainer}>
                                    <View style={styles.sampleHeader}>
                                      <Feather name="check-circle" size={s(14)} color={AppColors.n600} />
                                      <AppText style={styles.sampleLabel}>Sample Output:</AppText>
                                    </View>
                                    <View style={styles.codeBlock}>
                                      <AppText style={styles.codeText}>
                                        {question.questionSampleOutput}
                                      </AppText>
                                    </View>
                                  </View>
                                )}
                                {rubrics[question.id] && rubrics[question.id].length > 0 && (
                                  <View style={styles.rubricsContainer}>
                                    <View style={styles.rubricsHeader}>
                                      <Feather name="list" size={s(14)} color={AppColors.n600} />
                                      <AppText style={styles.rubricsTitle}>Rubrics ({rubrics[question.id].length}):</AppText>
                                    </View>
                                    {rubrics[question.id].map((rubric) => (
                                      <View key={rubric.id} style={styles.rubricItem}>
                                        <View style={styles.rubricBullet} />
                                        <AppText style={styles.rubricText}>
                                          {rubric.description} <AppText style={styles.rubricScore}>({rubric.score} pts)</AppText>
                                        </AppText>
                                      </View>
                                    ))}
                                  </View>
                                )}
                              </View>
                            ))}
                          </View>
                        ) : (
                          <View style={styles.emptyState}>
                            <Feather name="inbox" size={s(32)} color={AppColors.n400} />
                            <AppText style={styles.noQuestionsText}>
                              No questions found for this paper.
                            </AppText>
                          </View>
                        )}
                      </CollapsibleSection>
                    ))}
                  </View>
                ) : (
                  <View style={styles.modalSection}>
                    <View style={styles.modalSectionHeader}>
                      <Feather name="book-open" size={s(18)} color={AppColors.pr500} />
                      <AppText variant="body16pxBold" style={styles.modalSectionTitle}>
                        Papers & Questions
                      </AppText>
                    </View>
                    <View style={styles.emptyState}>
                      <Feather name="inbox" size={s(32)} color={AppColors.n400} />
                      <AppText style={styles.noQuestionsText}>
                        No papers found for this template.
                      </AppText>
                    </View>
                  </View>
                )}
              </ScrollView>
              <View style={styles.modalFooter}>
                <AppButton
                  title="Close"
                  onPress={handleCloseViewModal}
                  style={styles.closeButton}
                  textVariant="body14pxBold"
                />
              </View>
            </View>
          )}
        </CustomModal>
      )}
    </AppSafeView>
  );
};

export default ExaminerTemplatesScreen;

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
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: s(20),
    backgroundColor: AppColors.n100,
    flexGrow: 1,
    paddingBottom: vs(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  filtersCard: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    padding: s(16),
    marginBottom: vs(20),
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  filtersTitle: {
    fontSize: s(16),
    fontWeight: '700',
    color: AppColors.n900,
    marginBottom: vs(12),
  },
  filtersRow: {
    gap: vs(12),
  },
  filterItem: {
    marginBottom: vs(8),
  },
  filterLabel: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n700,
    marginBottom: vs(8),
  },
  modalWrapper: {
    flex: 1,
    maxHeight: '80%',
    width: '100%',
    alignSelf: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: vs(20),
  },
  modalLoadingContainer: {
    padding: s(40),
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: vs(200),
  },
  modalSection: {
    marginBottom: vs(24),
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
    gap: s(8),
  },
  modalSectionTitle: {
    fontSize: s(16),
    color: AppColors.n900,
  },
  modalInfoCard: {
    backgroundColor: AppColors.n100,
    borderRadius: s(12),
    padding: s(16),
    borderWidth: 1,
    borderColor: AppColors.n200,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(8),
    flexWrap: 'wrap',
  },
  modalDivider: {
    height: 1,
    backgroundColor: AppColors.n200,
    marginVertical: vs(4),
  },
  modalInfoLabel: {
    fontSize: s(13),
    fontWeight: '600',
    color: AppColors.n700,
    minWidth: s(110),
    marginRight: s(8),
  },
  modalInfoValue: {
    fontSize: s(13),
    color: AppColors.n900,
    flex: 1,
    flexWrap: 'wrap',
  },
  typeBadge: {
    backgroundColor: AppColors.pr100,
    paddingHorizontal: s(12),
    paddingVertical: vs(4),
    borderRadius: s(6),
  },
  typeBadgeText: {
    fontSize: s(12),
    fontWeight: '600',
    color: AppColors.pr500,
  },
  statusBadge: {
    paddingHorizontal: s(12),
    paddingVertical: vs(4),
    borderRadius: s(6),
  },
  statusBadgeText: {
    fontSize: s(12),
    fontWeight: '600',
    color: AppColors.white,
  },
  filesContainer: {
    gap: vs(8),
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(14),
    backgroundColor: AppColors.white,
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: AppColors.n200,
    gap: s(12),
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fileIconContainer: {
    width: s(36),
    height: s(36),
    borderRadius: s(8),
    backgroundColor: AppColors.pr100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: s(14),
    color: AppColors.n900,
    flex: 1,
    fontWeight: '500',
  },
  paperSection: {
    marginBottom: vs(12),
  },
  questionsContainer: {
    gap: vs(16),
  },
  questionCard: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    padding: s(16),
    borderWidth: 1,
    borderColor: AppColors.n200,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
    gap: s(8),
  },
  questionNumberBadge: {
    backgroundColor: AppColors.pr500,
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(6),
  },
  questionNumberText: {
    fontSize: s(12),
    fontWeight: '700',
    color: AppColors.white,
  },
  scoreBadge: {
    backgroundColor: AppColors.g100,
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(6),
  },
  scoreText: {
    fontSize: s(12),
    fontWeight: '600',
    color: AppColors.g500,
  },
  questionText: {
    fontSize: s(14),
    color: AppColors.n800,
    lineHeight: vs(22),
    marginBottom: vs(12),
  },
  sampleContainer: {
    marginTop: vs(12),
    marginBottom: vs(8),
  },
  sampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(6),
    gap: s(6),
  },
  sampleLabel: {
    fontSize: s(13),
    fontWeight: '600',
    color: AppColors.n700,
  },
  codeBlock: {
    backgroundColor: AppColors.n900,
    borderRadius: s(8),
    padding: s(14),
    marginTop: vs(4),
  },
  codeText: {
    fontSize: s(12),
    fontFamily: 'monospace',
    color: AppColors.g300,
    lineHeight: vs(18),
  },
  rubricsContainer: {
    marginTop: vs(16),
    paddingTop: vs(16),
    borderTopWidth: 1,
    borderTopColor: AppColors.n200,
  },
  rubricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
    gap: s(6),
  },
  rubricsTitle: {
    fontSize: s(13),
    fontWeight: '600',
    color: AppColors.n700,
  },
  rubricItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(8),
    paddingLeft: s(4),
  },
  rubricBullet: {
    width: s(6),
    height: s(6),
    borderRadius: s(3),
    backgroundColor: AppColors.pr500,
    marginTop: vs(6),
    marginRight: s(10),
  },
  rubricText: {
    fontSize: s(13),
    color: AppColors.n800,
    flex: 1,
    lineHeight: vs(20),
  },
  rubricScore: {
    fontSize: s(12),
    fontWeight: '600',
    color: AppColors.pr500,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(32),
    paddingHorizontal: s(20),
  },
  noQuestionsText: {
    fontSize: s(13),
    color: AppColors.n500,
    fontStyle: 'italic',
    marginTop: vs(8),
    textAlign: 'center',
  },
  modalFooter: {
    paddingTop: vs(16),
    paddingBottom: vs(8),
    borderTopWidth: 1,
    borderTopColor: AppColors.n200,
    backgroundColor: AppColors.white,
  },
  closeButton: {
    width: '100%',
    borderRadius: s(10),
  },
});

