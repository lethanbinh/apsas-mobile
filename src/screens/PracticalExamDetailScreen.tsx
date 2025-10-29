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
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import { showErrorToast } from '../components/toasts/AppToast';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import AppText from '../components/texts/AppText';
import {
  CourseElementData,
  fetchCourseElementById,
} from '../api/courseElementService';
import {
  AssessmentTemplateData,
  fetchAssessmentTemplates,
} from '../api/assessmentTemplateService';

const PracticalExamDetailScreen = () => {
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
      showErrorToast('Error', 'No Exam ID provided.');
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
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load exam details.');
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
        <ScreenHeader title="Practical Exam" />
        <AppText style={styles.errorText}>Failed to load exam data.</AppText>
      </AppSafeView>
    );
  }

  const navigateToRequirement = () => {
    if (templateData) {
      navigation.navigate('RequirementTeacherScreen', {
        assessmentTemplate: templateData,
      });
    } else {
      showErrorToast(
        'Error',
        'No requirement template found for this exam.',
      );
    }
  };

  const dynamicDocumentList = DocumentList.map(item => {
    if (item.title === 'Requirement') {
      return {
        ...item,
        onPress: navigateToRequirement,
      };
    }
    return item;
  });

  const sections = [
    { title: 'Documents', data: dynamicDocumentList },
    { title: 'Submissions', data: SubmissionList },
  ];

  console.log(sections)

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        nestedScrollEnabled
        contentContainerStyle={{ paddingBottom: listHeight }}>
        <Image
          style={styles.image}
          source={require('../assets/images/assignment.png')}
        />
        <AssignmentCardInfo
          assignmentType="Practical Exam"
          assignmentTitle={elementData.name}
          dueDate="N/A"
          lecturerName={userProfile?.name || 'Lecturer'}
          description={elementData.description}
          isSubmitted={false}
          onSubmitPress={() => {
            navigation.navigate('SubmissionScreen');
          }}
          isAssessment={true}
          onDashboardPress={() =>
            navigation.navigate('DashboardTeacherScreen' as never)
          }
        />
        <View />
        <View
          style={{ position: 'absolute', top: s(320), width: '100%' }}
          onLayout={e => setListHeight(e.nativeEvent.layout.height + s(100))}>
          <CurriculumList
            sections={sections}
            buttonText="Download All Submissions"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default PracticalExamDetailScreen;

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