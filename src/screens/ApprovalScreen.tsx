import React, { useState } from 'react';
import {
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
import ApprovalAccordion from '../components/approval/ApprovalAccordion';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import StatusTag from '../components/assessments/StatusTag';

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
  assignmentType: 'Basic assignment' | 'Web API' | 'Web UI'; // << THÊM THUỘC TÍNH MỚI
}

export interface Course {
  id: string;
  courseName: string;
  assignments: Assignment[];
}

const initialData: Course[] = [
  {
    id: '1',
    courseName: 'Software Engineering',
    assignments: [
      {
        id: 'a1',
        name: 'Assignment 1 - Nguyen NT',
        status: 'Pending',
        assignmentType: 'Basic assignment', // << THÊM DỮ LIỆU
        questions: [
          {
            id: 1,
            title: 'Create a program',
            content:
              'Amet minim mollit non deserunt ullamco est sit aliqua dolor do sit amet.',
            imageUrl:
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp1a2pnT6V6RhTJAqy4iaK74K-BSsC9BZR3Q&s',
          },
        ],
      },
      {
        id: 'a2',
        name: 'Assignment 2 - Tran VH',
        status: 'Pending',
        assignmentType: 'Web API', // << THÊM DỮ LIỆU
        questions: [
          {
            id: 1,
            title: 'Create an API',
            content:
              'Amet minim mollit non deserunt ullamco est sit aliqua dolor do sit amet.',
            imageUrl:
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp1a2pnT6V6RhTJAqy4iaK74K-BSsC9BZR3Q&s',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    courseName: 'Database Management',
    assignments: [
      {
        id: 'a3',
        name: 'Assignment 1 - Le TT',
        status: 'Pending',
        assignmentType: 'Web UI', // << THÊM DỮ LIỆU
        questions: [
          {
            id: 1,
            title: 'Design a schema',
            content:
              'Amet minim mollit non deserunt ullamco est sit aliqua dolor do sit amet.',
            imageUrl:
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp1a2pnT6V6RhTJAqy4iaK74K-BSsC9BZR3Q&s',
          },
        ],
      },
    ],
  },
];

const ApprovalScreen = () => {
  const [data, setData] = useState<Course[]>(initialData);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(
    null
  );

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
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
        'Storage permission is required to download files.'
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
          `${fileName} has been saved to your Downloads folder.`
        );
      })
      .catch(error => {
        console.error(error);
        Alert.alert(
          'Download Error',
          'An error occurred while downloading the file.'
        );
      });
  };

  const handleApprove = (courseId: string, assignmentId: string) => {
    setData(prev =>
      prev.map(course =>
        course.id === courseId
          ? {
              ...course,
              assignments: course.assignments.map(a =>
                a.id === assignmentId ? { ...a, status: 'Approved' } : a
              ),
            }
          : course
      )
    );
  };

  const handleReject = (
    courseId: string,
    assignmentId: string,
    reason: string
  ) => {
    setData(prev =>
      prev.map(course =>
        course.id === courseId
          ? {
              ...course,
              assignments: course.assignments.map(a =>
                a.id === assignmentId
                  ? { ...a, status: 'Rejected', reason: reason }
                  : a
              ),
            }
          : course
      )
    );
  };

  const getCourseStatus = (assignments: Assignment[]) => {
    const allApproved = assignments.every(a => a.status === 'Approved');
    const anyRejected = assignments.some(a => a.status === 'Rejected');
    if (allApproved) return 'Approved';
    if (anyRejected) return 'Rejected';
    return 'Pending';
  };

  return (
    <AppSafeView>
      <ScreenHeader title="Approval" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: s(20), paddingBottom: vs(40) }}
        showsVerticalScrollIndicator={false}
      >
        {data.map(course => (
          <View key={course.id} style={styles.courseCard}>
            <TouchableOpacity
              style={styles.courseHeader}
              onPress={() =>
                setExpandedCourse(prevId =>
                  prevId === course.id ? null : course.id
                )
              }
            >
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
                        prevId === assignment.id ? null : assignment.id
                      )
                    }
                    onApprove={() => handleApprove(course.id, assignment.id)}
                    onReject={reason =>
                      handleReject(course.id, assignment.id, reason)
                    }
                    onDownload={handleDownload} // << TRUYỀN HÀM XUỐNG
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
});