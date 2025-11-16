import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { s, vs } from 'react-native-size-matters';
import { pick } from '@react-native-documents/picker';
import RNPickerSelect from 'react-native-picker-select';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import {
  createGradingGroup,
  CreateGradingGroupPayload,
  GradingGroup,
} from '../../api/gradingGroupService';
import { fetchLecturerList, LecturerListData } from '../../api/lecturerService';
import { assessmentTemplateService } from '../../api/assessmentTemplateServiceWrapper';
import { addSubmissionsByFile } from '../../api/gradingGroupService';
import { getSubmissionList } from '../../api/submissionService';
import { uploadTestFile } from '../../api/gradingService';
import Feather from 'react-native-vector-icons/Feather';

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
  allLecturers,
  existingGroups,
  gradingGroupToSemesterMap,
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
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      lecturerId: undefined,
      assessmentTemplateId: null,
    },
  });

  const selectedTemplateId = watch('assessmentTemplateId');
  const selectedTemplate = useMemo(() => {
    return assessmentTemplates.find(t => t && t.id === selectedTemplateId);
  }, [assessmentTemplates, selectedTemplateId]);

  const isWebApiTemplate = selectedTemplate?.templateType === 1;

  useEffect(() => {
    if (visible) {
      reset({
        lecturerId: undefined,
        assessmentTemplateId: null,
      });
      setSelectedFiles([]);
      fetchAssessmentTemplates();
    }
  }, [visible, reset]);

  const fetchAssessmentTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await assessmentTemplateService.getAssessmentTemplates({
        pageNumber: 1,
        pageSize: 1000,
      });
      setAssessmentTemplates(response.items || []);
    } catch (err) {
      console.error('Failed to fetch assessment templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const getSemesterCodeForTemplate = (templateId: number): string | null => {
    // This would need course element data, simplified for now
    return null;
  };

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
      // Validate duplicate assignment
      if (data.lecturerId && data.assessmentTemplateId) {
        try {
          const newSemesterCode = getSemesterCodeForTemplate(data.assessmentTemplateId);

          if (newSemesterCode) {
            const lecturerIdNum = Number(data.lecturerId);
            if (isNaN(lecturerIdNum)) {
              showErrorToast('Error', 'Invalid lecturer ID.');
              setIsLoading(false);
              return;
            }

            const duplicateGroup = existingGroups.find(group => {
              if (!group || !group.id) return false;
              if (group.lecturerId !== lecturerIdNum || group.assessmentTemplateId !== data.assessmentTemplateId) {
                return false;
              }
              const existingSemester = gradingGroupToSemesterMap.get(group.id);
              return existingSemester === newSemesterCode;
            });

            if (duplicateGroup) {
              showErrorToast(
                'Error',
                `This teacher has already been assigned this assessment template for semester ${newSemesterCode}!`,
              );
              setIsLoading(false);
              return;
            }
          }
        } catch (validationErr) {
          console.error('Error validating duplicate assignment:', validationErr);
        }
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
        assessmentTemplateId: data.assessmentTemplateId || null,
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

  const lecturerOptions = (allLecturers || [])
    .filter(l => l && l.lecturerId)
    .map(l => ({
      label: `${(l.fullName && typeof l.fullName === 'string') ? l.fullName : 'Unknown'} (${l.accountCode || 'N/A'})`,
      value: Number(l.lecturerId),
    }))
    .filter(opt => !isNaN(opt.value));

  const templateOptions = [
    { label: 'None', value: null },
    ...(assessmentTemplates || [])
      .filter(t => t && t.id && typeof t.id === 'number')
      .map(t => ({
        label: `${(t.name && typeof t.name === 'string') ? t.name : 'Unknown'} - ${(t.courseElementName && typeof t.courseElementName === 'string') ? t.courseElementName : 'N/A'}`,
        value: t.id,
      })),
  ];

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

          <View style={styles.formGroup}>
            <AppText style={styles.label}>Select Teacher *</AppText>
            <Controller
              control={control}
              name="lecturerId"
              render={({ field: { onChange, value } }) => (
                <RNPickerSelect
                  onValueChange={onChange}
                  value={value}
                  placeholder={{ label: 'Select teacher', value: null }}
                  items={lecturerOptions}
                  style={pickerSelectStyles}
                />
              )}
            />
          </View>

          <View style={styles.formGroup}>
            <AppText style={styles.label}>Assessment Template (Optional)</AppText>
            <Controller
              control={control}
              name="assessmentTemplateId"
              render={({ field: { onChange, value } }) => (
                <RNPickerSelect
                  onValueChange={onChange}
                  value={value}
                  placeholder={{ label: 'Select assessment template', value: null }}
                  items={templateOptions}
                  style={pickerSelectStyles}
                  disabled={loadingTemplates}
                />
              )}
            />
          </View>

          <View style={styles.formGroup}>
            <AppText style={styles.label}>Upload Submissions (Optional)</AppText>
            <AppText style={styles.helpText}>
              ZIP files will be extracted and submissions will be created automatically.
              File names must be in format STUXXXXXX.zip (e.g., STU123456.zip)
            </AppText>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickFiles}
            >
              <Feather name="upload" size={s(20)} color={AppColors.pr500} />
              <AppText style={styles.uploadButtonText}>Select ZIP Files</AppText>
            </TouchableOpacity>

            {selectedFiles.length > 0 && (
              <View style={styles.fileList}>
                {selectedFiles.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <Feather name="file" size={s(16)} color={AppColors.n600} />
                    <AppText style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </AppText>
                    <TouchableOpacity onPress={() => removeFile(index)}>
                      <Feather name="x" size={s(16)} color={AppColors.r500} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <AppButton
              title="Cancel"
              onPress={onDismiss}
              variant="outline"
              style={styles.cancelButton}
            />
            <AppButton
              title="Assign"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading || isSubmitting}
              style={styles.submitButton}
            />
          </View>
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
  formGroup: {
    marginBottom: vs(15),
  },
  label: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n700,
    marginBottom: vs(8),
  },
  helpText: {
    fontSize: s(12),
    color: AppColors.n500,
    marginBottom: vs(8),
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: vs(12),
    backgroundColor: AppColors.pr100,
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: AppColors.pr300,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    marginLeft: s(8),
    color: AppColors.pr500,
    fontWeight: '600',
  },
  fileList: {
    marginTop: vs(10),
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: vs(8),
    backgroundColor: AppColors.n50,
    borderRadius: s(6),
    marginBottom: vs(6),
  },
  fileName: {
    flex: 1,
    marginLeft: s(8),
    fontSize: s(12),
    color: AppColors.n700,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(20),
    gap: s(12),
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: s(14),
    paddingVertical: vs(12),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: AppColors.n200,
    borderRadius: s(8),
    color: AppColors.n900,
    backgroundColor: AppColors.white,
  },
  inputAndroid: {
    fontSize: s(14),
    paddingVertical: vs(12),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: AppColors.n200,
    borderRadius: s(8),
    color: AppColors.n900,
    backgroundColor: AppColors.white,
  },
  placeholder: {
    color: AppColors.n500,
  },
};

