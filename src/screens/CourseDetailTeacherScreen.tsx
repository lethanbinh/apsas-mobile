import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { ClassData, fetchClassById } from '../api/class';
import {
  CurriculumIcon,
  ExcelIcon, // Import for navigation data
  ExportExcelIcon,
  LecturerIcon,
  NavigationIcon, // Import for navigation data
  ParticipantsIcon,
  SemesterIcon,
} from '../assets/icons/courses';
import CourseCardItem from '../components/courses/CourseCardItem';
import AppText from '../components/texts/AppText';
import { showErrorToast, showSuccessToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import ReadMoreText from '../components/common/ReadMoreText';
import CustomModal from '../components/modals/CustomModal';
import AppButton from '../components/buttons/AppButton';
import { Checkbox } from 'react-native-paper';
import { useGetCurrentLecturerId } from '../hooks/useGetCurrentLecturerId';
import { exportLecturerReport, ExportTypes } from '../utils/exportReportHelper';
import { getGradingGroups } from '../api/gradingGroupService';

const CourseDetailTeacherScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const classId = (route.params as { classId?: string })?.classId;
  const { lecturerId } = useGetCurrentLecturerId();

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);
  const [exportTypes, setExportTypes] = useState<ExportTypes>({
    assignment: true,
    lab: true,
    practicalExam: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [gradingGroups, setGradingGroups] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    if (!classId) {
      if (isMounted) {
        showErrorToast('Error', 'No Class ID provided.');
        setIsLoading(false);
      }
      return;
    }
    const loadClassDetails = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        const data = await fetchClassById(classId);
        if (!isMounted) return;
        setClassData(data);
      } catch (error: any) {
        console.error(error);
        if (isMounted) {
          showErrorToast('Error', 'Failed to load class details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadClassDetails();

    return () => {
      setIsMounted(false);
    };
  }, [classId]);

  // Fetch grading groups for lecturer
  useEffect(() => {
    const fetchGradingGroups = async () => {
      if (lecturerId) {
        try {
          const groups = await getGradingGroups({ lecturerId });
          setGradingGroups(groups);
        } catch (err) {
          console.error('Failed to fetch grading groups:', err);
        }
      }
    };
    fetchGradingGroups();
  }, [lecturerId]);

  // Define teacherNavigation inside the component to access classData
  const teacherNavigation = [
    {
      id: 1,
      title: 'Curriculum',
      leftIcon: CurriculumIcon,
      backGroundColor: AppColors.b100,
      rightIconColor: AppColors.b500,
      linkTo: 'CurriculumTeacherScreen',
      // Pass semesterCourseId as a param
      params: { semesterCourseId: classData?.semesterCourseId },
    },
    {
      id: 2,
      title: 'Members',
      leftIcon: ParticipantsIcon,
      backGroundColor: AppColors.pur100,
      rightIconColor: AppColors.pur500,
      linkTo: 'MembersScreen',
      params: { classId: classData?.id }, // Pass classId
    },
    {
      id: 3,
      title: 'Practical Exams',
      leftIcon: CurriculumIcon,
      backGroundColor: AppColors.b100,
      rightIconColor: AppColors.b500,
      linkTo: 'PracticalExamListScreen',
      params: { classId: classData?.id },
    },
    {
      id: 4,
      title: 'Export grade report',
      leftIcon: ExcelIcon,
      rightIcon: ExportExcelIcon,
      backGroundColor: AppColors.g100,
      rightIconColor: AppColors.g500,
      linkTo: undefined,
      params: { classId: classData?.id },
      onDownload: () => {
        setExportModalVisible(true);
      },
    },
  ];

  if (isLoading) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </AppSafeView>
    );
  }

  if (!classData) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <AppText>Failed to load class data.</AppText>
      </AppSafeView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        style={styles.image}
        source={require('../assets/images/classimage.png')}
      />
      <View style={styles.classInfoContainer}>
        <View style={styles.classInfoPadding}>
          <AppText
            style={{ color: AppColors.tagColor, marginBottom: vs(3) }}
            variant="label12pxBold"
          >
            {classData.courseCode}
          </AppText>
          <AppText variant="h4" style={{ marginBottom: vs(10) }}>
            {classData.courseName} - {classData.classCode}
          </AppText>
          <View style={styles.tagContainer}>
            <View style={styles.tagWrapper}>
              <SemesterIcon />
              <AppText
                style={{ color: '#202244', marginLeft: vs(5) }}
                variant="label12pxBold"
              >
                {classData.semesterName}
              </AppText>
            </View>
            <View style={styles.tagWrapper}>
              <LecturerIcon />
              <AppText
                style={{ color: '#202244', marginLeft: vs(5) }}
                variant="label12pxBold"
              >
                {classData.lecturerName}
              </AppText>
            </View>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={[styles.infoButton, { backgroundColor: '#F5F9FF' }]}>
            <AppText style={{ color: '#202244' }} variant="body14pxBold">
              {classData.courseCode}
            </AppText>
          </View>
          <View style={[styles.infoButton, { backgroundColor: '' }]}>
            <AppText
              style={{ color: '#202244', textAlign: 'center' }}
              variant="body14pxBold"
            >
              {classData.courseName}
            </AppText>
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <ReadMoreText
            text={classData.description || 'No description available for this class.'}
            numberOfLines={1}
            textStyle={styles.descriptionText}
          />
        </View>
      </View>
      <View style={styles.navigationWrapper}>
        {teacherNavigation.map(item => (
          <View key={item.id} style={styles.navigationButton}>
            <CourseCardItem
              title={item.title}
              leftIcon={<item.leftIcon />}
              backGroundColor={item.backGroundColor}
              rightIcon={
                item.rightIcon ? (
                  item.rightIcon({ color: item.rightIconColor })
                ) : (
                  <NavigationIcon color={item.rightIconColor} />
                )
              }
              onPress={() => {
                if (item.onDownload) {
                  item.onDownload();
                } else if (item.linkTo) {
                  navigation.navigate(item.linkTo, item.params); // Pass params here
                }
              }}
            />
          </View>
        ))}
      </View>

      {/* Export Report Modal */}
      <CustomModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        title="Select Export Types"
        description="Choose which types of assessments to include in the report"
        disableScrollView={true}
      >
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setExportTypes({ ...exportTypes, assignment: !exportTypes.assignment })}
          >
            <Checkbox
              status={exportTypes.assignment ? 'checked' : 'unchecked'}
              onPress={() => setExportTypes({ ...exportTypes, assignment: !exportTypes.assignment })}
              color={AppColors.pr500}
            />
            <AppText variant="body14pxRegular" style={styles.checkboxLabel}>
              Assignment
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setExportTypes({ ...exportTypes, lab: !exportTypes.lab })}
          >
            <Checkbox
              status={exportTypes.lab ? 'checked' : 'unchecked'}
              onPress={() => setExportTypes({ ...exportTypes, lab: !exportTypes.lab })}
              color={AppColors.pr500}
            />
            <AppText variant="body14pxRegular" style={styles.checkboxLabel}>
              Lab
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setExportTypes({ ...exportTypes, practicalExam: !exportTypes.practicalExam })}
          >
            <Checkbox
              status={exportTypes.practicalExam ? 'checked' : 'unchecked'}
              onPress={() => setExportTypes({ ...exportTypes, practicalExam: !exportTypes.practicalExam })}
              color={AppColors.pr500}
            />
            <AppText variant="body14pxRegular" style={styles.checkboxLabel}>
              Practical Exam
            </AppText>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            gap: s(10),
            justifyContent: 'center',
            marginTop: vs(20),
          }}
        >
          <AppButton
            size="small"
            title={isExporting ? 'Exporting...' : 'Export'}
            onPress={async () => {
              // Check if at least one type is selected
              if (!exportTypes.assignment && !exportTypes.lab && !exportTypes.practicalExam) {
                showErrorToast('Error', 'Please select at least one type to export');
                return;
              }

              if (!classId) {
                showErrorToast('Error', 'Class ID not found');
                return;
              }

              setIsExporting(true);
              setExportModalVisible(false);

              try {
                await exportLecturerReport(classId, exportTypes, gradingGroups);
                showSuccessToast('Success', 'Full grade report exported successfully');
              } catch (error: any) {
                console.error('Export error:', error);
                showErrorToast('Error', error.message || 'Export failed. Please try again.');
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={isExporting}
            style={{ minWidth: 'auto', width: s(100) }}
          />
          <AppButton
            size="small"
            title="Cancel"
            variant="secondary"
            onPress={() => setExportModalVisible(false)}
            style={{
              minWidth: 'auto',
              width: s(100),
            }}
          />
        </View>
      </CustomModal>
    </ScrollView>
  );
};

export default CourseDetailTeacherScreen;

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
  image: {
    width: '100%',
    height: vs(150),
  },
  classInfoContainer: {
    position: 'absolute',
    top: vs(100),
    width: s(300),
    borderRadius: s(30),
    backgroundColor: AppColors.white,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  classInfoPadding: {
    padding: s(20),
    paddingBottom: vs(10),
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: s(15),
  },
  infoContainer: {
    height: vs(50),
    flexDirection: 'row',
  },
  infoButton: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    padding: s(20),
    paddingTop: vs(10),
  },
  descriptionText: {
    fontSize: s(14),
    lineHeight: vs(22),
    color: AppColors.n900,
  },
  navigationWrapper: {
    marginTop: vs(200),
    width: s(300),
    alignSelf: 'center',
  },
  navigationButton: {
    marginBottom: vs(10),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(10),
  },
  checkboxContainer: {
    marginTop: vs(10),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  checkboxLabel: {
    marginLeft: s(8),
  },
});
