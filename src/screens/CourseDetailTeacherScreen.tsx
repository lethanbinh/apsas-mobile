import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { ClassData, fetchClassById } from '../api/class';
import {
  EnterIcon,
  LecturerIcon,
  NavigationIcon,
  SemesterIcon,
  CurriculumIcon, // Import for navigation data
  ParticipantsIcon, // Import for navigation data
  ExcelIcon, // Import for navigation data
  ExportExcelIcon, // Import for navigation data
} from '../assets/icons/courses';
import { SmallAppIcon } from '../assets/icons/icon';
import AppButton from '../components/buttons/AppButton';
import CourseCardItem from '../components/courses/CourseCardItem';
import AppTextInput from '../components/inputs/AppTextInput';
import CustomModal from '../components/modals/CustomModal';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
// Remove import { teacherNavigation } from '../data/coursesData';
import { AppColors } from '../styles/color';

const CourseDetailTeacherScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const classId = (route.params as { classId?: string })?.classId;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enterCode, setEnterCode] = useState('');
  const [enterCodeModal, setEnterCodeModal] = useState<boolean>(false);

  useEffect(() => {
    if (!classId) {
      showErrorToast('Error', 'No Class ID provided.');
      setIsLoading(false);
      return;
    }
    const loadClassDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchClassById(classId);
        setClassData(data);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load class details.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadClassDetails();
  }, [classId]);

  const handleSetEnterCode = () => {
    setEnterCodeModal(false);
  };

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
      title: 'Participants',
      leftIcon: ParticipantsIcon,
      backGroundColor: AppColors.pur100,
      rightIconColor: AppColors.pur500,
      linkTo: 'ParticipantsScreen',
      params: { classId: classData?.id }, // Pass classId
    },
    {
      id: 3,
      title: 'Export grade report',
      leftIcon: ExcelIcon,
      rightIcon: ExportExcelIcon,
      backGroundColor: AppColors.g100,
      rightIconColor: AppColors.g500,
      linkTo: 'GradingHistoryScreen', // Or handle download directly
      params: { classId: classData?.id },
      onDownload: () => {
        console.log('Download grade report');
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
          <AppText>
            {classData.description ||
              'No description available for this class.'}{' '}
          </AppText>
          <AppButton
            leftIcon={<EnterIcon />}
            textVariant="body12pxRegular"
            style={styles.enterCodeButton}
            size="small"
            onPress={() => setEnterCodeModal(true)}
            title="Set Enter code"
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

      <CustomModal
        visible={enterCodeModal}
        onClose={() => setEnterCodeModal(false)}
        title="Set Enter code"
        description="Enter 6-digits code for this class"
        icon={<SmallAppIcon />}
      >
        <AppTextInput
          placeholder="Enter class code"
          secureTextEntry
          label="Class code"
          value={enterCode}
          onChangeText={setEnterCode}
        />

        <View style={styles.buttonContainer}>
          <AppButton
            onPress={handleSetEnterCode}
            style={{ width: s(100), marginTop: vs(20) }}
            title="Save"
            size="small"
          />
          <AppButton
            onPress={() => setEnterCodeModal(false)}
            style={{ width: s(100), marginTop: vs(20) }}
            title="Cancel"
            size="small"
            variant="secondary"
            textColor={AppColors.black}
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
  },
  enterCodeButton: {
    width: s(130),
    alignSelf: 'flex-start',
    borderRadius: s(8),
    marginTop: vs(10),
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
});
