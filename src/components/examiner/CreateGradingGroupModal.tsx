import { yupResolver } from '@hookform/resolvers/yup';
import { pick } from '@react-native-documents/picker';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';
import * as yup from 'yup';
import { assessmentTemplateService } from '../../api/assessmentTemplateServiceWrapper';
import {
  addSubmissionsByFile,
  createGradingGroup,
  CreateGradingGroupPayload,
  GradingGroup,
} from '../../api/gradingGroupService';
import { uploadTestFile } from '../../api/gradingService';
import { LecturerListData } from '../../api/lecturerService';
import { getSubmissionList } from '../../api/submissionService';
import { AppColors } from '../../styles/color';
import AppText from '../texts/AppText';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import AssessmentTemplatePicker from './AssessmentTemplatePicker';
import FileUploadSection from './FileUploadSection';
import LecturerPicker from './LecturerPicker';
import ModalActions from './ModalActions';

// Helper function to check if an assessment template is a PE (Practical Exam)
function isPracticalExamTemplate(template: any): boolean {
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

const schema = yup
  .object({
    lecturerId: yup.number().required('Lecturer is required'),
    assessmentTemplateId: yup.number().nullable(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

interface CreateGradingGroupModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
  allLecturers: LecturerListData[];
  existingGroups: GradingGroup[];
  gradingGroupToSemesterMap: Map<number, string>;
}

const CreateGradingGroupModal: React.FC<CreateGradingGroupModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
  allLecturers = [],
  existingGroups = [],
  gradingGroupToSemesterMap = new Map(),
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentTemplates, setAssessmentTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ uri: string; name: string; type: string }>>([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      lecturerId: undefined,
      assessmentTemplateId: null,
    },
  });

  const selectedLecturerId = watch('lecturerId');
  const selectedTemplateId = watch('assessmentTemplateId');

  const fetchAssessmentTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const response = await assessmentTemplateService.getAssessmentTemplates({
        pageNumber: 1,
        pageSize: 1000,
      });
      // Filter PE templates by keywords in courseElementName
      const peTemplates = (response?.items || []).filter(
        t => t && isPracticalExamTemplate(t)
      );
      setAssessmentTemplates(peTemplates);
    } catch (err) {
      console.error('Failed to fetch assessment templates:', err);
      showErrorToast('Error', 'Failed to load assessment templates.');
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      try {
        reset({
          lecturerId: undefined,
          assessmentTemplateId: null,
        });
        setSelectedFiles([]);
        fetchAssessmentTemplates();
      } catch (err) {
        console.error('Error initializing modal:', err);
      }
    }
  }, [visible, reset, clearErrors, fetchAssessmentTemplates]);

  // Validate duplicate assignment when lecturer or template changes
  useEffect(() => {
    const lecturerId = selectedLecturerId;
    const templateId = selectedTemplateId;
    
    if (lecturerId && templateId) {
      const isDuplicate = (existingGroups || []).some(group => {
        if (!group || !group.id) return false;
        return group.lecturerId === Number(lecturerId) && 
               group.assessmentTemplateId === templateId;
      });
      
      if (isDuplicate) {
        setError('assessmentTemplateId', {
          type: 'manual',
          message: 'This teacher has already been assigned this assessment template.',
        });
      } else {
        clearErrors('assessmentTemplateId');
      }
    }
  }, [selectedLecturerId, selectedTemplateId, existingGroups, setError, clearErrors]);

  const validateFileName = (fileName: string): boolean => {
    const pattern = /^STU\d{6}\.zip$/i;
    return pattern.test(fileName);
  };

  const handlePickFiles = async () => {
    try {
      const result = await pick({
        allowMultiSelection: true,
        type: ['application/zip'],
      });

      if (result && result.length > 0) {
        const validFiles: Array<{ uri: string; name: string; type: string }> = [];
        const invalidFiles: string[] = [];

        for (const file of result) {
          if (!file.name) continue;
          
          if (!file.name.toLowerCase().endsWith('.zip')) {
            invalidFiles.push(file.name);
            continue;
          }

          if (!validateFileName(file.name)) {
            invalidFiles.push(file.name);
            continue;
          }

          validFiles.push({
            uri: file.uri,
            name: file.name,
            type: file.type || 'application/zip',
          });
        }

        if (invalidFiles.length > 0) {
          showErrorToast(
            'Invalid Files',
            `Invalid file(s): ${invalidFiles.join(', ')}. File names must be in format STUXXXXXX.zip (e.g., STU123456.zip)`,
          );
        }

        if (validFiles.length > 0) {
          setSelectedFiles(prev => [...prev, ...validFiles]);
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('User cancelled') || err?.message?.includes('canceled')) {
        // User cancelled, do nothing
      } else {
        console.error('File picker error:', err);
        showErrorToast('Error', 'Failed to select files');
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      // Validate duplicate assignment (already checked in form, but double-check here)
      if (data.lecturerId && data.assessmentTemplateId) {
        const lecturerIdNum = Number(data.lecturerId);
        if (isNaN(lecturerIdNum)) {
          showErrorToast('Error', 'Invalid lecturer ID.');
          setIsLoading(false);
          return;
        }

        const duplicateGroup = (existingGroups || []).find(group => {
          if (!group || !group.id) return false;
          return group.lecturerId === lecturerIdNum && 
                 group.assessmentTemplateId === data.assessmentTemplateId;
        });

        if (duplicateGroup) {
          showErrorToast(
            'Error',
            'This teacher has already been assigned this assessment template!',
          );
          setIsLoading(false);
          return;
        }
      }

      if (!data.assessmentTemplateId) {
        showErrorToast('Error', 'Assessment template is required.');
        setIsLoading(false);
        return;
      }

      // Create grading group
      const lecturerIdNum = Number(data.lecturerId);
      if (isNaN(lecturerIdNum)) {
        showErrorToast('Error', 'Invalid lecturer ID.');
        setIsLoading(false);
        return;
      }

      const payload: CreateGradingGroupPayload = {
        lecturerId: lecturerIdNum,
        assessmentTemplateId: data.assessmentTemplateId,
      };

      const group = await createGradingGroup(payload);
      if (!group || !group.id) {
        showErrorToast('Error', 'Failed to create grading group.');
        setIsLoading(false);
        return;
      }
      showSuccessToast('Success', 'Teacher assigned successfully!');

      // Upload ZIP files if provided
      if (selectedFiles.length > 0) {
        try {
          // Convert files to FormData format
          const files = selectedFiles.map(f => ({
            uri: f.uri,
            name: f.name,
            type: f.type,
          }));

          const result = await addSubmissionsByFile(group.id, files);
          showSuccessToast(
            'Success',
            `Added ${result.createdSubmissionsCount} submissions from ${selectedFiles.length} ZIP file(s)!`,
          );

          // Fetch submissions and upload test files
          const submissions = await getSubmissionList({ gradingGroupId: group.id });
          
          // Extract student code from file name (STUXXXXXX.zip -> XXXXXX)
          const extractStudentCode = (fileName: string): string | null => {
            const match = fileName.match(/^STU(\d{6})\.zip$/i);
            return match ? match[1] : null;
          };

          // Create a map of student code to file
          const fileMap = new Map<string, { uri: string; name: string; type: string }>();
          selectedFiles.forEach(file => {
            const studentCode = extractStudentCode(file.name);
            if (studentCode) {
              fileMap.set(studentCode, file);
            }
          });

          // Upload test file for each submission
          const uploadPromises: Promise<any>[] = [];
          for (const submission of submissions) {
            if (!submission || !submission.id || !submission.studentCode) continue;
            const testFile = fileMap.get(submission.studentCode);
            if (testFile && testFile.uri && testFile.name) {
              uploadPromises.push(
                uploadTestFile(submission.id, testFile).catch(err => {
                  console.error(`Failed to upload test file for submission ${submission.id}:`, err);
                  return null;
                }),
              );
            }
          }

          if (uploadPromises.length > 0) {
            const results = await Promise.all(uploadPromises);
            const successCount = results.filter(r => r !== null).length;
            if (successCount > 0) {
              showSuccessToast('Success', `Test files uploaded for ${successCount}/${uploadPromises.length} submission(s)!`);
            }
          }
        } catch (err: any) {
          console.error('Failed to upload files:', err);
          showErrorToast('Error', err.message || 'Failed to upload submission files.');
        }
      }

      onSuccess();
      onDismiss();
    } catch (error: any) {
      console.error('Failed to assign teacher:', error);
      showErrorToast('Error', error.message || 'Failed to assign teacher.');
    } finally {
      setIsLoading(false);
    }
  };


  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <AppText variant="h4" style={styles.title}>
            Assign Teacher
          </AppText>

          <LecturerPicker
              control={control}
            allLecturers={allLecturers}
                />

          <AssessmentTemplatePicker
                  control={control}
            assessmentTemplates={assessmentTemplates}
            loadingTemplates={loadingTemplates}
            selectedLecturerId={selectedLecturerId}
            existingGroups={existingGroups}
            errors={errors}
            clearErrors={clearErrors}
          />

          <FileUploadSection
            selectedFiles={selectedFiles}
            onPickFiles={handlePickFiles}
            onRemoveFile={removeFile}
          />

          <ModalActions
            onCancel={onDismiss}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            />
        </ScrollView>
      </Modal>
    </Portal>
  );
};

export default CreateGradingGroupModal;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: AppColors.white,
    margin: s(20),
    borderRadius: s(12),
    maxHeight: '90%',
  },
  scrollContent: {
    padding: s(20),
  },
  title: {
    marginBottom: vs(20),
    color: AppColors.n900,
  },
});

