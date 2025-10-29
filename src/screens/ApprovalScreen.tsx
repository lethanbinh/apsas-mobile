import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { s, vs } from 'react-native-size-matters';
import {
  AssessmentTemplateData,
  fetchAssessmentTemplates,
} from '../api/assessmentTemplateService';
import {
  AssignRequestData,
  fetchAssignRequestList,
  updateAssignRequest, // 1. Import hàm update
} from '../api/assignRequestService';
import ApprovalAccordion from '../components/approval/ApprovalAccordion';
import StatusTag from '../components/assessments/StatusTag';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import AppSafeView from '../components/views/AppSafeView';
import { useGetCurrentHodID } from '../hooks/useGetCurrentHodID';
import { AppColors } from '../styles/color';

type AssignmentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Question {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
}

export interface Assignment {
  id: string;
  name: string;
  status: AssignmentStatus;
  questions: Question[];
  reason?: string;
  assignmentType: 'Basic assignment' | 'Web API' | 'Web UI';
}

export interface Course {
  id: string;
  courseName: string;
  assignments: Assignment[];
}

// 2. Định nghĩa các status code
const ASSIGN_REQUEST_STATUS = {
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  IN_PROGRESS: 4,
  COMPLETED: 5,
};

const mapApiStatusToAssignmentStatus = (status: number): AssignmentStatus => {
  switch (status) {
    case ASSIGN_REQUEST_STATUS.REJECTED:
      return 'Rejected';
    case ASSIGN_REQUEST_STATUS.COMPLETED:
      return 'Approved';
    case ASSIGN_REQUEST_STATUS.PENDING:
    case ASSIGN_REQUEST_STATUS.ACCEPTED:
    case ASSIGN_REQUEST_STATUS.IN_PROGRESS:
    default:
      return 'Pending';
  }
};

// 3. Định nghĩa kiểu dữ liệu cho state thô
type CombinedData = {
  assignRequest: AssignRequestData;
  template: AssessmentTemplateData | undefined;
};

const transformApiDataToCourses = (combinedData: CombinedData[]): Course[] => {
  const courseMap = new Map<string, Course>();

  for (const item of combinedData) {
    const { assignRequest, template } = item;
    if (!template) {
      continue;
    }
    if (!courseMap.has(assignRequest.courseName)) {
      courseMap.set(assignRequest.courseName, {
        id: assignRequest.courseName,
        courseName: assignRequest.courseName,
        assignments: [],
      });
    }

    const course = courseMap.get(assignRequest.courseName)!;

    let questions: Question[];

    if (
      template &&
      template.papers.length > 0 &&
      template.papers[0].questions.length > 0
    ) {
      questions = template.papers[0].questions.map(q => ({
        id: q.id,
        title: q.questionText,
        content: `Sample Input:\n${q.questionSampleInput}\n\nSample Output:\n${q.questionSampleOutput}`,
        imageUrl: '',
      }));
    } else {
      questions = [];
    }

    const assignmentType = 'Basic assignment';

    const newAssignment: Assignment = {
      id: String(assignRequest.id),
      name: `${assignRequest.courseElementName} - ${assignRequest.assignedLecturerName}`,
      status: mapApiStatusToAssignmentStatus(assignRequest.status),
      assignmentType: assignmentType,
      questions: questions,
      reason:
        assignRequest.status === ASSIGN_REQUEST_STATUS.REJECTED
          ? assignRequest.message
          : undefined,
    };

    course.assignments.push(newAssignment);
  }

  return Array.from(courseMap.values());
};

const ApprovalScreen = () => {
  // State 'data' dùng cho UI
  const [data, setData] = useState<Course[]>([]);
  // State 'rawCombinedData' chứa dữ liệu API gốc để gửi lại khi update
  const [rawCombinedData, setRawCombinedData] = useState<CombinedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(
    null,
  );
  const currentHodID = useGetCurrentHodID();
  const route = useRoute();

  useEffect(() => {
    const loadData = async () => {
      // Chỉ set loading khi có HOD ID
      if (currentHodID) {
        setIsLoading(true);
      }
      try {
        const { semesterCode } =
          (route.params as { semesterCode?: string }) || {};

        const result = await fetchAssignRequestList(
          semesterCode,
          null,
          1,
          100,
          currentHodID,
        );

        if (!result.items || result.items.length === 0) {
          setData([]);
          setRawCombinedData([]);
          return;
        }

        const templatePromises = result.items.map(assignRequest =>
          fetchAssessmentTemplates({
            pageNumber: 1,
            pageSize: 1,
            assignRequestId: assignRequest.id,
          })
            .then(templateResult => ({
              assignRequest: assignRequest,
              template: templateResult.items[0],
            }))
            .catch(err => {
              console.error(
                `Failed to fetch template for assignRequest ${assignRequest.id}:`,
                err,
              );
              return { assignRequest: assignRequest, template: undefined };
            }),
        );

        const combinedData = await Promise.all(templatePromises);
        // 4. Cập nhật cả hai state
        setRawCombinedData(combinedData);
        setData(transformApiDataToCourses(combinedData));
      } catch (error) {
        console.error('Failed to load approval data:', error);
        Alert.alert('Error', 'Failed to load approval data. Please try again.');
      } finally {
        if (currentHodID) {
          setIsLoading(false);
        }
      }
    };

    if (currentHodID) {
      loadData();
    }
  }, [route.params, currentHodID]);

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleDownload = async (fileName: string) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to download files.',
      );
      return;
    }
    const sampleFileUrl =
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const { dirs } = ReactNativeBlobUtil.fs;
    const dirToSave =
      Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
    const config = {
      fileCache: true,
      path: `${dirToSave}/${fileName}`,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: `${dirToSave}/${fileName}`,
        description: 'Downloading file.',
      },
    };
    Alert.alert('Starting Download', `Downloading ${fileName}...`);
    ReactNativeBlobUtil.config(config)
      .fetch('GET', sampleFileUrl)
      .then(res => {
        if (Platform.OS === 'ios') {
          ReactNativeBlobUtil.ios.previewDocument(res.path());
        }
        Alert.alert(
          'Download Complete',
          `${fileName} has been saved to your Downloads folder.`,
        );
      })
      .catch(error => {
        console.error(error);
        Alert.alert(
          'Download Error',
          'An error occurred while downloading the file.',
        );
      });
  };

  // 5. Cập nhật hàm Approve
  const handleApprove = async (courseId: string, assignmentId: string) => {
    const originalItem = rawCombinedData.find(
      item => String(item.assignRequest.id) === assignmentId,
    );

    if (!originalItem) {
      Alert.alert('Error', 'Could not find the original request data.');
      return;
    }

    const { assignRequest } = originalItem;

    try {
      const payload = {
        message: assignRequest.message,
        courseElementId: assignRequest.courseElementId,
        assignedLecturerId: assignRequest.assignedLecturerId,
        assignedByHODId: assignRequest.assignedByHODId,
        assignedAt: assignRequest.assignedAt,
        status: ASSIGN_REQUEST_STATUS.COMPLETED,
      };

      console.log('Approve payload:', payload, assignmentId);

      const response = await updateAssignRequest(assignmentId, payload);

      if (response.isSuccess) {
        // Cập nhật lại state thô
        const updatedRawData = rawCombinedData.map(item =>
          String(item.assignRequest.id) === assignmentId
            ? {
                ...item,
                assignRequest: {
                  ...item.assignRequest,
                  status: ASSIGN_REQUEST_STATUS.COMPLETED,
                },
              }
            : item,
        );
        setRawCombinedData(updatedRawData);
        setData(transformApiDataToCourses(updatedRawData));
      } else {
        throw new Error(response.errorMessages?.join(', ') || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
      Alert.alert('Error', 'Failed to approve the request.');
    }
  };

  // 6. Cập nhật hàm Reject
  const handleReject = async (
    courseId: string,
    assignmentId: string,
    reason: string,
  ) => {
    if (!reason.trim()) {
      Alert.alert('Invalid', 'A reason is required to reject.');
      return;
    }

    const originalItem = rawCombinedData.find(
      item => String(item.assignRequest.id) === assignmentId,
    );

    if (!originalItem) {
      Alert.alert('Error', 'Could not find the original request data.');
      return;
    }

    const { assignRequest } = originalItem;

    try {
      const payload = {
        message: reason, // <-- Thay đổi message
        courseElementId: assignRequest.courseElementId,
        assignedLecturerId: assignRequest.assignedLecturerId,
        assignedByHODId: assignRequest.assignedByHODId,
        assignedAt: assignRequest.assignedAt,
        status: ASSIGN_REQUEST_STATUS.REJECTED, // <-- Thay đổi status
      };

      const response = await updateAssignRequest(assignmentId, payload);

      if (response.isSuccess) {
        // Cập nhật lại state thô
        const updatedRawData = rawCombinedData.map(item =>
          String(item.assignRequest.id) === assignmentId
            ? {
                ...item,
                assignRequest: {
                  ...item.assignRequest,
                  status: ASSIGN_REQUEST_STATUS.REJECTED,
                  message: reason,
                },
              }
            : item,
        );
        setRawCombinedData(updatedRawData);
        // Cập nhật lại state UI
        setData(transformApiDataToCourses(updatedRawData));
      } else {
        throw new Error(response.errorMessages?.join(', ') || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      Alert.alert('Error', 'Failed to reject the request.');
    }
  };

  const getCourseStatus = (assignments: Assignment[]) => {
    const allApproved = assignments.every(a => a.status === 'Approved');
    const anyRejected = assignments.some(a => a.status === 'Rejected');
    if (allApproved) return 'Approved';
    if (anyRejected) return 'Rejected';
    return 'Pending';
  };

  if (isLoading) {
    return (
      <AppSafeView>
        <ScreenHeader title="Approval" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  if (data.length === 0) {
    return (
      <AppSafeView>
        <ScreenHeader title="Approval" />
        <View style={styles.centerContainer}>
          <AppText>No approval requests found.</AppText>
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader title="Approval" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: s(20), paddingBottom: vs(40) }}
        showsVerticalScrollIndicator={false}>
        {data.map(course => (
          <View key={course.id} style={styles.courseCard}>
            <TouchableOpacity
              style={styles.courseHeader}
              onPress={() =>
                setExpandedCourse(prevId =>
                  prevId === course.id ? null : course.id,
                )
              }>
              <AppText variant="label16pxBold" style={{ flex: 1 }}>
                {course.courseName}
              </AppText>
              <StatusTag status={getCourseStatus(course.assignments)} />
              <AppText style={styles.expandIcon}>
                {expandedCourse === course.id ? '−' : '+'}
              </AppText>
            </TouchableOpacity>

            {expandedCourse === course.id && (
              <View style={styles.courseBody}>
                {course.assignments.map(assignment => (
                  <ApprovalAccordion
                    key={assignment.id}
                    assignment={assignment}
                    isExpanded={expandedAssignment === assignment.id}
                    onToggle={() =>
                      setExpandedAssignment(prevId =>
                        prevId === assignment.id ? null : assignment.id,
                      )
                    }
                    onApprove={() => handleApprove(course.id, assignment.id)}
                    onReject={reason =>
                      handleReject(course.id, assignment.id, reason)
                    }
                    onDownload={handleDownload}
                  />
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </AppSafeView>
  );
};

export default ApprovalScreen;

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});