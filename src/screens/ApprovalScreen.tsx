import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import { AppColors } from '../styles/color';
import { s } from 'react-native-size-matters';
import { DownloadIcon } from '../assets/icons/courses';

type Assignment = {
  id: string;
  name: string;
  files: { id: string; title: string; fileName: string }[];
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
};

type Course = {
  id: string;
  courseName: string;
  assignments: Assignment[];
};

const initialData: Course[] = [
  {
    id: '1',
    courseName: 'Software Engineering',
    assignments: [
      {
        id: 'a1',
        name: 'Assignment 1 - Nguyen NT',
        files: [
          { id: 'f1', title: 'Requirement', fileName: 'requirement.pdf' },
          { id: 'f2', title: 'Criteria', fileName: 'criteria.pdf' },
          { id: 'f3', title: 'Database', fileName: 'database.sql' },
        ],
        status: 'Pending',
      },
      {
        id: 'a2',
        name: 'Assignment 2 - Tran VH',
        files: [
          { id: 'f4', title: 'Requirement', fileName: 'requirement.pdf' },
          { id: 'f5', title: 'Criteria', fileName: 'criteria.pdf' },
          { id: 'f6', title: 'Database', fileName: 'database.sql' },
        ],
        status: 'Pending',
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
        files: [
          { id: 'f7', title: 'Requirement', fileName: 'requirement.pdf' },
          { id: 'f8', title: 'Criteria', fileName: 'criteria.pdf' },
          { id: 'f9', title: 'Database', fileName: 'database.sql' },
        ],
        status: 'Pending',
      },
    ],
  },
];

const ApprovalScreen = () => {
  const [data, setData] = useState(initialData);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>(
    {},
  );

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleApprove = (courseId: string, assignmentId: string) => {
    setData(prev =>
      prev.map(course =>
        course.id === courseId
          ? {
              ...course,
              assignments: course.assignments.map(a =>
                a.id === assignmentId ? { ...a, status: 'Approved' } : a,
              ),
            }
          : course,
      ),
    );
  };

  const handleReject = (courseId: string, assignmentId: string) => {
    if (!rejectReason[assignmentId]) return;
    setData(prev =>
      prev.map(course =>
        course.id === courseId
          ? {
              ...course,
              assignments: course.assignments.map(a =>
                a.id === assignmentId
                  ? { ...a, status: 'Rejected', reason: rejectReason[assignmentId] }
                  : a,
              ),
            }
          : course,
      ),
    );
  };

  const renderStatus = (status: string) => {
    let bg = '#FFD700';
    if (status === 'Approved') bg = '#A5F3B7';
    if (status === 'Rejected') bg = '#FCA5A5';
    return (
      <View style={[styles.statusBox, { backgroundColor: bg }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
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
        style={styles.scrollContainer}
        contentContainerStyle={{ padding: s(20), paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {data.map(course => {
          const courseStatus = getCourseStatus(course.assignments);

          return (
            <View key={course.id} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleExpand(course.id)}
              >
                <Text style={styles.cardTitle}>{course.courseName}</Text>
                {renderStatus(courseStatus)}
                <Text style={styles.expandIcon}>
                  {expanded === course.id ? '-' : '+'}
                </Text>
              </TouchableOpacity>

              {expanded === course.id && (
                <View style={styles.cardBody}>
                  {course.assignments.map((assignment, idx) => (
                    <View key={assignment.id} style={styles.assignmentBox}>
                      <Text style={styles.assignmentTitle}>
                        {idx + 1}. {assignment.name}
                      </Text>
                      {renderStatus(assignment.status)}

                      {assignment.files.map((f, index) => (
                        <View key={f.id} style={styles.fileRow}>
                          <Text style={styles.fileIndex}>
                            {String(index + 1).padStart(2, '0')}
                          </Text>
                          <View style={styles.fileInfo}>
                            <Text style={styles.fileTitle}>{f.title}</Text>
                            <Text style={styles.fileName}>{f.fileName}</Text>
                          </View>
                          <DownloadIcon />
                        </View>
                      ))}

                      {assignment.status === 'Pending' && (
                        <>
                          {rejectReason[assignment.id] !== undefined && (
                            <TextInput
                              style={styles.reasonInput}
                              placeholder="Enter reject reason..."
                              value={rejectReason[assignment.id]}
                              onChangeText={txt =>
                                setRejectReason(prev => ({
                                  ...prev,
                                  [assignment.id]: txt,
                                }))
                              }
                            />
                          )}
                          <View style={styles.actionRow}>
                            <TouchableOpacity
                              style={[styles.btn, { backgroundColor: '#3B82F6' }]}
                              onPress={() =>
                                handleApprove(course.id, assignment.id)
                              }
                            >
                              <Text style={styles.btnText}>Approve</Text>
                            </TouchableOpacity>

                            {rejectReason[assignment.id] === undefined ? (
                              <TouchableOpacity
                                style={[
                                  styles.btn,
                                  { backgroundColor: '#F87171' },
                                ]}
                                onPress={() =>
                                  setRejectReason(prev => ({
                                    ...prev,
                                    [assignment.id]: '',
                                  }))
                                }
                              >
                                <Text style={styles.btnText}>Reject</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={[
                                  styles.btn,
                                  { backgroundColor: '#DC2626' },
                                ]}
                                onPress={() =>
                                  handleReject(course.id, assignment.id)
                                }
                              >
                                <Text style={styles.btnText}>
                                  Confirm Reject
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </>
                      )}

                      {assignment.status === 'Rejected' && (
                        <Text style={styles.reasonText}>
                          Reason: {assignment.reason}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </AppSafeView>
  );
};

export default ApprovalScreen;

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  card: {
    backgroundColor: AppColors.pr100,
    borderRadius: s(10),
    marginBottom: 12,
    padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: { flex: 1, fontWeight: 'bold', fontSize: 16 },
  expandIcon: { fontSize: 18, marginLeft: 8 },
  cardBody: { marginTop: 10 },
  assignmentBox: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  assignmentTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
  },
  statusBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginHorizontal: 6,
  },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
  },
  fileIndex: { fontWeight: 'bold', marginRight: 10 },
  fileInfo: { flex: 1 },
  fileTitle: { fontWeight: 'bold' },
  fileName: { color: '#6B7280' },
  downloadIcon: { fontSize: 18, color: '#3B82F6' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  btn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 6,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  reasonText: {
    marginTop: 8,
    color: '#DC2626',
    fontStyle: 'italic',
  },
});
