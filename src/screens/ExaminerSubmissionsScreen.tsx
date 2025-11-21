import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import { AppColors } from '../styles/color';
import { showErrorToast } from '../components/toasts/AppToast';
import { getSubmissionList, Submission } from '../api/submissionService';
import StatusTag from '../components/assessments/StatusTag';
import Feather from 'react-native-vector-icons/Feather';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import RNBlobUtil from 'react-native-blob-util';

dayjs.extend(utc);
dayjs.extend(timezone);

interface RouteParams {
  examSessionId?: string;
  shiftId?: string;
}

const ExaminerSubmissionsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params as RouteParams) || {};
  const examSessionId = params.examSessionId || params.shiftId;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const fetchSubmissions = useCallback(async () => {
    if (!examSessionId) {
      setIsLoading(false);
      setError('No Exam Session ID provided.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await getSubmissionList({
        examSessionId: Number(examSessionId),
      });
      setSubmissions(response || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch submissions:', err);
      setError(err.message || 'Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  }, [examSessionId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const filteredData = useMemo(() => {
    if (!searchText) return submissions;
    const searchLower = searchText.toLowerCase();
    return submissions.filter(
      (sub) =>
        sub.studentName.toLowerCase().includes(searchLower) ||
        sub.studentCode.toLowerCase().includes(searchLower) ||
        sub.submissionFile?.name.toLowerCase().includes(searchLower)
    );
  }, [submissions, searchText]);

  const formatUtcDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return dayjs(dateString)
        .tz('Asia/Ho_Chi_Minh')
        .format('DD/MM/YYYY HH:mm');
    } catch {
      return 'N/A';
    }
  };

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

  const handleDownload = async (submission: Submission) => {
    if (!submission.submissionFile?.submissionUrl) {
      showErrorToast('Error', 'No file available for download.');
      return;
    }

    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        showErrorToast('Permission Denied', 'Storage permission is required.');
        return;
      }

      const fileUrl = submission.submissionFile.submissionUrl;
      const fileName = submission.submissionFile.name || `submission_${submission.id}.zip`;

      const { config, fs } = RNBlobUtil;
      const downloadDir = fs.dirs.DownloadDir;
      const filePath = `${downloadDir}/${fileName}`;

      const downloadConfig = config({
        fileCache: true,
        path: filePath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'Downloading submission file',
          mime: 'application/zip',
          mediaScannable: true,
        },
      });

      await downloadConfig.fetch('GET', fileUrl);

      if (Platform.OS === 'android') {
        await RNBlobUtil.android.addCompleteDownload({
          title: fileName,
          description: 'Download complete',
          mime: 'application/zip',
          path: filePath,
          showNotification: true,
        });
      }

      showErrorToast('Success', `File saved to Downloads: ${fileName}`);
    } catch (err: any) {
      console.error('Download error:', err);
      showErrorToast('Error', err.message || 'Failed to download file.');
    }
  };

  const renderSubmissionItem = ({ item }: { item: Submission }) => (
    <View style={styles.submissionCard}>
      <View style={styles.submissionHeader}>
        <View style={styles.submissionIdContainer}>
          <AppText style={styles.submissionId}>ID: {item.id}</AppText>
        </View>
        <StatusTag status={item.status} />
      </View>

      <View style={styles.submissionBody}>
        <View style={styles.infoRow}>
          <Feather name="file" size={s(16)} color={AppColors.n600} />
          <AppText style={styles.infoLabel}>File:</AppText>
          <AppText style={styles.infoValue} numberOfLines={1}>
            {item.submissionFile?.name || 'N/A'}
          </AppText>
        </View>

        <View style={styles.infoRow}>
          <Feather name="user" size={s(16)} color={AppColors.n600} />
          <AppText style={styles.infoLabel}>Student:</AppText>
          <AppText style={styles.infoValue}>
            {item.studentName} ({item.studentCode})
          </AppText>
        </View>

        <View style={styles.infoRow}>
          <Feather name="calendar" size={s(16)} color={AppColors.n600} />
          <AppText style={styles.infoLabel}>Submitted At:</AppText>
          <AppText style={styles.infoValue}>{formatUtcDate(item.submittedAt)}</AppText>
        </View>

        <View style={styles.infoRow}>
          <Feather name="star" size={s(16)} color={AppColors.n600} />
          <AppText style={styles.infoLabel}>Score:</AppText>
          <AppText style={styles.infoValue}>
            {item.lastGrade !== null && item.lastGrade !== undefined
              ? `${item.lastGrade}/100`
              : 'N/A'}
          </AppText>
        </View>

        {item.lecturerName && (
          <View style={styles.infoRow}>
            <Feather name="user-check" size={s(16)} color={AppColors.n600} />
            <AppText style={styles.infoLabel}>Grader:</AppText>
            <AppText style={styles.infoValue}>{item.lecturerName}</AppText>
          </View>
        )}
      </View>

      <View style={styles.submissionActions}>
        <TouchableOpacity
          style={[
            styles.downloadButton,
            !item.submissionFile?.submissionUrl && styles.downloadButtonDisabled,
          ]}
          onPress={() => handleDownload(item)}
          disabled={!item.submissionFile?.submissionUrl}
          activeOpacity={0.6}
        >
          <Feather
            name="download"
            size={s(16)}
            color={item.submissionFile?.submissionUrl ? AppColors.pr500 : AppColors.n400}
          />
          <AppText
            style={[
              styles.downloadButtonText,
              !item.submissionFile?.submissionUrl && styles.downloadButtonTextDisabled,
            ]}
          >
            Download
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <AppSafeView>
        <ScreenHeader title="Submissions" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  if (error) {
    return (
      <AppSafeView>
        <ScreenHeader title="Submissions" />
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>{error}</AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchSubmissions}
            activeOpacity={0.6}
          >
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader title="Submissions" />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={s(18)} color={AppColors.n500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by student, code, or filename..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={AppColors.n500}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} activeOpacity={0.6}>
              <Feather name="x" size={s(18)} color={AppColors.n500} />
            </TouchableOpacity>
          )}
        </View>

        {/* Submissions List */}
        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>
              {searchText ? 'No submissions found matching your search.' : 'No submissions found.'}
            </AppText>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => `submission-${item.id}`}
            renderItem={renderSubmissionItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </AppSafeView>
  );
};

export default ExaminerSubmissionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: s(20),
    backgroundColor: AppColors.n50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(40),
    backgroundColor: AppColors.white,
  },
  errorText: {
    fontSize: s(15),
    color: AppColors.r500,
    textAlign: 'center',
    marginBottom: vs(20),
  },
  retryButton: {
    paddingHorizontal: s(20),
    paddingVertical: vs(10),
    backgroundColor: AppColors.pr500,
    borderRadius: s(8),
  },
  retryButtonText: {
    color: AppColors.white,
    fontSize: s(14),
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    marginBottom: vs(20),
    borderWidth: 1,
    borderColor: AppColors.n300,
    gap: s(12),
  },
  searchInput: {
    flex: 1,
    fontSize: s(14),
    color: AppColors.n900,
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
  submissionCard: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    padding: s(16),
    marginBottom: vs(12),
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: AppColors.n200,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n100,
  },
  submissionIdContainer: {
    flex: 1,
  },
  submissionId: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n700,
  },
  submissionBody: {
    gap: vs(10),
    marginBottom: vs(12),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  infoLabel: {
    fontSize: s(13),
    fontWeight: '600',
    color: AppColors.n600,
    minWidth: s(100),
  },
  infoValue: {
    fontSize: s(13),
    color: AppColors.n900,
    flex: 1,
  },
  submissionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: vs(12),
    borderTopWidth: 1,
    borderTopColor: AppColors.n100,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: vs(10),
    borderRadius: s(8),
    backgroundColor: AppColors.pr100,
    gap: s(8),
    borderWidth: 1,
    borderColor: AppColors.pr300,
  },
  downloadButtonDisabled: {
    backgroundColor: AppColors.n100,
    borderColor: AppColors.n300,
  },
  downloadButtonText: {
    fontSize: s(13),
    fontWeight: '600',
    color: AppColors.pr500,
  },
  downloadButtonTextDisabled: {
    color: AppColors.n400,
  },
});

