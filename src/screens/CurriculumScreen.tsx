import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  View,
  ActivityIndicator,
} from 'react-native';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import AppSafeView from '../components/views/AppSafeView';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useRoute } from '@react-navigation/native';
import { showErrorToast } from '../components/toasts/AppToast';
import { DownloadIcon, ViewIcon } from '../assets/icons/courses'; // Import Icon
import AppText from '../components/texts/AppText';
import { AppColors } from '../styles/color';
import { fetchCourseElements } from '../api/courseElementService';

const CurriculumScreen = () => {
  const route = useRoute();
  const semesterCourseId = (route.params as { semesterCourseId?: string })
    ?.semesterCourseId;

  const [isLoading, setIsLoading] = useState(true);
  const [courseElements, setCourseElements] = useState<CourseElementData[]>([]);

  useEffect(() => {
    if (!semesterCourseId) {
      showErrorToast('Error', 'No Semester Course ID provided.');
      setIsLoading(false);
      return;
    }

    const loadElements = async () => {
      setIsLoading(true);
      try {
        const allElements = await fetchCourseElements();
        console.log(allElements, semesterCourseId);
        const relevantElements = allElements.filter(
          el => el.semesterCourseId.toString() === semesterCourseId,
        );
        setCourseElements(relevantElements);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load curriculum elements.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadElements();
  }, [semesterCourseId]);

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        // Sửa: Dùng WRITE_EXTERNAL_STORAGE (mặc dù READ có thể đủ cho một số trường hợp)
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'This app needs access to your storage to download files.',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to download files.',
      );
      return;
    }
    const sampleFileUrl =
      fileUrl ||
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const { dirs } = ReactNativeBlobUtil.fs;
    const dirToSave =
      Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
    const config = {
      fileCache: true,
      path: `${dirToSave}/${fileName}`,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: `${dirToSave}/${fileName}`,
        description: 'Downloading file.',
      },
    };

    ReactNativeBlobUtil.config(config)
      .fetch('GET', sampleFileUrl)
      .then(res => {
        if (Platform.OS === 'ios') {
          ReactNativeBlobUtil.ios.previewDocument(res.path());
        }
        Alert.alert(
          'Download Complete',
          `${fileName} has been saved to your Downloads folder.`,
        );
      })
      .catch(error => {
        console.error(error);
        Alert.alert(
          'Download Error',
          'An error occurred while downloading the file.',
        );
      });
  };

  // Map dữ liệu fetch được sang định dạng sections
  const assignments = courseElements
    .filter(el => el.name.toLowerCase().includes('assignment'))
    .map((item, index) => ({
      id: item.id,
      number: `0${index + 1}`,
      title: item.name,
      linkFile: item.description,
      rightIcon: ViewIcon,
      detailNavigation: 'AssignmentDetailScreen', // Điều hướng đến trang của học sinh
      onAction: () => {
        console.log('Navigate to AssignmentDetailScreen with ID:', item.id);
      },
    }));

  const practicalExams = courseElements
    .filter(
      el =>
        el.name.toLowerCase().includes('pe') ||
        el.name.toLowerCase().includes('exam'),
    )
    .map((item, index) => ({
      id: item.id,
      number: `0${index + 1}`,
      title: item.name,
      linkFile: item.description,
      rightIcon: ViewIcon,
      detailNavigation: 'AssignmentDetailScreen',
      onAction: () => {
        console.log('Navigate to PracticalExamDetailScreen with ID:', item.id);
      },
    }));

  const sections = [
    { title: 'Assignments', data: assignments },
    { title: 'PE', data: practicalExams },
  ];

  if (isLoading) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </AppSafeView>
    );
  }

  return (
    <AppSafeView style={styles.container}>
      <ScreenHeader title="Curriculum" />
      {courseElements.length > 0 ? (
        <CurriculumList
          sections={sections.filter(sec => sec.data.length > 0)}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <AppText style={styles.emptyText}>
            No curriculum elements found for this class.
          </AppText>
        </View>
      )}
    </AppSafeView>
  );
};

export default CurriculumScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  emptyText: {
    textAlign: 'center',
    color: AppColors.n500,
  },
});
