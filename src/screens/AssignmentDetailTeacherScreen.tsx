import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AssignmentCardInfo from '../components/courses/AssignmentCardInfo';
import CurriculumList from '../components/courses/CurriculumList';
import { DocumentList, SubmissionList } from '../data/coursesData';
import { AppColors } from '../styles/color';
import AppSafeView from '../components/views/AppSafeView'; // Import AppSafeView
import ScreenHeader from '../components/common/ScreenHeader'; // Import ScreenHeader
import { showErrorToast } from '../components/toasts/AppToast'; // Import toast
import { useSelector } from 'react-redux'; // Import useSelector
import { RootState } from '../store/store'; // Import RootState
import AppText from '../components/texts/AppText'; // Import AppText
import { CourseElementData, fetchCourseElementById } from '../api/courseElementService';

const sections = [
  { title: 'Documents', data: DocumentList },
  { title: 'Submissions', data: SubmissionList },
];

const AssignmentDetailTeacherScreen = () => {
  const [listHeight, setListHeight] = useState(0);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const elementId = (route.params as { elementId?: string })?.elementId;
  console.log('Element ID:', elementId);
  const [elementData, setElementData] = useState<CourseElementData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const userProfile = useSelector(
    (state: RootState) => state.userSlice.profile,
  );

  useEffect(() => {
    if (!elementId) {
      showErrorToast('Error', 'No Assignment ID provided.');
      setIsLoading(false);
      return;
    }
    const loadElementDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCourseElementById(elementId);
        setElementData(data);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load assignment details.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadElementDetails();
  }, [elementId]);

  if (isLoading) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </AppSafeView>
    );
  }

  if (!elementData) {
    return (
      <AppSafeView style={styles.loadingContainer}>
        <ScreenHeader title="Assignment Detail" />
        <AppText style={styles.errorText}>
          Failed to load assignment data.
        </AppText>
      </AppSafeView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        nestedScrollEnabled
        contentContainerStyle={{ paddingBottom: listHeight }}
      >
        <Image
          style={styles.image}
          source={require('../assets/images/assignment.png')}
        />
        <AssignmentCardInfo
          assignmentType="Assignment" // Có thể thay đổi nếu API có
          assignmentTitle={elementData.name}
          dueDate="N/A" // Cần thêm endDate nếu API có
          lecturerName={userProfile?.name || 'Lecturer'}
          description={elementData.description}
          isSubmitted={false} // Logic này có thể cần thay đổi
          onSubmitPress={() => {
            navigation.navigate('SubmissionScreen');
          }}
          isAssessment={true}
          onDashboardPress={() => {
            navigation.navigate('DashboardTeacherScreen' as never);
          }}
        />
        <View />
        <View
          style={{ position: 'absolute', top: s(320), width: '100%' }}
          onLayout={e => setListHeight(e.nativeEvent.layout.height + s(100))}
        >
          <CurriculumList
            sections={sections}
            buttonText="Download All Submissions"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default AssignmentDetailTeacherScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  errorText: {
    color: AppColors.n500,
    marginTop: vs(20),
  },
  image: {
    width: '100%',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(10),
  },
  scoreItem: {
    width: '22%',
    height: vs(50),
    justifyContent: 'center',
    borderRadius: s(5),
    paddingLeft: s(8),
  },
});
