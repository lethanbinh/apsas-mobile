import { useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from '../components/common/ScreenHeader';
import AppSafeView from '../components/views/AppSafeView';
import { globalStyles } from '../styles/shareStyles';
import { usePlanDetails } from '../hooks/usePlanDetails';
import CourseSection from '../components/plans/CourseSection';
import ClassSection from '../components/plans/ClassSection';
import StudentSection from '../components/plans/StudentSection';
import AssignRequestSection from '../components/plans/AssignRequestSection';
import { AppColors } from '../styles/color';

const PublishPlansScreen = () => {
  const route = useRoute();
  const semesterId = (route.params as { semesterId?: string })?.semesterId;
  const semesterCode = (route.params as { semesterCode: string })?.semesterCode;
  const {
    isLoading,
    planData,
    courses,
    classes,
    studentGroups,
    assignRequests,
    planElements,
    currentHodId,
    semesterCoursesForDropdown,
    refreshPlan,
  } = usePlanDetails(semesterId, semesterCode);

  console.log(assignRequests)
  return (
    <AppSafeView style={{ flex: 1 }}>
      <ScreenHeader title={`Plan Detail: ${planData?.semesterCode || ''}`} />
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={AppColors.pr500}
          style={styles.loadingIndicator}
        />
      ) : (
        <ScrollView style={globalStyles.containerStyle}>
          <CourseSection
            courses={courses}
            semesterId={semesterId || ''}
            onRefresh={refreshPlan}
          />
          <ClassSection
            classes={classes}
            semesterCourses={semesterCoursesForDropdown}
            onRefresh={refreshPlan}
          />
          <StudentSection
            studentGroups={studentGroups}
            planClasses={classes}
            onRefresh={refreshPlan}
          />
          <AssignRequestSection
            assignRequests={assignRequests}
            courseElements={planElements}
            hodId={currentHodId || ''}
            onRefresh={refreshPlan}
          />
        </ScrollView>
      )}
    </AppSafeView>
  );
};

export default PublishPlansScreen;

const styles = StyleSheet.create({
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
