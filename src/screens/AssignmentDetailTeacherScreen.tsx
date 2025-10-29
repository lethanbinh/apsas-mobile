import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import {
  CourseElementData,
  fetchCourseElementById,
} from '../api/courseElementService';
import ScreenHeader from '../components/common/ScreenHeader';
import AssignmentCardInfo from '../components/courses/AssignmentCardInfo';
import CurriculumList from '../components/courses/CurriculumList';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { DocumentList, SubmissionList } from '../data/coursesData';
import { RootState } from '../store/store';
import { AppColors } from '../styles/color';
import {
  AssessmentTemplateData,
  fetchAssessmentTemplates,
} from '../api/assessmentTemplateService';

const AssignmentDetailTeacherScreen = () => {
  const [listHeight, setListHeight] = useState(0);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const elementId = (route.params as { elementId?: string })?.elementId;
  const [elementData, setElementData] = useState<CourseElementData | null>(
    null,
  );
  const [templateData, setTemplateData] =
    useState<AssessmentTemplateData | null>(null);
  const [dynamicDocumentList, setDynamicDocumentList] = useState(DocumentList);
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
        const templatesResponse = await fetchAssessmentTemplates({
          pageNumber: 1,
          pageSize: 1000,
        });
        const foundTemplate = templatesResponse.items.find(
          t => t.courseElementId === Number(elementId),
        );
        setTemplateData(foundTemplate || null);
        const navigateToRequirement = () => {
          if (foundTemplate) {
            navigation.navigate('RequirementTeacherScreen', {
              assessmentTemplate: foundTemplate,
            });
          } else {
            showErrorToast(
              'Error',
              'No requirement template found for this assignment.',
            );
          }
        };

        const updatedList = DocumentList.map(item => {
          if (item.title === 'Requirement') {
            return {
              ...item,
              onPress: navigateToRequirement,
            };
          }
          return item;
        });
        setDynamicDocumentList(updatedList);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load assignment details.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadElementDetails();
  }, [elementId, navigation]);

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

  const sections = [
    { title: 'Documents', data: dynamicDocumentList },
    { title: 'Submissions', data: SubmissionList },
  ];

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
          assignmentType="Assignment"
          assignmentTitle={elementData.name}
          dueDate="N/A"
          lecturerName={userProfile?.name || 'Lecturer'}
          description={elementData.description}
          isSubmitted={false}
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
            sections={sections} // Sử dụng sections động
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
