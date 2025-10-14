import React from 'react';
import { StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import AppSafeView from '../components/views/AppSafeView';
import { AssignmentList, PEList, SyllabusList } from '../data/coursesData';
import ReactNativeBlobUtil from 'react-native-blob-util';

const CurriculumScreen = () => {
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
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

  // 4. Gắn hàm download vào dữ liệu SyllabusList
  const syllabusWithActions = SyllabusList.map(item => ({
    ...item,
    // Ghi đè hàm onAction để gọi handleDownload
    onAction: () => handleDownload(item.linkFile, item.linkFile),
  }));

  // 5. Sử dụng dữ liệu đã được cập nhật
  const sections = [
    { title: 'Slides', data: syllabusWithActions },
    { title: 'Assignments', data: AssignmentList },
    { title: 'PE', data: PEList },
  ];

  return (
    <AppSafeView>
      <ScreenHeader title="Curriculum" />
      <CurriculumList sections={sections} scrollEnabled={true} />
    </AppSafeView>
  );
};

export default CurriculumScreen;

const styles = StyleSheet.create({});
