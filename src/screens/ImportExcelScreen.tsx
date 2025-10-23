import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  PermissionsAndroid,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import {
  CurriculumIcon,
  DownloadIcon,
  ViewIcon,
} from '../assets/icons/courses';
import { NavigationLarge } from '../assets/icons/icon';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import CourseCardItem from '../components/courses/CourseCardItem';
import SubmissionFileSection from '../components/score/SubmissionFileSection';
import SubmissionItem from '../components/score/SubmissionItem';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { useNavigation } from '@react-navigation/native';
import RNBlobUtil from 'react-native-blob-util';
import {
  showErrorToast,
  showSuccessToast,
} from '../components/toasts/AppToast';
import * as XLSX from 'xlsx';
import { importSemesterCourse, importClassStudentData } from '../api/import'; // Import new API functions

type FileInfo = {
  name: string;
  uri: string;
  type: string;
} | null;

const TEMPLATE_KEYS = {
  SEMESTER_COURSE: 'semesterCourse',
  CLASS_TEMPLATE: 'classTemplate',
};

const TEMPLATE_FILES = [
  {
    name: 'Semester Course Data.xlsx',
    url: 'https://aspas-edu.site/api/Import/excel/template',
    key: TEMPLATE_KEYS.SEMESTER_COURSE,
    icon: <CurriculumIcon />,
    color: AppColors.b100,
  },
  {
    name: 'Class Template.xlsx',
    url: 'https://aspas-edu.site/api/Import/excel/class-student-template',
    key: TEMPLATE_KEYS.CLASS_TEMPLATE,
    icon: <CurriculumIcon />,
    color: AppColors.b100,
  },
];

const ImportExcelScreen = () => {
  const navigation = useNavigation<any>();
  const [submittedFiles, setSubmittedFiles] = useState<{
    [key: string]: FileInfo;
  }>({
    [TEMPLATE_KEYS.SEMESTER_COURSE]: null,
    [TEMPLATE_KEYS.CLASS_TEMPLATE]: null,
  });
  const [parsedData, setParsedData] = useState<{ [key: string]: any | null }>({
    [TEMPLATE_KEYS.SEMESTER_COURSE]: null,
    [TEMPLATE_KEYS.CLASS_TEMPLATE]: null,
  });
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [parsing, setParsing] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

  const readAndParseExcel = async (file: FileInfo, key: string) => {
    if (!file) {
      setParsedData(prev => ({ ...prev, [key]: null }));
      return;
    }
    setParsing(prev => ({ ...prev, [key]: true }));
    try {
      const base64Data = await RNBlobUtil.fs.readFile(file.uri, 'base64');
      const workbook = XLSX.read(base64Data, { type: 'base64' });
      const sheetsData: { [key: string]: any[] } = {};
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          const dataRows = jsonData.slice(1);
          const formattedData = dataRows.map(rowArray => {
            let obj: { [key: string]: any } = {};
            headers.forEach((header, index) => {
              obj[header] = (rowArray as any[])[index];
            });
            return obj;
          });
          sheetsData[sheetName] = formattedData;
        } else {
          sheetsData[sheetName] = [];
        }
      });
      setParsedData(prev => ({ ...prev, [key]: sheetsData }));
      showSuccessToast('File Ready', `${file.name} parsed successfully.`);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      showErrorToast('Parse Error', `Could not read ${file.name}.`);
      setSubmittedFiles(prev => ({ ...prev, [key]: null }));
    } finally {
      setParsing(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleFilePicked = (file: FileInfo, key: string) => {
    setSubmittedFiles(prev => ({ ...prev, [key]: file }));
    readAndParseExcel(file, key);
  };

  const handleSubmit = async () => {
    const file1 = submittedFiles[TEMPLATE_KEYS.SEMESTER_COURSE];
    const file2 = submittedFiles[TEMPLATE_KEYS.CLASS_TEMPLATE];

    if (!file1 || !file2) {
      showErrorToast('Error', 'Please upload both required template files.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload files sequentially
      showSuccessToast('Uploading...', 'Uploading Semester Course file...');
      const response1 = await importSemesterCourse(file1);

      showSuccessToast('Uploading...', 'Uploading Class Template file...');
      const response2 = await importClassStudentData(file2);

      // Both successful
      showSuccessToast(
        'Publish Successful',
        'Semester plan published successfully.',
      );
      // Reset state
      setSubmittedFiles({
        [TEMPLATE_KEYS.SEMESTER_COURSE]: null,
        [TEMPLATE_KEYS.CLASS_TEMPLATE]: null,
      });
      setParsedData({
        [TEMPLATE_KEYS.SEMESTER_COURSE]: null,
        [TEMPLATE_KEYS.CLASS_TEMPLATE]: null,
      });
      // Optionally navigate away
      // navigation.goBack();
    } catch (error: any) {
      showErrorToast(
        'Publish Failed',
        error.message || 'An error occurred during upload.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message:
            'App needs access to your storage to download the template file.',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleDownloadTemplate = async (template: {
    name: string;
    url: string;
    key: string;
  }) => {
    setDownloading(prev => ({ ...prev, [template.key]: true }));
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        showErrorToast(
          'Permission Denied',
          'Storage permission is required to download.',
        );
        setDownloading(prev => ({ ...prev, [template.key]: false }));
        return;
      }
      const { dirs } = RNBlobUtil.fs;
      const path = `${dirs.DownloadDir}/${template.name}`;

      RNBlobUtil.config({
        fileCache: true,
        path: path,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: template.name,
          description: 'Downloading template file...',
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          path: path,
          mediaScannable: true,
        },
      })
        .fetch('GET', template.url)
        .then(res => {
          showSuccessToast(
            'Download Complete',
            `${template.name} saved to Downloads folder.`,
          );
          setDownloading(prev => ({ ...prev, [template.key]: false }));
        })
        .catch(error => {
          console.error('Download error:', error);
          showErrorToast(
            'Download Failed',
            `Could not download ${template.name}.`,
          );
          setDownloading(prev => ({ ...prev, [template.key]: false }));
        });
    } catch (error: any) {
      showErrorToast('Error', error.message || 'An error occurred.');
      setDownloading(prev => ({ ...prev, [template.key]: false }));
    }
  };

  const isAnyDownloading = Object.values(downloading).some(Boolean);
  const isAnyParsing = Object.values(parsing).some(Boolean);
  const canPreview =
    parsedData[TEMPLATE_KEYS.SEMESTER_COURSE] &&
    parsedData[TEMPLATE_KEYS.CLASS_TEMPLATE];
  const canPublish =
    submittedFiles[TEMPLATE_KEYS.SEMESTER_COURSE] &&
    submittedFiles[TEMPLATE_KEYS.CLASS_TEMPLATE];

  return (
    <AppSafeView>
      <ScreenHeader title="Import Excel" />
      <ScrollView contentContainerStyle={styles.container}>
        {TEMPLATE_FILES.map(template => (
          <CourseCardItem
            key={template.key}
            title={template.name}
            leftIcon={template.icon}
            backGroundColor={template.color}
            rightIcon={
              downloading[template.key] ? (
                <ActivityIndicator color={AppColors.b500} />
              ) : (
                <DownloadIcon color={AppColors.b500} />
              )
            }
            onPress={() => handleDownloadTemplate(template)}
            style={{ marginBottom: vs(15) }}
          />
        ))}

        <AppButton
          title="Preview"
          style={{
            marginTop: vs(5),
            minWidth: 0,
            width: s(120),
            alignSelf: 'flex-start',
          }}
          size="small"
          leftIcon={<ViewIcon color={AppColors.black} />}
          textColor={AppColors.black}
          variant="secondary"
          disabled={!canPreview || isAnyParsing}
          loading={isAnyParsing}
          onPress={() => {
            navigation.navigate('PreviewDataScreen' as never, {
              excelData: parsedData,
            });
          }}
        />

        <View style={{ marginVertical: s(20) }}>
          {submittedFiles[TEMPLATE_KEYS.SEMESTER_COURSE] && (
            <SubmissionItem
              fileName={submittedFiles[TEMPLATE_KEYS.SEMESTER_COURSE]!.name}
              title="Semester Course Data File"
              onRemove={() =>
                handleFilePicked(null, TEMPLATE_KEYS.SEMESTER_COURSE)
              }
            />
          )}
          {submittedFiles[TEMPLATE_KEYS.CLASS_TEMPLATE] && (
            <View style={{ marginTop: vs(10) }}>
              <SubmissionItem
                fileName={submittedFiles[TEMPLATE_KEYS.CLASS_TEMPLATE]!.name}
                title="Class Template File"
                onRemove={() =>
                  handleFilePicked(null, TEMPLATE_KEYS.CLASS_TEMPLATE)
                }
              />
            </View>
          )}
        </View>

        <SubmissionFileSection
          title="Add Semester Course File"
          fileType="excel"
          onFilePicked={file =>
            handleFilePicked(file, TEMPLATE_KEYS.SEMESTER_COURSE)
          }
        />
        <View style={{ marginTop: vs(20) }}>
          <SubmissionFileSection
            title="Add Class Template File"
            fileType="excel"
            onFilePicked={file =>
              handleFilePicked(file, TEMPLATE_KEYS.CLASS_TEMPLATE)
            }
          />
        </View>

        <View>
          <AppButton
            style={{
              marginTop: s(30),
              borderRadius: s(30),
              height: s(50),
            }}
            title="Publish Plan"
            onPress={handleSubmit}
            textVariant="body16pxBold"
            disabled={
              !canPublish || isAnyDownloading || isAnyParsing || isSubmitting
            } // Disable during submit
            loading={isSubmitting} // Show loading on submit
          />
          <View
            style={{
              alignItems: 'center',
              backgroundColor: AppColors.white,
              position: 'absolute',
              top: s(38),
              right: s(10),
              padding: s(10),
              borderRadius: s(25),
            }}
          >
            <NavigationLarge />
          </View>
        </View>
      </ScrollView>
    </AppSafeView>
  );
};

export default ImportExcelScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(25),
    paddingVertical: s(20),
  },
});
