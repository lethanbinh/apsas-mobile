import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { s, vs } from 'react-native-size-matters';
import {
  AssessmentTemplateData,
  fetchAssessmentTemplates,
} from '../api/assessmentTemplateService';
import {
  AssignRequestData,
  fetchAssignRequestList,
} from '../api/assignRequestService';
import AssignmentAccordion from '../components/assessments/AssignmentAccordion';
import StatusTag from '../components/assessments/StatusTag';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { useGetCurrentLecturerId } from '../hooks/useGetCurrentLecturerId';
import { AppColors } from '../styles/color';
interface CourseUI {
  id: string;
  title: string;
  status: string;
  assignmentsData: {
    assignRequest: AssignRequestData;
    template: AssessmentTemplateData | null;
  }[];
}

const CreateAssessmentScreen = () => {
  const route = useRoute();
  const semesterCode = (route.params as { semesterCode?: string })
    ?.semesterCode;
  const [courses, setCourses] = useState<CourseUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(
    null,
  );
  const { lecturerId: currentLecturerId } = useGetCurrentLecturerId(); // <-- Lấy currentLecturerId

  useEffect(() => {
    if (!semesterCode) {
      showErrorToast('Error', 'No semester selected.');
      setIsLoading(false);
      return;
    }
    if (!currentLecturerId) {
      setIsLoading(false);
      return;
    }

    const loadAssignments = async () => {
      setIsLoading(true);
      try {
        // Fetch assign requests
        const response = await fetchAssignRequestList(
          semesterCode,
          currentLecturerId,
          1,
          1000,
        );
        const assignRequests = response.items;

        if (!assignRequests || assignRequests.length === 0) {
          setCourses([]);
          setIsLoading(false);
          return;
        }

        // Fetch templates tương ứng
        const templatePromises = assignRequests.map(ar =>
          fetchAssessmentTemplates({
            pageNumber: 1,
            pageSize: 1, // Chỉ cần 1 template
            assignRequestId: ar.id,
          })
            .then(res => ({
              assignRequest: ar,
              template: res.items[0] || null, // Lấy template hoặc null
            }))
            .catch(err => {
              console.error(`Error fetching template for AR ${ar.id}:`, err);
              return { assignRequest: ar, template: null }; // Trả về null nếu lỗi
            }),
        );

        const combinedData = await Promise.all(templatePromises);

        // Group data theo courseName
        const coursesMap = new Map<
          string,
          {
            assignRequest: AssignRequestData;
            template: AssessmentTemplateData | null;
          }[]
        >();

        combinedData.forEach(item => {
          if (!coursesMap.has(item.assignRequest.courseName)) {
            coursesMap.set(item.assignRequest.courseName, []);
          }
          coursesMap.get(item.assignRequest.courseName)?.push(item);
        });
        const coursesData: CourseUI[] = Array.from(coursesMap.entries()).map(
          ([courseName, assignmentsData]) => ({
            id: courseName,
            title: courseName,
            status: 'Pending',
            assignmentsData: assignmentsData,
          }),
        );

        setCourses(coursesData);
        if (coursesData.length > 0) {
          setExpandedCourse(coursesData[0].id);
          if (coursesData[0].assignmentsData.length > 0) {
            setExpandedAssignment(
              String(coursesData[0].assignmentsData[0].assignRequest.id),
            );
          }
        }
      } catch (error: any) {
        showErrorToast('Error', 'Failed to load assignments.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignments();
  }, [semesterCode, currentLecturerId]);

  return (
    <AppSafeView>
      <ScreenHeader title={`Tasks (${semesterCode || ''})`} />
      {isLoading ? (
        <ActivityIndicator size="large" style={{ flex: 1 }} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: s(20), paddingBottom: vs(40) }}
          showsVerticalScrollIndicator={false}
        >
          {courses.length > 0 ? (
            courses.map(course => (
              <View key={course.id} style={styles.courseCard}>
                <TouchableOpacity
                  style={styles.courseHeader}
                  onPress={() =>
                    setExpandedCourse(
                      expandedCourse === course.id ? null : course.id,
                    )
                  }
                >
                  <AppText variant="label16pxBold" style={{ flex: 1 }}>
                    {course.title}
                  </AppText>
                  <StatusTag status={course.status} />
                  <AppText style={styles.expandIcon}>
                    {expandedCourse === course.id ? '−' : '+'}
                  </AppText>
                </TouchableOpacity>
                {expandedCourse === course.id && (
                  <View style={styles.courseBody}>
                    {course.assignmentsData.map(
                      ({ assignRequest, template }) => (
                        <AssignmentAccordion
                          key={assignRequest.id}
                          assignRequest={assignRequest}
                          template={template}
                          isExpanded={
                            expandedAssignment === String(assignRequest.id)
                          }
                          onToggle={() =>
                            setExpandedAssignment(prevId =>
                              prevId === String(assignRequest.id)
                                ? null
                                : String(assignRequest.id),
                            )
                          }
                          onSuccess={() => {
                            console.log('Need to refresh data after confirm!');
                          }}
                        />
                      ),
                    )}
                  </View>
                )}
              </View>
            ))
          ) : (
            <AppText style={styles.emptyText}>
              No tasks found for this semester.
            </AppText>
          )}
        </ScrollView>
      )}
    </AppSafeView>
  );
};

export default CreateAssessmentScreen;
const styles = StyleSheet.create({
  courseCard: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.pr100,
    marginBottom: vs(16),
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(12),
    paddingHorizontal: s(14),
  },
  expandIcon: {
    fontSize: 18,
    marginLeft: 6,
    color: AppColors.n700,
  },
  courseBody: {
    backgroundColor: AppColors.pr100,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingTop: vs(2),
    paddingBottom: vs(10),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vs(50),
    color: AppColors.n500,
  },
});
