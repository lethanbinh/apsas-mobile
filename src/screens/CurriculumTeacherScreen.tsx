import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Platform, Alert } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import AppSafeView from '../components/views/AppSafeView';
import {
  CourseElementData,
  fetchCourseElements,
} from '../api/courseElementService';
import { ViewIcon } from '../assets/icons/courses';
import AppText from '../components/texts/AppText';
import { showErrorToast, showSuccessToast } from '../components/toasts/AppToast';
import { AppColors } from '../styles/color';

const CurriculumTeacherScreen = () => {
  const route = useRoute();
  // Giữ semesterCourseId là string vì nó đến từ route params
  const semesterCourseId = (route.params as { semesterCourseId?: string })
    ?.semesterCourseId;

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  // SỬA STATE TYPE: Dùng interface mới
  const [courseElements, setCourseElements] = useState<CourseElementData[]>([]);
  const navigation = useNavigation<any>();

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

        // SỬA FILTER LOGIC: So sánh number với Number(string)
        const relevantElements = (allElements || []).filter(
          el => el && el.semesterCourseId === Number(semesterCourseId),
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

  // SỬA MAP LOGIC:
  const assignments = courseElements
    .filter(
      el =>
        el &&
        el.name &&
        !el.name.toLowerCase().includes('pe') &&
        !el.name.toLowerCase().includes('exam'),
    )
    .map((item, index) => ({
      id: String(item.id), // Chuyển sang string nếu CurriculumList cần
      number: `0${index + 1}`,
      title: item.name || 'Untitled',
      // LƯU Ý: linkFile lấy từ description có thể không đúng với API mới
      linkFile: item.description || '',
      rightIcon: ViewIcon,
      onAction: () => {
        if (item.id) {
          navigation.navigate('AssignmentDetailTeacherScreen', {
            elementId: item.id, // Truyền number ID
          });
        }
      },
    }));

  const practicalExams = courseElements
    .filter(
      el =>
        el &&
        el.name &&
        (el.name.toLowerCase().includes('pe') ||
        el.name.toLowerCase().includes('exam')), // Bao gồm cả exam
    )
    .map((item, index) => ({
      id: String(item.id), // Chuyển sang string nếu CurriculumList cần
      number: `0${index + 1}`,
      title: item.name || 'Untitled',
      // LƯU Ý: linkFile lấy từ description có thể không đúng với API mới
      linkFile: item.description || '',
      rightIcon: ViewIcon,
      onAction: () => {
        if (item.id) {
          navigation.navigate('PracticalExamDetailScreen', {
            elementId: item.id, // Truyền number ID
          });
        }
      },
    }));

  // Phần còn lại của component (sections, isLoading, return JSX) giữ nguyên
  const sections = [
    { title: 'Assignments', data: assignments },
    { title: 'PE & Exams', data: practicalExams }, // Đổi title nếu muốn
  ];

  const handleDownloadAllMaterials = async () => {
    const allItems = [...assignments, ...practicalExams];
    
    if (allItems.length === 0) {
      showErrorToast('Error', 'No materials to download.');
      return;
    }

    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        showErrorToast('Permission Denied', 'Storage permission is required to download.');
        return;
      }

      Alert.alert(
        'Download All Materials',
        `Download ${allItems.length} material file(s)?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                const { dirs } = RNBlobUtil.fs;
                const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
                const sampleFileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

                for (const item of allItems) {
                  const fileName = `${item.title.replace(/[^a-z0-9]/gi, '_')}.pdf` || `material_${item.id}.pdf`;
                  const path = `${dirToSave}/${fileName}`;

                  await RNBlobUtil.config({
                    fileCache: true,
                    path: path,
                    addAndroidDownloads: {
                      useDownloadManager: true,
                      notification: true,
                      title: fileName,
                      description: 'Downloading material file...',
                      mime: 'application/pdf',
                      path: path,
                      mediaScannable: true,
                    },
                  }).fetch('GET', sampleFileUrl);

                  if (Platform.OS === 'android') {
                    await RNBlobUtil.android.addCompleteDownload({
                      title: fileName,
                      description: 'Download complete',
                      mime: 'application/pdf',
                      path: path,
                      showNotification: true,
                    });
                  }
                }
                showSuccessToast('Success', 'All materials downloaded successfully.');
              } catch (error: any) {
                console.error('Download error:', error);
                showErrorToast('Error', 'Failed to download some materials.');
              }
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('Download error:', error);
      showErrorToast('Error', 'Failed to download materials.');
    }
  };

  if (isLoading) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.pr500} />
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader title="Curriculum" />
      {courseElements.length > 0 ? (
        <CurriculumList
          sections={sections.filter(sec => sec.data.length > 0)}
          scrollEnabled={true}
          buttonText="Download All Materials"
          onDownloadAll={handleDownloadAllMaterials}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <AppText style={styles.emptyText}>
            No curriculum elements found for this course.
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
