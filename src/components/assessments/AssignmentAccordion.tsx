import { pick, types } from '@react-native-documents/picker';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
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
  deleteAssessmentQuestion,
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
  UpdateRubricItemPayload,
  createRubricItem,
  deleteRubricItem,
  getRubricItemsByQuestionId,
  updateRubricItem,
} from '../../api/rubricItemService';
import { RemoveIcon, UploadIcon } from '../../assets/icons/icon';
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
import {
  deleteAssessmentFile,
  getFilesForTemplate,
  uploadAssessmentFile,
} from '../../api/assessmentFileService';

interface CriteriaFormData {
  id?: number;
  input: string;
  output: string;
  dataType: string;
  description: string;
  score: string;
}
interface QuestionFormData {
  id?: number;
  title: string;
  content: string;
  sampleInput: string;
  sampleOutput: string;
  score: string;
  questionNumber?: number;
  criteria: CriteriaFormData[];
}
interface AssessmentFormData {
  templateName: string;
  templateDescription: string;
  paperName: string;
  paperDescription: string;
  questions: QuestionFormData[];
}
interface AssignmentAccordionProps {
  assignRequest: AssignRequestData;
  template: AssessmentTemplateData | null;
  isExpanded: boolean;
  onToggle: () => void;
  onSuccess: () => void;
}

interface AttachedFileState {
  id?: number;
  name: string;
  uri?: string;
  fileUrl?: string;
  fileTemplate: number;
  type?: string;
}
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
    case 1:
    case 2:
    case 4:
      return 'Pending';
    case 3:
      return 'Reject';
    case 5:
      return 'Approve';
    default:
      return 'Pending';
  }
};
const ASSIGN_REQUEST_STATUS = {
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  IN_PROGRESS: 4,
  COMPLETED: 5,
};
const AssignmentAccordion = ({
  assignRequest,
  template,
  isExpanded,
  onToggle,
  onSuccess,
}: AssignmentAccordionProps) => {
  const [selectedType, setSelectedType] = useState('Basic assignment');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null,
  );
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { lecturerId: currentLecturerId, isLoading: isLoadingLecturerId } =
    useGetCurrentLecturerId();

  // 1. Determine read-only state
  const isReadOnly =
    assignRequest.status === ASSIGN_REQUEST_STATUS.REJECTED ||
    assignRequest.status === ASSIGN_REQUEST_STATUS.COMPLETED;

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { dirtyFields },
  } = useForm<AssessmentFormData>({
    defaultValues: {
      templateName: '',
      templateDescription: '',
      paperName: '',
      paperDescription: '',
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });
  useEffect(() => {
    const initializeForm = async () => {
      setIsInitializing(true);
      if (template) {
        try {
          // Use /AssessmentFile/page endpoint (same as web version)
          const filesResponse = await getFilesForTemplate({
            assessmentTemplateId: template.id,
            pageNumber: 1,
            pageSize: 100,
          });
          setAttachedFiles(
            filesResponse.items.map(f => ({
              id: f.id,
              name: f.name,
              fileUrl: f.fileUrl,
              fileTemplate: f.fileTemplate,
              type: '', // File đã tồn tại không cần type
            })),
          );
        } catch (fileError: any) {
          // 404 is expected when template has no files - just set empty array
          if (fileError?.response?.status === 404 || fileError?.message?.includes('404')) {
            setAttachedFiles([]);
          } else {
            console.error('Failed to fetch existing files:', fileError);
            setAttachedFiles([]); // Set rỗng nếu lỗi
          }
        }
        const paper = template.papers?.[0];
        let questionsWithCriteria: QuestionFormData[] = [];
        if (paper?.questions?.length > 0) {
          const criteriaPromises = paper.questions.map(q =>
            getRubricItemsByQuestionId(q.id)
              .then(rubrics => ({ questionId: q.id, rubrics }))
              .catch(err => {
                // Only log non-404 errors (404 is expected when question has no rubrics)
                if (err?.response?.status !== 404 && !err?.message?.includes('404')) {
                  console.error(`Error fetching criteria for Q ${q.id}:`, err);
                }
                return { questionId: q.id, rubrics: [] };
              }),
          );
          const results = await Promise.all(criteriaPromises);
          const criteriaMap = new Map<number, RubricItemData[]>();
          results.forEach(res => criteriaMap.set(res.questionId, res.rubrics));
          questionsWithCriteria = paper.questions.map((q, index) => {
            const fetchedCriteria = criteriaMap.get(q.id) || [];
            return {
              id: q.id,
              title: q.questionText || '',
              content: '',
              sampleInput: q.questionSampleInput || '',
              sampleOutput: q.questionSampleOutput || '',
              score: String(q.score ?? '0'),
              questionNumber: index + 1,
              criteria: fetchedCriteria.map(c => ({
                id: c.id,
                input: c.input || '',
                output: c.output || '',
                dataType: 'String',
                description: c.description || '',
                score: String(c.score ?? '0'),
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
        // Defer expanding until fields are surely updated
        setTimeout(() => {
          if (fields.length > 0 && !expandedQuestionId) {
            setExpandedQuestionId(fields[0]?.id);
          }
        }, 0);
      } else {
        reset({
          templateName: '',
          templateDescription: '',
          paperName: '',
          paperDescription: '',
          questions: [],
        });
        setSelectedType('Basic assignment');
        setExpandedQuestionId(null);
        setAttachedFiles([]);
      }
      setIsInitializing(false);
    };
    if (template !== undefined) initializeForm();
  }, [template, reset]);
  // SỬA ĐỔI: Hàm upload file đính kèm
  const handleAttachedFilesUpload = async () => {
    if (isReadOnly) return;
    try {
      const results = await pick({
        allowMultiSelection: true,
        type: [types.allFiles],
      });
      if (results && results.length > 0) {
        const newFiles: AttachedFileState[] = results.map(file => ({
          name: file.name ?? file.uri.split('/').pop() ?? 'file', // Fallback tên file
          uri: file.uri,
          type: file.type ?? 'application/octet-stream', // Fallback MIME type
          fileTemplate: 1, // Default file template (ví dụ: 1 = Web API, 0 = Basic). Cần xác định
        }));
        setAttachedFiles(prevFiles => [...prevFiles, ...newFiles]);
        showSuccessToast('Success', `${newFiles.length} file(s) selected.`);
      }
    } catch (err) {
      console.log('Attached file picker error:', err);
    }
  };

  // THÊM MỚI: Hàm xóa file đính kèm
  const handleRemoveAttachedFile = (indexToRemove: number) => {
    if (isReadOnly) return;
    const fileToRemove = attachedFiles[indexToRemove];
    if (!fileToRemove) return;

    Alert.alert(
      'Remove File',
      `Are you sure you want to remove "${fileToRemove.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            // Nếu file có ID, nó đã ở trên server -> gọi API delete
            if (fileToRemove.id) {
              setIsSubmitting(true);
              try {
                const response = await deleteAssessmentFile(fileToRemove.id);
                if (!response.isSuccess) {
                  throw new Error(
                    response.errorMessages?.join(', ') || 'API Error',
                  );
                }
                showSuccessToast('Success', 'File removed from server.');
              } catch (error: any) {
                showErrorToast(
                  'Error',
                  error.message || 'Failed to remove file.',
                );
                setIsSubmitting(false); // Dừng loading nếu lỗi
                return; // Không xóa khỏi UI nếu API lỗi
              } finally {
                setIsSubmitting(false);
              }
            }
            // Xóa khỏi UI state (sau khi API thành công, hoặc nếu là file local)
            setAttachedFiles(prevFiles =>
              prevFiles.filter((_, index) => index !== indexToRemove),
            );
          },
        },
      ],
    );
  };
  const handleAddQuestion = () => {
    if (isReadOnly) return;
    const nextQuestionNumber = fields.length + 1;
    append({
      title: '',
      content: '',
      sampleInput: '',
      sampleOutput: '',
      score: '',
      questionNumber: nextQuestionNumber,
      criteria: [],
    });
  };

  // 2. Modify handleRemoveQuestion - No API call here, handled in Confirm
  const handleRemoveQuestion = (index: number) => {
    if (isReadOnly) return;
    const questionToRemove = fields[index] as QuestionFormData;

    // Just show confirmation, actual deletion happens in handleConfirm
    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove Question ${
        index + 1
      } from the list? It will be permanently deleted upon confirming changes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => remove(index), // Remove from UI immediately for better UX
        },
      ],
    );
  };

  const handleConfirm = async (formData: AssessmentFormData) => {
    if (isReadOnly) return;
    if (isLoadingLecturerId || !currentLecturerId) {
      showErrorToast('Error', 'Cannot identify current lecturer.');
      return;
    }
    setIsSubmitting(true);

    try {
      let currentTemplateId: number;
      let currentPaperId: number;

      // --- CREATE FLOW --- (Keep as is)
      if (!template) {
        /* ... existing create logic ... */
        const templatePayload: CreateAssessmentTemplatePayload = {
          assignRequestId: assignRequest.id,
          templateType: mapStringToTemplateType(selectedType),
          name: formData.templateName || assignRequest.courseElementName,
          description: formData.templateDescription || 'Assessment Template',
          createdByLecturerId: currentLecturerId,
          assignedToHODId: Number(assignRequest.assignedByHODId),
        };
        const templateRes = await createAssessmentTemplate(templatePayload);
        if (!templateRes.isSuccess || !templateRes.result?.id)
          throw new Error(
            'Failed to create template: ' +
              (templateRes.errorMessages?.join(', ') || 'Unknown error'),
          );
        currentTemplateId = templateRes.result.id;
        const filesToUpload = attachedFiles.filter(f => f.uri && !f.id);
        const uploadPromises = filesToUpload.map(file => {
          return uploadAssessmentFile(
            { uri: file.uri!, name: file.name, type: file.type! },
            file.name, // <-- Thêm file.name (hoặc 1 tên hợp lý) làm tham số 'name'
            file.fileTemplate,
            currentTemplateId,
          );
        });
        await Promise.all(uploadPromises);

        const paperPayload: CreateAssessmentPaperPayload = {
          name: formData.paperName || 'Default Paper',
          description: formData.paperDescription || '',
          assessmentTemplateId: currentTemplateId,
        };
        const paperRes = await createAssessmentPaper(paperPayload);
        if (!paperRes.isSuccess || !paperRes.result?.id)
          throw new Error(
            'Failed to create paper: ' +
              (paperRes.errorMessages?.join(', ') || 'Unknown error'),
          );
        currentPaperId = paperRes.result.id;
        for (let index = 0; index < formData.questions.length; index++) {
          const questionData = formData.questions[index];
          const questionNumber = questionData.questionNumber ?? index + 1;
          const questionPayload: CreateAssessmentQuestionPayload = {
            questionText: questionData.title,
            questionSampleInput: questionData.sampleInput,
            questionSampleOutput: questionData.sampleOutput,
            score: Number(questionData.score) || 0,
            questionNumber: questionNumber > 0 ? questionNumber : index + 1,
            assessmentPaperId: currentPaperId,
          };
          const questionRes = await createAssessmentQuestion(questionPayload);
          if (!questionRes.isSuccess || !questionRes.result?.id) {
            console.error(
              'Failed to create question: ',
              questionRes.errorMessages,
            );
            continue;
          }
          const newQuestionId = questionRes.result.id;
          for (const criteriaData of questionData.criteria) {
            const rubricPayload: CreateRubricItemPayload = {
              description: criteriaData.description,
              input: criteriaData.input,
              output: criteriaData.output,
              score: Number(criteriaData.score) || 0,
              assessmentQuestionId: newQuestionId,
            };
            const rubricRes = await createRubricItem(rubricPayload);
            if (!rubricRes.isSuccess)
              console.error(
                'Failed to create rubric item: ',
                rubricRes.errorMessages,
              );
          }
        }
        await updateAssignRequest(assignRequest.id, {
          message: assignRequest.message,
          courseElementId: assignRequest.courseElementId,
          assignedLecturerId: assignRequest.assignedLecturerId,
          assignedByHODId: assignRequest.assignedByHODId,
          assignedAt: assignRequest.assignedAt,
          status: 4,
        });
        showSuccessToast('Success', 'Assessment created successfully!');
        onSuccess();
      } else {
        currentTemplateId = template.id;
        const filesToUploadUpdate = attachedFiles.filter(f => f.uri && !f.id);
        const uploadPromisesUpdate = filesToUploadUpdate.map(file => {
          return uploadAssessmentFile(
            { uri: file.uri!, name: file.name, type: file.type! },
            file.name,
            file.fileTemplate,
            currentTemplateId,
          );
        });
        await Promise.all(uploadPromisesUpdate);
        const templatePayload: UpdateAssessmentTemplatePayload = {
          templateType: mapStringToTemplateType(selectedType),
          name: formData.templateName,
          description: formData.templateDescription,
          assignedToHODId: template.assignedToHODId,
        };
        await updateAssessmentTemplate(currentTemplateId, templatePayload); // Assume success

        const paper = template.papers?.[0];
        let paperUpdatedOrCreated = false; // Flag to check if paper exists/was created

        if (paper) {
          currentPaperId = paper.id;
          const paperPayload: UpdateAssessmentPaperPayload = {
            name: formData.paperName,
            description: formData.paperDescription,
          };
          await updateAssessmentPaper(currentPaperId, paperPayload); // Assume success
          paperUpdatedOrCreated = true;
        } else {
          // Create Paper if it didn't exist
          const paperPayload: CreateAssessmentPaperPayload = {
            name: formData.paperName || 'Default Paper',
            description: formData.paperDescription || '',
            assessmentTemplateId: currentTemplateId,
          };
          const paperRes = await createAssessmentPaper(paperPayload);
          if (!paperRes.isSuccess || !paperRes.result?.id)
            throw new Error(
              'Failed to create paper in update flow: ' +
                (paperRes.errorMessages?.join(', ') || 'Unknown error'),
            );
          currentPaperId = paperRes.result.id;
          paperUpdatedOrCreated = true;
        }

        if (paperUpdatedOrCreated) {
          // --- Question & Rubric Update/Create/Delete Logic ---
          const existingDBQuestions = paper?.questions || []; // Use empty array if paper didn't exist before
          const formQuestions = formData.questions;

          const existingDBQuestionIds = new Set(
            existingDBQuestions.map(q => q.id),
          );
          const formQuestionsWithDBId = formQuestions.filter(
            q => q.id !== undefined,
          );
          const formDBIds = new Set(
            formQuestionsWithDBId.map(q => q.id as number),
          );

          const questionsToCreate = formQuestions.filter(
            q => q.id === undefined,
          );
          const questionsToUpdate = formQuestionsWithDBId;
          // 3. Questions to Delete (in DB but NOT in form)
          const questionIdsToDelete = [...existingDBQuestionIds].filter(
            id => !formDBIds.has(id),
          );

          // Process Updates
          for (let index = 0; index < questionsToUpdate.length; index++) {
            const qData = questionsToUpdate[index];
            // Find the index of this question in formQuestions to determine questionNumber
            const formIndex = formQuestions.findIndex(q => q.id === qData.id);
            const questionNumber = qData.questionNumber ?? (formIndex >= 0 ? formIndex + 1 : index + 1);
            const updatePayload: UpdateAssessmentQuestionPayload = {
              questionText: qData.title,
              questionSampleInput: qData.sampleInput,
              questionSampleOutput: qData.sampleOutput,
              score: Number(qData.score) || 0,
              questionNumber: questionNumber > 0 ? questionNumber : (formIndex >= 0 ? formIndex + 1 : index + 1),
            };
            await updateAssessmentQuestion(qData.id!, updatePayload); // Assume success

            // --- Update/Create/Delete Rubrics for this Question ---
            let existingRubrics: RubricItemData[] = [];
            try {
              existingRubrics = await getRubricItemsByQuestionId(qData.id!); // Fetch fresh rubrics
            } catch (err: any) {
              // 404 is expected when question has no rubrics - use empty array
              if (err?.response?.status !== 404 && !err?.message?.includes('404')) {
                console.error(`Error fetching rubrics for question ${qData.id}:`, err);
              }
              existingRubrics = [];
            }
            const existingRubricIds = new Set(existingRubrics.map(r => r.id));
            const formCriteriaWithId = qData.criteria.filter(
              c => c.id !== undefined,
            );
            const formCriteriaIds = new Set(
              formCriteriaWithId.map(c => c.id as number),
            );

            const criteriaToCreate = qData.criteria.filter(
              c => c.id === undefined,
            );
            const criteriaToUpdate = formCriteriaWithId;
            const rubricIdsToDelete = [...existingRubricIds].filter(
              id => !formCriteriaIds.has(id),
            );

            for (const critData of criteriaToUpdate) {
              const critUpdatePayload: UpdateRubricItemPayload = {
                description: critData.description,
                input: critData.input,
                output: critData.output,
                score: Number(critData.score) || 0,
              };
              await updateRubricItem(critData.id!, critUpdatePayload); // Assume success
            }
            for (const critData of criteriaToCreate) {
              const critCreatePayload: CreateRubricItemPayload = {
                description: critData.description,
                input: critData.input,
                output: critData.output,
                score: Number(critData.score) || 0,
                assessmentQuestionId: qData.id!,
              };
              await createRubricItem(critCreatePayload); // Assume success
            }
            // 4. Call Delete Rubric API
            for (const critIdToDelete of rubricIdsToDelete) {
              await deleteRubricItem(critIdToDelete); // Assume success
            }
          }

          // Process Creates
          for (let index = 0; index < questionsToCreate.length; index++) {
            const qData = questionsToCreate[index];
            // Find the index of this question in formQuestions to determine questionNumber
            const formIndex = formQuestions.findIndex(q => q.id === qData.id || (!q.id && !qData.id && q === qData));
            const questionNumber = qData.questionNumber ?? (formIndex >= 0 ? formIndex + 1 : index + 1);
            const createPayload: CreateAssessmentQuestionPayload = {
              questionText: qData.title,
              questionSampleInput: qData.sampleInput,
              questionSampleOutput: qData.sampleOutput,
              score: Number(qData.score) || 0,
              questionNumber: questionNumber > 0 ? questionNumber : (formIndex >= 0 ? formIndex + 1 : index + 1),
              assessmentPaperId: currentPaperId,
            };
            const qCreateRes = await createAssessmentQuestion(createPayload);
            if (!qCreateRes.isSuccess || !qCreateRes.result?.id) {
              console.error('New Q Create Error:', qCreateRes.errorMessages);
              continue;
            }
            const newQId = qCreateRes.result.id;
            for (const criteriaData of qData.criteria) {
              const rubricPayload: CreateRubricItemPayload = {
                description: criteriaData.description,
                input: criteriaData.input,
                output: criteriaData.output,
                score: Number(criteriaData.score) || 0,
                assessmentQuestionId: newQId,
              };
              await createRubricItem(rubricPayload); // Assume success
            }
          }

          // 5. Call Delete Question API
          for (const qIdToDelete of questionIdsToDelete) {
            await deleteAssessmentQuestion(qIdToDelete); // Assume success
            // Handle potential errors if needed
          }
        }

        await updateAssignRequest(assignRequest.id, {
          message: assignRequest.message,
          courseElementId: assignRequest.courseElementId,
          assignedLecturerId: assignRequest.assignedLecturerId,
          assignedByHODId: assignRequest.assignedByHODId,
          assignedAt: assignRequest.assignedAt,
          status: 4,
        });
        showSuccessToast('Success', 'Assessment updated successfully!');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error confirming assessment:', error);
      const apiErrorMessage =
        error.response?.data?.errorMessages?.join(', ') || error.message;
      showErrorToast('Error', apiErrorMessage || 'Failed to save assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing || isLoadingLecturerId) {
    // Also check lecturer loading
    return (
      <View style={[styles.assignmentCard, styles.loadingContainer]}>
        <ActivityIndicator color={AppColors.pr500} />
      </View>
    );
  }

  return (
    <View style={styles.assignmentCard}>
      <TouchableOpacity style={styles.assignmentHeader} onPress={onToggle}>
        <AppText
          variant="body14pxBold"
          style={{ flex: 1, color: AppColors.n900 }}
        >
          {assignRequest.courseElementName}
        </AppText>
        <StatusTag status={mapStatusToString(assignRequest.status)} />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.assignmentBody}>
          <AppTextInputController
            control={control}
            name="templateName"
            label="Template Name"
            placeholder="Enter template name..."
            rules={{ required: 'Template name is required' }}
            editable={!isReadOnly}
          />
          <AppTextInputController
            control={control}
            name="templateDescription"
            label="Template Description"
            placeholder="Enter template description..."
            multiline
            editable={!isReadOnly}
          />
          <AppTextInputController
            control={control}
            name="paperName"
            label="Paper Name"
            placeholder="Enter paper name..."
            rules={{ required: 'Paper name is required' }}
            editable={!isReadOnly}
          />
          <AppTextInputController
            control={control}
            name="paperDescription"
            label="Paper Description"
            placeholder="Enter paper description..."
            multiline
            editable={!isReadOnly}
          />

          <View style={{ marginVertical: vs(16) }}>
            <AppText variant="body14pxBold" style={{ color: AppColors.n700 }}>
              Assignment Type
            </AppText>
            {['Basic assignment', 'Web API'].map(item => (
              <RadioWithTitle
                key={item}
                title={item}
                selected={item === selectedType}
                onPress={() => !isReadOnly && setSelectedType(item)}
                disabled={isReadOnly}
              />
            ))}
          </View>
          <View style={{ marginBottom: vs(16) }}>
            <AppText variant="body14pxBold" style={{ color: AppColors.n700, marginBottom: vs(8) }}>
              Assessment Files
            </AppText>
            {attachedFiles.map((file, index) => (
              <CurriculumItem
                key={file.id || `local-${index}`} // Dùng DB id hoặc index
                id={file.id || index}
                number={`0${index + 1}`}
                title={file.name}
                linkFile={file.name} // CurriculumItem sẽ tự cắt bớt
                rightIcon={<RemoveIcon color={AppColors.errorColor} />}
                onAction={() => handleRemoveAttachedFile(index)}
                disabled={isReadOnly || isSubmitting} // Disable khi đang submit
              />
            ))}

            {!isReadOnly && (
              <TouchableOpacity
                style={[styles.addQuestionButton, { marginTop: vs(8) }]}
                onPress={handleAttachedFilesUpload}
                disabled={isSubmitting} // Disable khi đang submit
              >
                <View style={styles.addFileButtonContent}>
                  <UploadIcon color={AppColors.pr500} />
                  <AppText
                    style={[
                      styles.addQuestionButtonText,
                      { marginLeft: s(8) },
                    ]}
                  >
                    Add Files
                  </AppText>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {fields.map((field, index) => {
            return (
              <QuestionItem
                key={field.id}
                index={index}
                isExpanded={expandedQuestionId === field.id}
                control={control}
                onToggle={() =>
                  setExpandedQuestionId(prevId =>
                    prevId === field.id ? null : field.id,
                  )
                }
                onRemove={() => handleRemoveQuestion(index)}
                canRemove={fields.length > 1}
                isEditable={!isReadOnly}
              />
            );
          })}

          {!isReadOnly && (
            <TouchableOpacity
              style={styles.addQuestionButton}
              onPress={handleAddQuestion}
              disabled={isSubmitting}
            >
              <AppText
                variant="body14pxBold"
                style={styles.addQuestionButtonText}
              >
                + Add Question
              </AppText>
            </TouchableOpacity>
          )}

          {!isReadOnly && (
            <AppButton
              title={isSubmitting ? 'Saving...' : 'Confirm'}
              onPress={handleSubmit(handleConfirm)}
              style={[styles.confirmButton, { minWidth: 0 }]}
              textVariant="body14pxBold"
              size="small"
              disabled={isSubmitting || isInitializing || isLoadingLecturerId} // Disable confirm if initializing or loading ID
            />
          )}
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
  addQuestionButtonText: { color: AppColors.pr500 },
  confirmButton: { marginTop: vs(16), borderRadius: vs(10) },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: vs(100),
  },
  addFileButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AssignmentAccordion;
