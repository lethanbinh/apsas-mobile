import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { pick, types } from '@react-native-documents/picker';
import { AssignRequestData } from '../../api/assignRequestService';
import { assessmentTemplateService, AssessmentTemplate } from '../../api/assessmentTemplateServiceWrapper';
import { assessmentPaperService, AssessmentPaper } from '../../api/assessmentPaperServiceWrapper';
import { assessmentQuestionService, AssessmentQuestion } from '../../api/assessmentQuestionServiceWrapper';
import { rubricItemService, RubricItem } from '../../api/rubricItemServiceWrapper';
import { assessmentFileService, AssessmentFile } from '../../api/assessmentFileServiceWrapper';
import { uploadAssessmentFile, deleteAssessmentFile } from '../../api/assessmentFileService';
import AppText from '../texts/AppText';
import AppButton from '../buttons/AppButton';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import { AppColors } from '../../styles/color';
import Feather from 'react-native-vector-icons/Feather';
import TemplateFormModal from '../modals/TemplateFormModal';
import PaperFormModal from '../modals/PaperFormModal';
import QuestionFormModal from '../modals/QuestionFormModal';
import RubricFormModal from '../modals/RubricFormModal';

interface LecturerTaskContentProps {
  task: AssignRequestData;
  lecturerId: number;
  onRefresh?: () => void;
}

// Convert AssignRequestData to AssignRequestItem format (compatible with web)
const convertTaskToAssignRequestItem = (task: AssignRequestData) => ({
  id: task.id,
  message: task.message,
  status: task.status,
  assignedAt: task.assignedAt,
  courseElementId: Number(task.courseElementId),
  assignedLecturerId: Number(task.assignedLecturerId),
  assignedByHODId: Number(task.assignedByHODId),
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  courseElementName: task.courseElementName,
  courseElementDescription: task.courseElementDescription,
  courseName: task.courseName,
  semesterName: task.semesterName,
  assignedLecturerName: task.assignedLecturerName,
  assignedLecturerDepartment: task.assignedLecturerDepartment,
  assignedByHODName: task.assignedByHODName,
});

export const LecturerTaskContent: React.FC<LecturerTaskContentProps> = ({
  task,
  lecturerId,
  onRefresh,
}) => {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [template, setTemplate] = useState<AssessmentTemplate | null>(null);
  const [papers, setPapers] = useState<AssessmentPaper[]>([]);
  const [allQuestions, setAllQuestions] = useState<{
    [paperId: number]: AssessmentQuestion[];
  }>({});
  const [files, setFiles] = useState<AssessmentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  
  // Modal states
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  
  // Selected items for edit
  const [selectedPaper, setSelectedPaper] = useState<AssessmentPaper | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null);
  const [selectedRubric, setSelectedRubric] = useState<RubricItem | null>(null);
  const [paperForNewQuestion, setPaperForNewQuestion] = useState<number | undefined>(undefined);
  const [questionForNewRubric, setQuestionForNewRubric] = useState<number | undefined>(undefined);
  
  // Rubrics state
  const [rubrics, setRubrics] = useState<{ [questionId: number]: RubricItem[] }>({});
  
  // Memoize taskItem to prevent infinite loops
  const taskItem = React.useMemo(
    () => convertTaskToAssignRequestItem(task),
    [task.id, task.courseElementId, task.assignedLecturerId, task.assignedByHODId],
  );
  const isEditable = [1, 4].includes(Number(task.status));
  const isCurrentTemplateEditable = template?.assignRequestId === task.id && isEditable;

  const fetchAllData = async (templateId: number) => {
    if (!isMounted) return;
    
    try {
      const paperResponse = await assessmentPaperService.getAssessmentPapers({
        assessmentTemplateId: templateId,
        pageNumber: 1,
        pageSize: 100,
      });
      
      if (!isMounted) return;
      
      setPapers(paperResponse?.items || []);

      const questionsMap: { [paperId: number]: AssessmentQuestion[] } = {};
      const papersList = paperResponse?.items || [];
      
      for (const paper of papersList) {
        if (!isMounted) return;
        
        try {
          const questionResponse =
            await assessmentQuestionService.getAssessmentQuestions({
              assessmentPaperId: paper.id,
              pageNumber: 1,
              pageSize: 100,
            });
          
          if (!isMounted) return;
          
          // Sort questions by questionNumber
          const sortedQuestions = [...(questionResponse?.items || [])].sort(
            (a, b) => (a.questionNumber || 0) - (b.questionNumber || 0),
          );
          questionsMap[paper.id] = sortedQuestions;
        } catch (error) {
          console.error(`Failed to fetch questions for paper ${paper.id}:`, error);
          questionsMap[paper.id] = [];
        }
      }
      
      if (!isMounted) return;
      setAllQuestions(questionsMap);

      // Fetch rubrics for all questions
      const rubricsMap: { [questionId: number]: RubricItem[] } = {};
      for (const paper of papersList) {
        const questions = questionsMap[paper.id] || [];
        for (const question of questions) {
          if (!isMounted) return;
          if (!question || !question.id) continue;
          try {
            const rubricResponse = await rubricItemService.getRubricsForQuestion({
              assessmentQuestionId: question.id,
              pageNumber: 1,
              pageSize: 100,
            });
            rubricsMap[question.id] = rubricResponse?.items || [];
          } catch (error: any) {
            // 404 or empty result is expected when question has no rubrics
            if (error?.response?.status === 404 || error?.message?.includes('404')) {
              rubricsMap[question.id] = [];
            } else {
              console.error(`Failed to fetch rubrics for question ${question.id}:`, error);
              rubricsMap[question.id] = [];
            }
          }
        }
      }
      if (!isMounted) return;
      setRubrics(rubricsMap);

      // Use /AssessmentFile/page endpoint (same as web version)
      const fileResponse = await assessmentFileService.getFilesForTemplate({
        assessmentTemplateId: templateId,
        pageNumber: 1,
        pageSize: 100,
      });
      
      if (!isMounted) return;
      setFiles(fileResponse?.items || []);
    } catch (error) {
      console.error('Failed to fetch all data:', error);
      if (isMounted) {
        showErrorToast('Error', 'Failed to load template data.');
      }
    }
  };

  const refreshPapers = async () => {
    if (!template) return;
    await fetchAllData(template.id);
  };

  const refreshQuestions = async (paperId: number) => {
    if (!template) return;
    await fetchAllData(template.id);
  };

  const refreshRubrics = async (questionId: number) => {
    if (!isMounted || !questionId) return;
    try {
      const rubricResponse = await rubricItemService.getRubricsForQuestion({
        assessmentQuestionId: questionId,
        pageNumber: 1,
        pageSize: 100,
      });
      if (!isMounted) return;
      setRubrics(prev => ({
        ...prev,
        [questionId]: rubricResponse?.items || [],
      }));
    } catch (error: any) {
      // 404 or empty result is expected when question has no rubrics
      if (error?.response?.status === 404 || error?.message?.includes('404')) {
        if (!isMounted) return;
        setRubrics(prev => ({
          ...prev,
          [questionId]: [],
        }));
      } else {
        console.error(`Failed to refresh rubrics for question ${questionId}:`, error);
        if (!isMounted) return;
        setRubrics(prev => ({
          ...prev,
          [questionId]: [],
        }));
      }
    }
  };

  const refreshFiles = async () => {
    if (!template) return;
    try {
      // Use /AssessmentFile/page endpoint (same as web version)
      const fileResponse = await assessmentFileService.getFilesForTemplate({
        assessmentTemplateId: template.id,
        pageNumber: 1,
        pageSize: 100,
      });
      if (!isMounted) return;
      setFiles(fileResponse?.items || []);
    } catch (error) {
      console.error('Failed to refresh files:', error);
      if (!isMounted) return;
      setFiles([]);
    }
  };

  const fetchTemplates = async () => {
    if (!isMounted) return;
    
    setIsLoading(true);
    try {
      const response = await assessmentTemplateService.getAssessmentTemplates({
        lecturerId: lecturerId,
        pageNumber: 1,
        pageSize: 1000,
      });

      if (!isMounted) return;

      const items = response?.items || [];
      const courseElementTemplates = items.filter(
        (t) => t.courseElementId === taskItem.courseElementId,
      );

      if (!isMounted) return;
      setTemplates(courseElementTemplates);

      const currentTemplate = courseElementTemplates.find(
        (t) => t.assignRequestId === task.id,
      );

      if (currentTemplate) {
        setTemplate(currentTemplate);
        await fetchAllData(currentTemplate.id);
      } else if (courseElementTemplates.length > 0) {
        setTemplate(courseElementTemplates[0]);
        await fetchAllData(courseElementTemplates[0].id);
      } else {
        if (isMounted) {
          setTemplate(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      if (isMounted) {
        showErrorToast('Error', 'Failed to load templates.');
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchTemplates();
    
    return () => {
      setIsMounted(false);
    };
  }, [task.id, taskItem.courseElementId, lecturerId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.pr500} />
      </View>
    );
  }

  // Handlers for CRUD operations
  const handleCreateTemplate = async () => {
    if (templates.length > 0) {
      showErrorToast('Error', 'This course element already has a template. Only one template is allowed per course element.');
      return;
    }
    setIsTemplateModalOpen(true);
  };

  const handleEditTemplate = () => {
    setIsTemplateModalOpen(true);
  };

  const handleDeleteTemplate = () => {
    if (!template) return;
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await assessmentTemplateService.deleteAssessmentTemplate(template.id);
              showSuccessToast('Success', 'Template deleted successfully');
              await fetchTemplates();
            } catch (error: any) {
              showErrorToast('Error', error.message || 'Failed to delete template');
            }
          },
        },
      ],
    );
  };

  const handleCreatePaper = () => {
    setSelectedPaper(null);
    setIsPaperModalOpen(true);
  };

  const handleEditPaper = (paper: AssessmentPaper) => {
    setSelectedPaper(paper);
    setIsPaperModalOpen(true);
  };

  const handleDeletePaper = (paper: AssessmentPaper) => {
    Alert.alert(
      `Delete Paper: ${paper.name}?`,
      'All questions and rubrics inside will also be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await assessmentPaperService.deleteAssessmentPaper(paper.id);
              showSuccessToast('Success', 'Paper deleted successfully');
              await refreshPapers();
            } catch (error: any) {
              showErrorToast('Error', error.message || 'Failed to delete paper');
            }
          },
        },
      ],
    );
  };

  const handleCreateQuestion = (paperId: number) => {
    setPaperForNewQuestion(paperId);
    setSelectedQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (question: AssessmentQuestion) => {
    setSelectedQuestion(question);
    setPaperForNewQuestion(undefined);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (question: AssessmentQuestion) => {
    // Find paperId from allQuestions
    let paperId: number | undefined;
    for (const pId in allQuestions) {
      if (allQuestions[pId].some(q => q.id === question.id)) {
        paperId = Number(pId);
        break;
      }
    }

    Alert.alert(
      'Delete Question',
      'All rubrics inside will also be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await assessmentQuestionService.deleteAssessmentQuestion(question.id);
              showSuccessToast('Success', 'Question deleted successfully');
              if (paperId) {
                await refreshQuestions(paperId);
              }
            } catch (error: any) {
              showErrorToast('Error', error.message || 'Failed to delete question');
            }
          },
        },
      ],
    );
  };

  const handleCreateRubric = (questionId: number) => {
    setQuestionForNewRubric(questionId);
    setSelectedRubric(null);
    setIsRubricModalOpen(true);
  };

  const handleEditRubric = (rubric: RubricItem) => {
    setSelectedRubric(rubric);
    setQuestionForNewRubric(undefined);
    setIsRubricModalOpen(true);
  };

  const handleDeleteRubric = (rubric: RubricItem) => {
    Alert.alert(
      'Delete Rubric',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await rubricItemService.deleteRubricItem(rubric.id);
              showSuccessToast('Success', 'Rubric deleted successfully');
              await refreshRubrics(rubric.assessmentQuestionId);
            } catch (error: any) {
              showErrorToast('Error', error.message || 'Failed to delete rubric');
            }
          },
        },
      ],
    );
  };

  const handleUploadFile = async () => {
    if (!template) return;
    try {
      const result = await pick({
        allowMultiSelection: true,
        type: [types.allFiles],
      });
      if (result && result.length > 0) {
        for (const file of result) {
          try {
            await uploadAssessmentFile(
              { uri: file.uri, name: file.name || 'file', type: file.type || 'application/octet-stream' },
              file.name || 'file',
              0, // FileTemplate.DATABASE
              template.id,
            );
          } catch (error: any) {
            console.error('Failed to upload file:', error);
            showErrorToast('Error', `Failed to upload ${file.name}`);
          }
        }
        showSuccessToast('Success', 'Files uploaded successfully');
        await refreshFiles();
      }
    } catch (error: any) {
      if (error.message !== 'User canceled document picker') {
        console.error('File picker error:', error);
        showErrorToast('Error', 'Failed to select files');
      }
    }
  };

  const handleDeleteFile = (file: AssessmentFile) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${file.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAssessmentFile(file.id);
              showSuccessToast('Success', 'File deleted successfully');
              await refreshFiles();
            } catch (error: any) {
              showErrorToast('Error', error.message || 'Failed to delete file');
            }
          },
        },
      ],
    );
  };

  if (!template) {
    if (isEditable && templates.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <AppText variant="body14pxRegular" style={{ textAlign: 'center', color: AppColors.n500 }}>
            No template found for this task.
          </AppText>
          <AppButton
            title="Create Template"
            onPress={handleCreateTemplate}
            style={{ marginTop: vs(16) }}
          />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <AppText variant="body14pxRegular" style={{ textAlign: 'center', color: AppColors.n500 }}>
          No template found for this task.
        </AppText>
        {isEditable && (
          <AppText variant="body12pxRegular" style={{ textAlign: 'center', color: AppColors.n400, marginTop: vs(8) }}>
            Please create a template using the Create Assessment screen.
          </AppText>
        )}
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.templateInfo}>
          <View style={styles.templateHeader}>
            <View style={styles.templateHeaderLeft}>
              <AppText variant="h4" style={styles.templateName}>
                {template.name}
              </AppText>
              {isCurrentTemplateEditable && (
                <View style={styles.templateActions}>
                  <TouchableOpacity onPress={handleEditTemplate} style={styles.iconButton}>
                    <Feather name="edit-2" size={s(18)} color={AppColors.pr500} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteTemplate} style={styles.iconButton}>
                    <Feather name="trash-2" size={s(18)} color={AppColors.errorColor} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          <AppText variant="body12pxRegular" style={styles.templateDescription}>
            {template.description || 'No description'}
          </AppText>
          <AppText variant="body12pxRegular" style={styles.templateType}>
            Type: {template.templateType === 0 ? 'DSA' : 'WEBAPI'}
          </AppText>
        </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="h5" style={styles.sectionTitle}>
            Papers ({papers.length})
          </AppText>
          {isCurrentTemplateEditable && (
            <TouchableOpacity onPress={handleCreatePaper} style={styles.addButton}>
              <Feather name="plus" size={s(18)} color={AppColors.pr500} />
              <AppText variant="body12pxBold" style={{ color: AppColors.pr500, marginLeft: s(4) }}>
                Add Paper
              </AppText>
            </TouchableOpacity>
          )}
        </View>
        {papers.length === 0 ? (
          <AppText variant="body12pxRegular" style={styles.emptyText}>
            No papers yet
          </AppText>
        ) : (
          papers.map((paper) => {
            const questions = allQuestions[paper.id] || [];
            return (
              <View key={paper.id} style={styles.paperCard}>
                <View style={styles.paperHeader}>
                  <View style={styles.paperHeaderLeft}>
                    <AppText variant="body14pxBold" style={styles.paperName}>
                      {paper.name}
                    </AppText>
                    {isCurrentTemplateEditable && (
                      <View style={styles.paperActions}>
                        <TouchableOpacity onPress={() => handleEditPaper(paper)} style={styles.iconButton}>
                          <Feather name="edit-2" size={s(16)} color={AppColors.pr500} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeletePaper(paper)} style={styles.iconButton}>
                          <Feather name="trash-2" size={s(16)} color={AppColors.errorColor} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                <AppText variant="body12pxRegular" style={styles.paperDescription}>
                  {paper.description || 'No description'}
                </AppText>
                <View style={styles.questionsContainer}>
                  <AppText variant="body12pxRegular" style={styles.questionCount}>
                    Questions: {questions.length}
                  </AppText>
                  {isCurrentTemplateEditable && (
                    <TouchableOpacity onPress={() => handleCreateQuestion(paper.id)} style={styles.addQuestionButton}>
                      <Feather name="plus" size={s(14)} color={AppColors.pr500} />
                      <AppText variant="body12pxRegular" style={{ color: AppColors.pr500, marginLeft: s(4) }}>
                        Add Question
                      </AppText>
                    </TouchableOpacity>
                  )}
                </View>
                {questions
                  .filter(q => q && q.id)
                  .map((question) => {
                    const questionRubrics = (rubrics[question.id] || []).filter(r => r && r.id);
                    return (
                      <View key={question.id} style={styles.questionCard}>
                        <View style={styles.questionHeader}>
                          <AppText variant="body14pxBold" style={styles.questionTitle}>
                            Q{question.questionNumber || '?'}: {(question.questionText || '').substring(0, 50)}
                            {(question.questionText || '').length > 50 ? '...' : ''}
                          </AppText>
                          {isCurrentTemplateEditable && (
                            <View style={styles.questionActions}>
                              <TouchableOpacity onPress={() => handleEditQuestion(question)} style={styles.iconButton}>
                                <Feather name="edit-2" size={s(14)} color={AppColors.pr500} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDeleteQuestion(question)} style={styles.iconButton}>
                                <Feather name="trash-2" size={s(14)} color={AppColors.errorColor} />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <AppText variant="body12pxRegular" style={styles.questionScore}>
                          Score: {question.score || 0}
                        </AppText>
                        <View style={styles.rubricsContainer}>
                          <AppText variant="body12pxRegular" style={styles.rubricsLabel}>
                            Rubrics: {questionRubrics.length}
                          </AppText>
                          {isCurrentTemplateEditable && (
                            <TouchableOpacity onPress={() => handleCreateRubric(question.id)} style={styles.addRubricButton}>
                              <Feather name="plus" size={s(12)} color={AppColors.pr500} />
                              <AppText variant="body12pxRegular" style={{ color: AppColors.pr500, marginLeft: s(4) }}>
                                Add Rubric
                              </AppText>
                            </TouchableOpacity>
                          )}
                        </View>
                        {questionRubrics.map((rubric) => (
                          <View key={rubric.id} style={styles.rubricCard}>
                            <View style={styles.rubricHeader}>
                              <AppText variant="body12pxRegular" style={styles.rubricDescription}>
                                {rubric.description || 'No description'}
                              </AppText>
                              {isCurrentTemplateEditable && (
                                <View style={styles.rubricActions}>
                                  <TouchableOpacity onPress={() => handleEditRubric(rubric)} style={styles.iconButton}>
                                    <Feather name="edit-2" size={s(12)} color={AppColors.pr500} />
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={() => handleDeleteRubric(rubric)} style={styles.iconButton}>
                                    <Feather name="trash-2" size={s(12)} color={AppColors.errorColor} />
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                            <AppText variant="body12pxRegular" style={styles.rubricScore}>
                              Score: {rubric.score || 0}
                            </AppText>
                          </View>
                        ))}
                      </View>
                    );
                  })}
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="h5" style={styles.sectionTitle}>
            Files ({files.length})
          </AppText>
          {isCurrentTemplateEditable && (
            <TouchableOpacity onPress={handleUploadFile} style={styles.addButton}>
              <Feather name="upload" size={s(18)} color={AppColors.pr500} />
              <AppText variant="body12pxBold" style={{ color: AppColors.pr500, marginLeft: s(4) }}>
                Upload
              </AppText>
            </TouchableOpacity>
          )}
        </View>
        {files.length === 0 ? (
          <AppText variant="body12pxRegular" style={styles.emptyText}>
            No files attached
          </AppText>
        ) : (
          files.map((file) => (
            <View key={file.id} style={styles.fileCard}>
              <Feather name="file" size={s(16)} color={AppColors.pr500} />
              <AppText variant="body12pxRegular" style={styles.fileName}>
                {file.name}
              </AppText>
              {isCurrentTemplateEditable && (
                <TouchableOpacity onPress={() => handleDeleteFile(file)} style={styles.deleteFileButton}>
                  <Feather name="trash-2" size={s(16)} color={AppColors.errorColor} />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>

    {/* Modals */}
    <TemplateFormModal
      visible={isTemplateModalOpen}
      onClose={() => {
        setIsTemplateModalOpen(false);
        setSelectedPaper(null);
      }}
      onSuccess={async () => {
        await fetchTemplates();
        if (onRefresh) onRefresh();
      }}
      initialData={template}
      isEditable={isEditable}
      assignRequestId={task.id}
      lecturerId={lecturerId}
      assignedToHODId={taskItem.assignedByHODId}
    />

    <PaperFormModal
      visible={isPaperModalOpen}
      onClose={() => {
        setIsPaperModalOpen(false);
        setSelectedPaper(null);
      }}
      onSuccess={async () => {
        await refreshPapers();
      }}
      initialData={selectedPaper}
      isEditable={isCurrentTemplateEditable}
      templateId={template?.id || 0}
    />

    <QuestionFormModal
      visible={isQuestionModalOpen}
      onClose={() => {
        setIsQuestionModalOpen(false);
        setSelectedQuestion(null);
        setPaperForNewQuestion(undefined);
      }}
      onSuccess={async () => {
        if (paperForNewQuestion) {
          await refreshQuestions(paperForNewQuestion);
        } else if (selectedQuestion) {
          // Find paperId from allQuestions
          let paperId: number | undefined;
          for (const pId in allQuestions) {
            if (allQuestions[pId].some(q => q.id === selectedQuestion.id)) {
              paperId = Number(pId);
              break;
            }
          }
          if (paperId) {
            await refreshQuestions(paperId);
          }
        }
      }}
      initialData={selectedQuestion}
      isEditable={isCurrentTemplateEditable}
      paperId={paperForNewQuestion}
      existingQuestionsCount={
        paperForNewQuestion ? (allQuestions[paperForNewQuestion]?.length || 0) : 0
      }
    />

    <RubricFormModal
      visible={isRubricModalOpen}
      onClose={() => {
        setIsRubricModalOpen(false);
        setSelectedRubric(null);
        setQuestionForNewRubric(undefined);
      }}
      onSuccess={async () => {
        if (questionForNewRubric) {
          await refreshRubrics(questionForNewRubric);
        } else if (selectedRubric) {
          await refreshRubrics(selectedRubric.assessmentQuestionId);
        }
      }}
      initialData={selectedRubric}
      isEditable={isCurrentTemplateEditable}
      questionId={questionForNewRubric || selectedRubric?.assessmentQuestionId}
    />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: vs(20),
    alignItems: 'center',
  },
  templateInfo: {
    padding: s(16),
    backgroundColor: AppColors.white,
    borderRadius: s(8),
    marginBottom: vs(12),
  },
  templateName: {
    marginBottom: vs(4),
    fontWeight: '600',
  },
  templateDescription: {
    color: AppColors.n600,
    marginBottom: vs(4),
  },
  templateType: {
    color: AppColors.n500,
  },
  section: {
    marginBottom: vs(16),
    backgroundColor: AppColors.white,
    borderRadius: s(8),
    padding: s(16),
  },
  sectionTitle: {
    marginBottom: vs(12),
    fontWeight: '600',
  },
  emptyText: {
    color: AppColors.n500,
    fontStyle: 'italic',
  },
  paperCard: {
    padding: s(12),
    backgroundColor: AppColors.n100,
    borderRadius: s(8),
    marginBottom: vs(8),
  },
  paperName: {
    fontWeight: '600',
    marginBottom: vs(4),
  },
  paperDescription: {
    color: AppColors.n600,
    marginBottom: vs(4),
  },
  questionCount: {
    color: AppColors.n500,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(12),
    backgroundColor: AppColors.n100,
    borderRadius: s(8),
    marginBottom: vs(8),
  },
  fileName: {
    marginLeft: s(8),
    flex: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  templateHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  templateActions: {
    flexDirection: 'row',
    marginLeft: s(12),
    gap: s(8),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: s(6),
    backgroundColor: AppColors.pr100,
  },
  iconButton: {
    padding: s(4),
  },
  paperHeader: {
    marginBottom: vs(8),
  },
  paperHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paperActions: {
    flexDirection: 'row',
    gap: s(8),
  },
  questionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vs(8),
    paddingTop: vs(8),
    borderTopWidth: 1,
    borderTopColor: AppColors.n200,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    borderRadius: s(4),
    backgroundColor: AppColors.pr100,
  },
  questionCard: {
    marginTop: vs(8),
    padding: s(12),
    backgroundColor: AppColors.n100,
    borderRadius: s(6),
    borderLeftWidth: 3,
    borderLeftColor: AppColors.pr500,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(4),
  },
  questionTitle: {
    flex: 1,
    marginRight: s(8),
  },
  questionActions: {
    flexDirection: 'row',
    gap: s(6),
  },
  questionScore: {
    color: AppColors.n600,
    marginBottom: vs(4),
  },
  rubricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vs(8),
    paddingTop: vs(8),
    borderTopWidth: 1,
    borderTopColor: AppColors.n200,
  },
  rubricsLabel: {
    color: AppColors.n600,
  },
  addRubricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    borderRadius: s(4),
    backgroundColor: AppColors.pr100,
  },
  rubricCard: {
    marginTop: vs(6),
    padding: s(8),
    backgroundColor: AppColors.white,
    borderRadius: s(4),
    borderWidth: 1,
    borderColor: AppColors.n200,
  },
  rubricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(4),
  },
  rubricDescription: {
    flex: 1,
    marginRight: s(8),
  },
  rubricActions: {
    flexDirection: 'row',
    gap: s(4),
  },
  rubricScore: {
    color: AppColors.n600,
  },
  deleteFileButton: {
    padding: s(4),
    marginLeft: s(8),
  },
});

