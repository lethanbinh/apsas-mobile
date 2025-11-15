import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {
  CourseElementData,
  fetchCourseElements,
} from '../api/courseElementService';
import { ViewIcon } from '../assets/icons/courses';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

const CurriculumScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const semesterCourseId = (route.params as { semesterCourseId?: string })
    ?.semesterCourseId;
  const classId = (route.params as { classId?: string | number })?.classId;

  const [isLoading, setIsLoading] = useState(true);
  const [courseElements, setCourseElements] = useState<CourseElementData[]>([]);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (!semesterCourseId) {
      if (isMounted) {
        showErrorToast('Error', 'No Semester Course ID provided.');
        setIsLoading(false);
      }
      return;
    }

    const loadElements = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        const allElements = await fetchCourseElements();
        if (!isMounted) return;

        const relevantElements = (allElements || []).filter(
          el => el && el.semesterCourseId && el.semesterCourseId.toString() === semesterCourseId,
        );
        if (!isMounted) return;
        setCourseElements(relevantElements);
      } catch (error: any) {
        console.error(error);
        if (isMounted) {
          showErrorToast('Error', 'Failed to load curriculum elements.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadElements();
    return () => {
      setIsMounted(false);
    };
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
  const assignments = courseElements
    .filter(
      el =>
        el &&
        el.id &&
        el.name &&
        typeof el.name === 'string' &&
        !el.name.toLowerCase().includes('pe') &&
        !el.name.toLowerCase().includes('exam'),
    )
    .map((item, index) => {
      try {
        return {
          id: item.id,
          number: `0${index + 1}`,
          title: item.name || 'Untitled',
          linkFile: item.description || '',
          rightIcon: ViewIcon,
          detailNavigation: 'AssignmentDetailScreen',
          onAction: () => {
            if (item.id) {
              navigation.navigate('AssignmentDetailScreen', {
                elementId: item.id,
                classId: classId,
              });
            }
          },
        };
      } catch (err) {
        console.error('Error mapping assignment:', err);
        return null;
      }
    })
    .filter((item): item is any => item !== null);

  const practicalExams = courseElements
    .filter(
      el =>
        el &&
        el.id &&
        el.name &&
        typeof el.name === 'string' &&
        (el.name.toLowerCase().includes('pe') ||
        el.name.toLowerCase().includes('exam')),
    )
    .map((item, index) => {
      try {
        return {
          id: item.id,
          number: `0${index + 1}`,
          title: item.name || 'Untitled',
          linkFile: item.description || '',
          rightIcon: ViewIcon,
          detailNavigation: 'AssignmentDetailScreen',
          onAction: () => {
            if (item.id) {
              navigation.navigate('AssignmentDetailScreen', {
                elementId: item.id,
                classId: classId,
              });
            }
          },
        };
      } catch (err) {
        console.error('Error mapping practical exam:', err);
        return null;
      }
    })
    .filter((item): item is any => item !== null);

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
