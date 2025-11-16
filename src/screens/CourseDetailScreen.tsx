import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { ClassData, fetchClassById } from '../api/class';
import {
  LecturerIcon,
  NavigationIcon,
  SemesterIcon
} from '../assets/icons/courses';
import { QuestionMarkIcon } from '../assets/icons/input-icon';
import AppButton from '../components/buttons/AppButton';
import CourseCardItem from '../components/courses/CourseCardItem';
import CustomModal from '../components/modals/CustomModal';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { navigationList } from '../data/coursesData';
import { AppColors } from '../styles/color';

const CourseDetailScreen = () => {
  const [unEnrollModalVisible, setUnEnrollModalVisible] =
    useState<boolean>(false);
  const navigation = useNavigation<any>();
  const route = useRoute(); // Get route object
  const classId = (route.params as { classId?: string })?.classId; // Get classId

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [cardHeight, setCardHeight] = useState(0);

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
        const data = await fetchClassById(classId); // Call API
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

  const handleUnEnrollCourse = () => {
    setUnEnrollModalVisible(false);
  };

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
      <View 
        style={styles.classInfoContainer}
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          setCardHeight(height);
        }}
      >
        <View
          style={{
            padding: s(20),
            paddingBottom: vs(10),
          }}
        >
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
          <View
            style={[
              styles.infoButton,
              {
                backgroundColor: '#F5F9FF',
              },
            ]}
          >
            <AppText style={{ color: '#202244' }} variant="body14pxBold">
              {classData.courseCode}
            </AppText>
          </View>
          <View
            style={[
              styles.infoButton,
              {
                backgroundColor: '',
                alignItems: 'center', // Added for centering
                justifyContent: 'center', // Added for centering
              },
            ]}
          >
            <AppText
              style={{ color: '#202244', textAlign: 'center' }}
              variant="body14pxBold"
            >
              {classData.courseName}
            </AppText>
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <AppText style={styles.descriptionText} numberOfLines={undefined}>
            {classData.description ||
              'No description available for this class.'}
          </AppText>
        </View>
      </View>
      <View
        style={{
          marginTop: cardHeight > 0 ? vs(20) + cardHeight - vs(50) : vs(200),
          width: s(300),
          alignSelf: 'center',
          paddingBottom: vs(50),
        }}
      >
        {navigationList.map(item => (
          <View
            key={item.id}
            style={{
              marginBottom: vs(10),
            }}
          >
            <CourseCardItem
              title={item.title}
              leftIcon={<item.leftIcon />}
              backGroundColor={item.backGroundColor}
              rightIcon={<NavigationIcon color={item.rightIconColor} />}
              onPress={() => {
                if (item.linkTo && classData && classData.id) {
                  navigation.navigate(item.linkTo as never, {
                    classId: classData.id,
                    semesterCourseId: classData.semesterCourseId,
                  });
                }
              }}
            />
          </View>
        ))}
      </View>

      <CustomModal
        visible={unEnrollModalVisible}
        onClose={() => setUnEnrollModalVisible(false)}
        title="Are You Sure?"
        description={`Do you want to leave ${classData.courseName} by ${classData.lecturerName}?`}
        icon={<QuestionMarkIcon />}
        disableScrollView={true}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: s(10),
            justifyContent: 'center',
          }}
        >
          <AppButton
            size="small"
            title="Yes"
            onPress={handleUnEnrollCourse}
            style={{ minWidth: 'auto', width: s(80) }} // Use 'auto'
            variant="danger" // Make 'Yes' the danger action
            textColor={AppColors.errorColor}
          />
          <AppButton
            size="small"
            title="Cancel"
            variant="primary" // Make 'Cancel' primary
            onPress={() => setUnEnrollModalVisible(false)}
            style={{
              minWidth: 'auto', // Use 'auto'
              width: s(90),
            }}
          />
        </View>
      </CustomModal>
    </ScrollView>
  );
};

export default CourseDetailScreen;

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
    height: vs(150), // Adjust height
  },
  classInfoContainer: {
    position: 'absolute',
    top: vs(100),
    width: s(300),
    minHeight: vs(200),
    borderRadius: s(30),
    backgroundColor: AppColors.white,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  courseUnEnrollIcon: {
    position: 'absolute',
    top: s(-30),
    right: s(0),
    zIndex: 1,
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
    paddingBottom: vs(20),
  },
  descriptionText: {
    lineHeight: vs(22),
  },
});