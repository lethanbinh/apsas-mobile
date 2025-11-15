import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';
import { pick } from '@react-native-documents/picker';
import AppButton from '../buttons/AppButton';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { showErrorToast, showSuccessToast } from '../toasts/AppToast';
import {
  getGradingGroupById,
  GradingGroup,
  addSubmissionsByFile,
} from '../../api/gradingGroupService';
import { getSubmissionList, Submission, deleteSubmission } from '../../api/submissionService';
import { uploadTestFile } from '../../api/gradingService';
import StatusTag from '../assessments/StatusTag';
import Feather from 'react-native-vector-icons/Feather';
import dayjs from 'dayjs';

interface AssignSubmissionsModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
  group: GradingGroup;
}

const AssignSubmissionsModal: React.FC<AssignSubmissionsModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
  group,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ uri: string; name: string; type: string }>>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');

  const fetchSubmissions = useCallback(async () => {
    if (!group?.id) return;

    setLoadingSubmissions(true);
    try {
      const updatedGroup = await getGradingGroupById(group.id);
      const allSubs = await getSubmissionList({ gradingGroupId: group.id });
      setSubmissions(allSubs || []);
    } catch (err: any) {
      console.error('Failed to fetch submissions:', err);
      showErrorToast('Error', 'Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  }, [group?.id]);

  useEffect(() => {
    if (visible && group?.id) {
      fetchSubmissions();
      setSelectedFiles([]);
      setActiveTab('list');
    }
  }, [visible, group?.id, fetchSubmissions]);

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

  const handleUploadZip = async () => {
    if (selectedFiles.length === 0) {
      showErrorToast('Error', 'Please select at least one ZIP file!');
      return;
    }

    if (!group?.id) return;

    setIsLoading(true);

    try {
      // Upload submissions
      const files = selectedFiles.map(f => ({
        uri: f.uri,
        name: f.name,
        type: f.type,
      }));

      const result = await addSubmissionsByFile(group.id, files);
      showSuccessToast(
        'Success',
        `Added ${result.createdSubmissionsCount} submissions from ${selectedFiles.length} file(s) successfully!`,
      );

      // Fetch updated submissions
      const allSubs = await getSubmissionList({ gradingGroupId: group.id });

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
      if (allSubs && allSubs.length > 0) {
        const uploadPromises: Promise<any>[] = [];
        for (const submission of allSubs) {
          if (!submission || !submission.studentCode) continue;
          const testFile = fileMap.get(submission.studentCode);
          if (testFile) {
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
      }

      await fetchSubmissions();
      setSelectedFiles([]);
      setActiveTab('list');
      onSuccess();
    } catch (err: any) {
      console.error('Failed to upload files:', err);
      showErrorToast('Error', err.message || 'Failed to upload files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubmission = async (submissionId: number) => {
    Alert.alert(
      'Delete Submission',
      'Are you sure you want to delete this submission?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubmission(submissionId);
              showSuccessToast('Success', 'Submission deleted successfully');
              await fetchSubmissions();
              onSuccess();
            } catch (error: any) {
              console.error('Failed to delete submission:', error);
              showErrorToast('Error', error.message || 'Failed to delete submission.');
            }
          },
        },
      ],
    );
  };

  const renderSubmissionItem = ({ item }: { item: Submission }) => {
    const statusText = item.status === 0 ? 'On Time' : 'Late';
    const submittedDate = item.submittedAt
      ? dayjs(item.submittedAt).format('DD/MM/YYYY HH:mm')
      : 'N/A';

    return (
      <View style={styles.submissionItem}>
        <View style={styles.submissionInfo}>
          <View style={styles.submissionHeader}>
            <AppText variant="body16pxBold">{item.studentName || 'Unknown'}</AppText>
            <StatusTag status={statusText} />
          </View>
          <AppText style={styles.studentCode}>{item.studentCode || 'N/A'}</AppText>
          <AppText style={styles.submittedAt}>Submitted: {submittedDate}</AppText>
          {item.lastGrade !== null && item.lastGrade !== undefined && (
            <AppText style={styles.grade}>Score: {item.lastGrade}/100</AppText>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSubmission(item.id)}
        >
          <Feather name="trash-2" size={s(16)} color={AppColors.r500} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <AppText variant="h4" style={styles.title}>
            Manage Submissions - {group.lecturerName || 'Unknown'}
          </AppText>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'list' && styles.tabActive]}
            onPress={() => setActiveTab('list')}
          >
            <AppText
              style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}
            >
              Submissions List
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upload' && styles.tabActive]}
            onPress={() => setActiveTab('upload')}
          >
            <Feather
              name="upload"
              size={s(16)}
              color={activeTab === 'upload' ? AppColors.pr500 : AppColors.n500}
            />
            <AppText
              style={[styles.tabText, activeTab === 'upload' && styles.tabTextActive]}
            >
              Upload ZIP File
            </AppText>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'list' ? (
            <View>
              <AppText style={styles.sectionTitle}>
                Total: {submissions.length} submissions
              </AppText>
              {loadingSubmissions ? (
                <View style={styles.loadingContainer}>
                  <AppText>Loading...</AppText>
                </View>
              ) : submissions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <AppText style={styles.emptyText}>No submissions found.</AppText>
                </View>
              ) : (
                <FlatList
                  data={submissions}
                  keyExtractor={item => item.id.toString()}
                  renderItem={renderSubmissionItem}
                  scrollEnabled={false}
                />
              )}
            </View>
          ) : (
            <View>
              <AppText style={styles.helpText}>
                ZIP files will be extracted and submissions will be created automatically.
                Each ZIP file will also be uploaded as test file for the corresponding submission (matched by student code).
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
                  <AppText style={styles.fileListTitle}>
                    Selected files ({selectedFiles.length}):
                  </AppText>
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

              <View style={styles.uploadActions}>
                <AppButton
                  title="Cancel"
                  onPress={onDismiss}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <AppButton
                  title="Upload"
                  onPress={handleUploadZip}
                  loading={isLoading}
                  disabled={selectedFiles.length === 0}
                  style={styles.uploadSubmitButton}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
};

export default AssignSubmissionsModal;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: AppColors.white,
    margin: s(20),
    borderRadius: s(12),
    maxHeight: '90%',
  },
  header: {
    padding: s(20),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
  },
  title: {
    color: AppColors.n900,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(12),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: AppColors.pr500,
  },
  tabText: {
    fontSize: s(14),
    color: AppColors.n500,
    marginLeft: s(4),
  },
  tabTextActive: {
    color: AppColors.pr500,
    fontWeight: '600',
  },
  content: {
    maxHeight: vs(400),
  },
  sectionTitle: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n700,
    marginBottom: vs(10),
    paddingHorizontal: s(20),
    paddingTop: vs(15),
  },
  loadingContainer: {
    padding: s(20),
    alignItems: 'center',
  },
  emptyContainer: {
    padding: s(20),
    alignItems: 'center',
  },
  emptyText: {
    color: AppColors.n500,
    fontSize: s(14),
  },
  submissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(15),
    marginHorizontal: s(20),
    marginBottom: vs(10),
    backgroundColor: AppColors.n50,
    borderRadius: s(8),
  },
  submissionInfo: {
    flex: 1,
  },
  submissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(4),
  },
  studentCode: {
    fontSize: s(12),
    color: AppColors.n500,
    marginBottom: vs(4),
  },
  submittedAt: {
    fontSize: s(12),
    color: AppColors.n600,
    marginBottom: vs(2),
  },
  grade: {
    fontSize: s(12),
    color: AppColors.g500,
    fontWeight: '600',
  },
  deleteButton: {
    padding: s(8),
  },
  helpText: {
    fontSize: s(12),
    color: AppColors.n500,
    marginBottom: vs(15),
    paddingHorizontal: s(20),
    paddingTop: vs(15),
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
    marginHorizontal: s(20),
    marginBottom: vs(15),
  },
  uploadButtonText: {
    marginLeft: s(8),
    color: AppColors.pr500,
    fontWeight: '600',
  },
  fileList: {
    marginHorizontal: s(20),
    marginBottom: vs(15),
  },
  fileListTitle: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n700,
    marginBottom: vs(8),
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
  uploadActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
    gap: s(12),
  },
  cancelButton: {
    flex: 1,
  },
  uploadSubmitButton: {
    flex: 1,
  },
});

