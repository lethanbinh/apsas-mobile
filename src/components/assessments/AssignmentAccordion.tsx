import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import {
  CreateAssessmentPaperPayload,
  UpdateAssessmentPaperPayload,
  createAssessmentPaper,
  updateAssessmentPaper,
} from '../../api/assessmentPaperService';
import {
  CreateAssessmentQuestionPayload,
  UpdateAssessmentQuestionPayload,
  createAssessmentQuestion,
  updateAssessmentQuestion,
} from '../../api/assessmentQuestionService';
import {
  AssessmentTemplateData,
  CreateAssessmentTemplatePayload,
  UpdateAssessmentTemplatePayload,
  createAssessmentTemplate,
  updateAssessmentTemplate,
} from '../../api/assessmentTemplateService';
import {
  AssignRequestData,
  updateAssignRequest,
} from '../../api/assignRequestService';
import {
  CreateRubricItemPayload,
  RubricItemData,
  createRubricItem,
  getRubricItemsByQuestionId,
} from '../../api/rubricItemService';
import { UploadIcon } from '../../assets/icons/icon';
import { useGetCurrentLecturerId } from '../../hooks/useGetCurrentLecturerId';
import { AppColors } from '../../styles/color';
import AppButton from '../buttons/AppButton';
import CurriculumItem from '../courses/CurriculumItem';
import AppTextInputController from '../inputs/AppTextInputController';
import RadioWithTitle from '../inputs/RadioWithTitle';
import AppText from '../texts/AppText';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import QuestionItem from './QuestionItem';
import StatusTag from './StatusTag';

// Interfaces for Form Data
interface CriteriaFormData {
  id?: number; // <-- Thêm ID (từ API)
  input: string;
  output: string;
  dataType: string;
  description: string;
  score: string;
}

interface QuestionFormData {
  id?: number; // <-- Sửa kiểu thành number? API trả về number
  title: string;
  content: string; // Vẫn giữ lại nếu cần
  sampleInput: string;
  sampleOutput: string;
  score: string;
  fileUri: string | null;
  fileName: string | null;
  width?: number | null;
  height?: number | null;
  criteria: CriteriaFormData[]; // <-- Criteria giờ có thể có ID
}

interface AssessmentFormData {
  templateName: string;
  templateDescription: string;
  paperName: string;
  paperDescription: string;
  questions: QuestionFormData[];
}

// Props interface
interface AssignmentAccordionProps {
  assignRequest: AssignRequestData;
  template: AssessmentTemplateData | null;
  isExpanded: boolean;
  onToggle: () => void;
  onSuccess: () => void;
}

// Helper functions (giữ nguyên)
const mapTemplateTypeToString = (type: number | undefined): string => {
  if (type === 1) return 'Web API';
  return 'Basic assignment';
};
const mapStringToTemplateType = (type: string): number => {
  if (type === 'Web API') return 1;
  return 0;
};
const mapStatusToString = (status: number): string => {
  switch (status) {
    case 1: case 2: case 4: return 'Pending';
    case 3: return 'Reject';
    case 5: return 'Approve';
    default: return 'Pending';
  }
};

const AssignmentAccordion = ({
  assignRequest,
  template,
  isExpanded,
  onToggle,
  onSuccess,
}: AssignmentAccordionProps) => {
  const [selectedType, setSelectedType] = useState('Basic assignment');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null); // Dùng string vì useFieldArray id là string
  const [databaseFile, setDatabaseFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // State loading ban đầu
  const { lecturerId: currentLecturerId } = useGetCurrentLecturerId();

  const { control, handleSubmit, reset, getValues, setValue } =
    useForm<AssessmentFormData>({
      defaultValues: {
        templateName: '',
        templateDescription: '',
        paperName: '',
        paperDescription: '',
        questions: [],
      },
    });

  // --- Effect để điền form (bao gồm fetch criteria) ---
  useEffect(() => {
    const initializeForm = async () => {
      setIsInitializing(true); // Bắt đầu loading
      if (template) {
        const paper = template.papers?.[0];
        let questionsWithCriteria: QuestionFormData[] = [];

        if (paper?.questions?.length > 0) {
          // Tạo promises để fetch criteria cho từng question
          const criteriaPromises = paper.questions.map(q =>
            getRubricItemsByQuestionId(q.id)
              .then(rubrics => ({ questionId: q.id, rubrics }))
              .catch(err => {
                console.error(`Error fetching criteria for Q ${q.id}:`, err);
                return { questionId: q.id, rubrics: [] }; // Trả về mảng rỗng nếu lỗi
              })
          );
          // Chờ tất cả fetches hoàn thành
          const results = await Promise.all(criteriaPromises);
          const criteriaMap = new Map<number, RubricItemData[]>();
          results.forEach(res => criteriaMap.set(res.questionId, res.rubrics));

          // Map questions và gắn criteria đã fetch
          questionsWithCriteria = paper.questions.map(q => {
            const fetchedCriteria = criteriaMap.get(q.id) || [];
            return {
              id: q.id,
              title: q.questionText,
              content: '', // Reset
              sampleInput: q.questionSampleInput || '',
              sampleOutput: q.questionSampleOutput || '',
              score: String(q.score || '0'),
              fileUri: null,
              fileName: null,
              criteria: fetchedCriteria.map(c => ({ // Map criteria data
                id: c.id, // <-- Gắn ID criteria
                input: c.input || '',
                output: c.output || '',
                dataType: 'String', // Default
                description: c.description || '',
                score: String(c.score || '0'),
              })),
            };
          });
        }

        reset({
          templateName: template.name || '',
          templateDescription: template.description || '',
          paperName: paper?.name || '',
          paperDescription: paper?.description || '',
          questions: questionsWithCriteria,
        });
        setSelectedType(mapTemplateTypeToString(template.templateType));
        if (questionsWithCriteria.length > 0) {
           // Mở question đầu tiên theo ID của form field
           const firstQuestionFieldId = fields[0]?.id; // Lấy ID của react-hook-form
           if(firstQuestionFieldId) setExpandedQuestionId(firstQuestionFieldId);
        }

      } else {
        // Reset nếu không có template
        reset({
          templateName: '', templateDescription: '', paperName: '', paperDescription: '', questions: []
        });
        setSelectedType('Basic assignment');
        setExpandedQuestionId(null);
      }
      setIsInitializing(false); // Kết thúc loading
    };

    initializeForm();
  // Chạy lại khi template thay đổi HOẶC khi component mount lần đầu
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, reset]); // Bỏ fields khỏi dependencies để tránh loop

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });
  const watchedQuestions = useWatch({ control, name: 'questions' });

  // --- Logic Export (giữ nguyên) ---
  const handleExport = async () => { /* ... giữ nguyên ... */ };

  // --- Logic Upload (giữ nguyên) ---
  const handleQuestionFileUpload = async (index: number) => { /* ... giữ nguyên ... */ };
  const handleDatabaseUpload = async () => { /* ... giữ nguyên ... */ };

  const handleAddQuestion = () => {
    append({
      title: '', content: '', sampleInput: '', sampleOutput: '', score: '',
      fileUri: null, fileName: null, width: null, height: null, criteria: [],
    });
  };

  // --- Logic Confirm (Sửa lại Payload và Types) ---
  const handleConfirm = async (formData: AssessmentFormData) => {
    if (!currentLecturerId) {
      showErrorToast('Error', 'Cannot identify current lecturer.');
      return;
    }
    setIsSubmitting(true);
    console.log("Submitting Form Data:", JSON.stringify(formData, null, 2)); // Log data gửi đi

    try {
      let currentTemplateId: number;
      let currentPaperId: number;

      // --- CREATE FLOW ---
      if (!template) {
        // 1. Create Template
        const templatePayload: CreateAssessmentTemplatePayload = {
          assignRequestId: assignRequest.id,
          templateType: mapStringToTemplateType(selectedType),
          name: formData.templateName || assignRequest.courseElementName,
          description: formData.templateDescription || 'Assessment Template',
          createdByLecturerId: currentLecturerId,
          assignedToHODId: Number(assignRequest.assignedByHODId),
        };
        console.log("Create Template Payload:", templatePayload);
        const templateRes = await createAssessmentTemplate(templatePayload);
        if (!templateRes.isSuccess || !templateRes.result?.id) {
          throw new Error('Failed to create template: ' + (templateRes.errorMessages?.join(', ') || 'Unknown error'));
        }
        currentTemplateId = templateRes.result.id;

        // 2. Create Paper
        const paperPayload: CreateAssessmentPaperPayload = {
          name: formData.paperName || 'Default Paper',
          description: formData.paperDescription || '',
          assessmentTemplateId: currentTemplateId,
        };
        console.log("Create Paper Payload:", paperPayload);
        const paperRes = await createAssessmentPaper(paperPayload);
        if (!paperRes.isSuccess || !paperRes.result?.id) {
          throw new Error('Failed to create paper: ' + (paperRes.errorMessages?.join(', ') || 'Unknown error'));
        }
        currentPaperId = paperRes.result.id;

        // 3. Create Questions and Rubrics
        for (const questionData of formData.questions) {
          const questionPayload: CreateAssessmentQuestionPayload = {
            questionText: questionData.title,
            questionSampleInput: questionData.sampleInput,
            questionSampleOutput: questionData.sampleOutput,
            score: Number(questionData.score) || 0, // <-- Chuyển sang number
            assessmentPaperId: currentPaperId,
          };
          console.log("Create Question Payload:", questionPayload);
          const questionRes = await createAssessmentQuestion(questionPayload);
          if (!questionRes.isSuccess || !questionRes.result?.id) {
            console.error('Failed to create question: ', questionRes.errorMessages);
            continue;
          }
          const newQuestionId = questionRes.result.id;

          // 4. Create Rubrics
          for (const criteriaData of questionData.criteria) {
            const rubricPayload: CreateRubricItemPayload = {
              description: criteriaData.description,
              input: criteriaData.input,
              output: criteriaData.output,
              score: Number(criteriaData.score) || 0, // <-- Chuyển sang number
              assessmentQuestionId: newQuestionId,
            };
            console.log("Create Rubric Payload:", rubricPayload);
            const rubricRes = await createRubricItem(rubricPayload);
            if (!rubricRes.isSuccess) {
              console.error('Failed to create rubric item: ', rubricRes.errorMessages);
            }
          }
        }
        // 5. Update AssignRequest Status
        await updateAssignRequest(assignRequest.id, {
          message: assignRequest.message,
          courseElementId: assignRequest.courseElementId,
          assignedLecturerId: assignRequest.assignedLecturerId,
          assignedByHODId: assignRequest.assignedByHODId,
          assignedAt: assignRequest.assignedAt,
          status: 4, // IN_PROGRESS
        });

        showSuccessToast('Success', 'Assessment created successfully!');
        onSuccess();
      }
      // --- UPDATE FLOW ---
      else {
        // 1. Update Template
        const templatePayload: UpdateAssessmentTemplatePayload = {
          templateType: mapStringToTemplateType(selectedType),
          name: formData.templateName,
          description: formData.templateDescription,
          assignedToHODId: template.assignedToHODId,
        };
        console.log("Update Template Payload:", templatePayload, " ID:", template.id);
        const templateUpdateRes = await updateAssessmentTemplate(template.id, templatePayload);
        if (!templateUpdateRes.isSuccess) {
            console.error("Template Update Error:", templateUpdateRes.errorMessages);
            // Có thể throw error ở đây nếu muốn dừng hẳn
        }


        // 2. Update Paper
        const paper = template.papers?.[0];
        if (paper) {
          currentPaperId = paper.id; // Lấy ID paper hiện có
          const paperPayload: UpdateAssessmentPaperPayload = {
            name: formData.paperName,
            description: formData.paperDescription,
          };
          console.log("Update Paper Payload:", paperPayload, " ID:", paper.id);
          const paperUpdateRes = await updateAssessmentPaper(paper.id, paperPayload);
           if (!paperUpdateRes.isSuccess) {
               console.error("Paper Update Error:", paperUpdateRes.errorMessages);
           }


          // 3. Update/Create Questions
          const existingQuestionIds = new Set(paper.questions.map(q => q.id));
          const formQuestionIds = new Set(formData.questions.filter(q => q.id).map(q => q.id));

          for (const questionData of formData.questions) {
            const questionPayload: UpdateAssessmentQuestionPayload | CreateAssessmentQuestionPayload = {
              questionText: questionData.title,
              questionSampleInput: questionData.sampleInput,
              questionSampleOutput: questionData.sampleOutput,
              score: Number(questionData.score) || 0, // <-- Chuyển sang number
            };

            if (questionData.id && existingQuestionIds.has(Number(questionData.id))) {
              // UPDATE Existing Question
              console.log("Update Question Payload:", questionPayload, " ID:", questionData.id);
              const questionUpdateRes = await updateAssessmentQuestion(questionData.id, questionPayload);
              if (!questionUpdateRes.isSuccess) {
                  console.error(`Question Update Error (ID: ${questionData.id}):`, questionUpdateRes.errorMessages);
              }
              // TODO: Update Rubrics for this question (complex logic needed)
            } else {
              // CREATE New Question
              (questionPayload as CreateAssessmentQuestionPayload).assessmentPaperId = currentPaperId;
              console.log("Create New Question Payload (in update flow):", questionPayload);
              const questionCreateRes = await createAssessmentQuestion(questionPayload as CreateAssessmentQuestionPayload);
               if (!questionCreateRes.isSuccess || !questionCreateRes.result?.id) {
                   console.error("New Question Create Error:", questionCreateRes.errorMessages);
                   continue; // Skip rubrics if question creation failed
               }
               const newQuestionId = questionCreateRes.result.id;
              // TODO: Create Rubrics for the new question
              for (const criteriaData of questionData.criteria) {
                  // ... (logic tạo rubric như trong CREATE FLOW) ...
              }

            }
          }
          // TODO: Logic Delete questions that are in `existingQuestionIds` but not in `formQuestionIds`
        } else {
            // Trường hợp CREATE PAPER + QUESTIONS trong luồng UPDATE TEMPLATE
             console.warn('Create paper/questions during template update is not fully implemented yet.');
             // ... (Logic tương tự CREATE FLOW bắt đầu từ bước tạo Paper) ...
        }

        // Có thể update status AssignRequest nếu cần (ví dụ về IN_PROGRESS)
        // await updateAssignRequest(assignRequest.id, { ... status: 4 });

        showSuccessToast('Success', 'Assessment updated successfully!');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error confirming assessment:', error);
      // Log lỗi chi tiết hơn nếu có từ response API
      const apiErrorMessage = error.response?.data?.errorMessages?.join(', ') || error.message;
      showErrorToast('Error', apiErrorMessage || 'Failed to save assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isInitializing) {
     return (
       <View style={[styles.assignmentCard, styles.loadingContainer]}>
         <ActivityIndicator color={AppColors.pr500} />
       </View>
     )
  }

  return (
    <View style={styles.assignmentCard}>
      <TouchableOpacity style={styles.assignmentHeader} onPress={onToggle}>
        <AppText
          variant="body14pxBold"
          style={{ flex: 1, color: AppColors.n900 }}>
          {assignRequest.courseElementName}
        </AppText>
        <StatusTag status={mapStatusToString(assignRequest.status)} />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.assignmentBody}>
          <AppTextInputController
            control={control} name="templateName" label="Template Name"
            placeholder="Enter template name..." rules={{ required: 'Template name is required' }}
          />
          <AppTextInputController
            control={control} name="templateDescription" label="Template Description"
            placeholder="Enter template description..." multiline
          />
          <AppTextInputController
            control={control} name="paperName" label="Paper Name"
            placeholder="Enter paper name..." rules={{ required: 'Paper name is required' }}
          />
          <AppTextInputController
            control={control} name="paperDescription" label="Paper Description"
            placeholder="Enter paper description..." multiline
          />

          <View style={{ marginVertical: vs(16) }}>
            <AppText variant="body14pxBold" style={{ color: AppColors.n700 }}>Assignment Type</AppText>
            {['Basic assignment', 'Web API'].map(item => (
              <RadioWithTitle key={item} title={item} selected={item === selectedType} onPress={() => setSelectedType(item)} />
            ))}
          </View>

          {selectedType !== 'Basic assignment' && (
            <View style={{ marginBottom: vs(16) }}>
              <CurriculumItem id={0} number="01" title="Database"
                linkFile={databaseFile || 'Upload .sql file'}
                rightIcon={<UploadIcon color={AppColors.pr500} />}
                onAction={handleDatabaseUpload}
              />
            </View>
          )}

          {fields.map((field, index) => {
            const watchedFileUri = watchedQuestions?.[index]?.fileUri;
            return (
              <QuestionItem
                key={field.id}
                index={index}
                isExpanded={expandedQuestionId === field.id}
                control={control}
                onToggle={() => setExpandedQuestionId(prevId => prevId === field.id ? null : field.id)}
                onFileUpload={() => handleQuestionFileUpload(index)}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
                initialFileUri={watchedFileUri}
              />
            );
          })}

          <TouchableOpacity style={styles.addQuestionButton} onPress={handleAddQuestion}>
            <AppText variant="body14pxBold" style={styles.addQuestionButtonText}>+ Add Question</AppText>
          </TouchableOpacity>

          <AppButton
            title={isSubmitting ? 'Saving...' : 'Confirm'}
            onPress={handleSubmit(handleConfirm)}
            style={styles.confirmButton}
            textVariant="body14pxBold"
            disabled={isSubmitting}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  assignmentCard: {
    backgroundColor: AppColors.white,
    borderRadius: 10,
    marginHorizontal: s(10),
    marginVertical: vs(8),
    borderWidth: 1,
    borderColor: AppColors.n200,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
    paddingHorizontal: s(14),
  },
  exportButtonText: {
    color: AppColors.pr500,
    fontWeight: 'bold',
    marginHorizontal: s(8),
  },
  assignmentBody: {
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    borderTopWidth: 1,
    borderTopColor: AppColors.n100,
  },
  addQuestionButton: {
    alignItems: 'center',
    paddingVertical: vs(8),
    marginBottom: vs(16),
    marginTop: vs(8),
    borderWidth: 1,
    borderColor: AppColors.pr500,
    borderRadius: 8,
    backgroundColor: AppColors.white,
  },
  addQuestionButtonText: {
    color: AppColors.pr500,
  },
  confirmButton: {
    marginTop: vs(16),
    borderRadius: vs(10),
  },
  // Style cho loading container
  loadingContainer: {
     justifyContent: 'center',
     alignItems: 'center',
     minHeight: vs(100), // Chiều cao tối thiểu để spinner hiển thị
  },
});

export default AssignmentAccordion;