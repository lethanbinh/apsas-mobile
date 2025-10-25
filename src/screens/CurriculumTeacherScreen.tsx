import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import AppSafeView from '../components/views/AppSafeView';
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useRoute
import ReactNativeBlobUtil from 'react-native-blob-util';
import { CourseElementData, fetchCourseElements } from '../api/semester'; // Import API
import { ViewIcon } from '../assets/icons/courses'; // Import ViewIcon
import AppText from '../components/texts/AppText'; // Import AppText
import {
  showErrorToast
} from '../components/toasts/AppToast'; // Import toasts
import { AppColors } from '../styles/color'; // Import AppColors

const CurriculumTeacherScreen = () => {
  const route = useRoute();
  const semesterCourseId = (route.params as { semesterCourseId?: string })
    ?.semesterCourseId;

  const [isLoading, setIsLoading] = useState(true);
  const [courseElements, setCourseElements] = useState<CourseElementData[]>([]);
  const navigation = useNavigation<any>(); // Khởi tạo navigation

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

    // Use a placeholder URL until API provides real file URLs
    const sampleFileUrl =
      fileUrl ||
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const { dirs } = ReactNativeBlobUtil.fs;
    const dirToSave =
      Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
    const finalFileName = fileName || 'downloaded_file.pdf';

    const config = {
      fileCache: true,
      path: `${dirToSave}/${finalFileName}`,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: `${dirToSave}/${finalFileName}`,
        description: 'Downloading file.',
      },
    };

    Alert.alert('Starting Download', `Downloading ${finalFileName}...`);

    ReactNativeBlobUtil.config(config)
      .fetch('GET', sampleFileUrl)
      .then(res => {
        if (Platform.OS === 'ios') {
          ReactNativeBlobUtil.ios.previewDocument(res.path());
        }
        Alert.alert(
          'Download Complete',
          `${finalFileName} has been saved to your Downloads folder.`,
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

  const assignments = courseElements
    .filter(el => el.name.toLowerCase().includes('assignment'))
    .map((item, index) => ({
      id: item.id,
      number: `0${index + 1}`,
      title: item.name,
      linkFile: item.description,
      rightIcon: ViewIcon,
      onAction: () => {
        navigation.navigate('AssignmentDetailTeacherScreen', {
          elementId: item.id,
        });
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
      onAction: () => {
        navigation.navigate('PracticalExamDetailScreen', {
          elementId: item.id,
        });
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
    <AppSafeView>
      <ScreenHeader title="Curriculum" />
      {courseElements.length > 0 ? (
        <CurriculumList
          sections={sections.filter(sec => sec.data.length > 0)} // Only show sections with data
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

export default CurriculumTeacherScreen;

const styles = StyleSheet.create({
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
