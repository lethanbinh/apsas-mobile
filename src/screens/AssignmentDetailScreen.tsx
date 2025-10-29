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
import { useSelector } from 'react-redux';
import {
  AssessmentTemplateData,
  fetchAssessmentTemplates,
} from '../api/assessmentTemplateService';
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

const AssignmentDetailScreen = () => {
  const [listHeight, setListHeight] = useState(0);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const elementId = (route.params as { elementId?: string })?.elementId;

  const [elementData, setElementData] = useState<CourseElementData | null>(
    null,
  );
  const [templateData, setTemplateData] =
    useState<AssessmentTemplateData | null>(null);
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
    const loadDetails = async () => {
      setIsLoading(true);
      try {
        const element = await fetchCourseElementById(elementId);
        setElementData(element);
        const templatesResponse = await fetchAssessmentTemplates({
          pageNumber: 1,
          pageSize: 1000,
        });
        const foundTemplate = templatesResponse.items.find(
          t => t.courseElementId === Number(elementId),
        );
        setTemplateData(foundTemplate || null);
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load assignment details.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [elementId]);

  const navigateToRequirement = () => {
    if (templateData) {
      navigation.navigate('RequirementScreen', {
        assessmentTemplate: templateData,
      });
    } else {
      showErrorToast(
        'Error',
        'No requirement details found for this assignment.',
      );
    }
  };

  const dynamicDocumentList = DocumentList.map(item => {
    if (item.title === 'Requirement') {
      return {
        ...item,
        detailNavigation: undefined,
        onPress: navigateToRequirement,
      };
    }
    return item;
  });

  const sections = [
    { title: 'Documents', data: dynamicDocumentList },
    { title: 'Submissions', data: SubmissionList },
  ];

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
          assignmentType="Assignment"
          assignmentTitle={elementData.name}
          dueDate="N/A" // Add deadline if available in elementData
          lecturerName={userProfile?.fullName || 'Lecturer'} // Use profile name if available
          description={elementData.description}
          isSubmitted={false} // TODO: Add logic to check submission status
          onSubmitPress={() => {
            navigation.navigate('SubmissionScreen', {
              elementId: elementData.id,
            });
          }}
          isAssessment={false}
        />
        <View />
        <View
          style={{ position: 'absolute', top: s(320), width: '100%' }}
          onLayout={e => setListHeight(e.nativeEvent.layout.height + s(100))}
        >
          <CurriculumList sections={sections} />
        </View>
      </ScrollView>
    </View>
  );
};

export default AssignmentDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.white },
  scrollView: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  errorText: { color: AppColors.n500, marginTop: vs(20), textAlign: 'center' },
  image: { width: '100%' },
});
