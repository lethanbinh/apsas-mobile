import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import ScreenHeader from '../components/common/ScreenHeader';
import SubmissionHistoryItem from '../components/gradeHistory/SubmissionHistoryItem';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { useNavigation } from '@react-navigation/native';
import { getSubmissionList, Submission } from '../api/submissionService';
import { getClassAssessments } from '../api/classAssessmentService';
import { useGetCurrentStudentId } from '../hooks/useGetCurrentStudentId';
import { showErrorToast } from '../components/toasts/AppToast';
import dayjs from 'dayjs';
import AppText from '../components/texts/AppText';

interface SubmissionHistoryItemData {
  id: number;
  backgroundColor: string;
  submissionTime: string;
  courseCode: string;
  courseName: string;
  assignmentTitle: string;
  teacherName: string;
  fileName: string;
  status: 'Late' | 'On time' | 'Missing';
  timeSubmit: string;
  onNavigate: () => void;
}

const SubmissionHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const { studentId, isLoading: isLoadingStudentId } = useGetCurrentStudentId();
  const [submissions, setSubmissions] = useState<SubmissionHistoryItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (isLoadingStudentId || !studentId) {
      if (!isLoadingStudentId && !studentId) {
        showErrorToast('Error', 'Could not identify current student.');
        setIsLoading(false);
      }
      return;
    }

    const loadSubmissionHistory = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        // Fetch all submissions for this student
        const allSubmissions = await getSubmissionList({
          studentId: studentId,
        });

        if (!isMounted) return;

        // Fetch class assessments to get assignment details
        const classAssessmentsRes = await getClassAssessments({
          studentId: studentId,
          pageNumber: 1,
          pageSize: 1000,
        });

        if (!isMounted) return;

        const assessmentMap = new Map<number, any>();
        (classAssessmentsRes?.items || []).forEach(ca => {
          if (ca && ca.id) {
            assessmentMap.set(ca.id, ca);
          }
        });

        // Group submissions by classAssessmentId and get the latest one per assignment
        const submissionMap = new Map<number, Submission>();
        allSubmissions.forEach(sub => {
          if (!sub || !sub.classAssessmentId || !sub.submittedAt) return;
          const existing = submissionMap.get(sub.classAssessmentId);
          if (
            !existing ||
            (existing.submittedAt && new Date(sub.submittedAt).getTime() > new Date(existing.submittedAt).getTime())
          ) {
            submissionMap.set(sub.classAssessmentId, sub);
          }
        });

        // Build history items
        const historyItems: SubmissionHistoryItemData[] = [];
        const colorOptions = [AppColors.pr100, AppColors.g100, AppColors.pur100, AppColors.b100];

        submissionMap.forEach((sub, classAssessmentId) => {
          if (!sub || !sub.id || !sub.submittedAt) return;
          const assessment = assessmentMap.get(classAssessmentId);
          if (!assessment || !assessment.id) return;

          try {
            // Determine status
            let status: 'Late' | 'On time' | 'Missing' = 'On time';
            if (sub.submittedAt && assessment.endAt) {
              try {
                const submittedDate = dayjs(sub.submittedAt);
                const deadlineDate = dayjs(assessment.endAt);
                if (submittedDate.isValid() && deadlineDate.isValid() && submittedDate.isAfter(deadlineDate)) {
                  status = 'Late';
                }
              } catch (dateErr) {
                console.error('Error parsing dates:', dateErr);
              }
            }

            // Count submission number
            const allSubsForAssignment = (allSubmissions || []).filter(
              s => s && s.id && s.classAssessmentId === classAssessmentId && s.submittedAt,
            );
            const submissionNumber = allSubsForAssignment.length;

            const colorIndex = historyItems.length % colorOptions.length;
            
            let submissionTime = 'N/A';
            try {
              if (sub.submittedAt) {
                const formatted = dayjs(sub.submittedAt).format('DD/MM/YYYY – HH:mm');
                if (formatted && formatted !== 'Invalid Date') {
                  submissionTime = formatted;
                }
              }
            } catch (timeErr) {
              console.error('Error formatting submission time:', timeErr);
            }
            
            let courseCode = 'N/A';
            try {
              if (assessment.courseName && typeof assessment.courseName === 'string') {
                const parts = assessment.courseName.split(' ');
                if (parts.length > 0 && parts[0]) {
                  courseCode = parts[0];
                }
              }
            } catch (codeErr) {
              console.error('Error extracting course code:', codeErr);
            }
            
            historyItems.push({
              id: sub.id,
              backgroundColor: colorOptions[colorIndex] || AppColors.pr100,
              submissionTime,
              courseCode,
              courseName: assessment.courseName || 'Unknown Course',
              assignmentTitle: assessment.courseElementName || 'Unknown Assignment',
              teacherName: assessment.lecturerName || 'Unknown Teacher',
              fileName: sub.submissionFile?.name || 'submission.zip',
              status,
              timeSubmit: `Submission ${submissionNumber}`,
              onNavigate: () => {
                try {
                  if (sub && sub.id) {
                    navigation.navigate('ScoreDetailScreen', {
                      submissionId: sub.id,
                    });
                  }
                } catch (navErr) {
                  console.error('Error navigating to score detail:', navErr);
                  showErrorToast('Error', 'Failed to open score details.');
                }
              },
            });
          } catch (itemErr) {
            console.error('Error processing submission item:', itemErr);
          }
        });

        // Sort by submission time (newest first)
        try {
          historyItems.sort((a, b) => {
            try {
              if (!a.submissionTime || !b.submissionTime || a.submissionTime === 'N/A' || b.submissionTime === 'N/A') {
                return 0;
              }
              const timeA = dayjs(a.submissionTime.split(' – ')[0], 'DD/MM/YYYY');
              const timeB = dayjs(b.submissionTime.split(' – ')[0], 'DD/MM/YYYY');
              if (!timeA.isValid() || !timeB.isValid()) {
                return 0;
              }
              return timeB.valueOf() - timeA.valueOf();
            } catch (sortErr) {
              return 0;
            }
          });
        } catch (sortErr) {
          console.error('Error sorting submissions:', sortErr);
        }

        if (!isMounted) return;
        setSubmissions(historyItems);
      } catch (error: any) {
        console.error('Failed to load submission history:', error);
        if (isMounted) {
          showErrorToast('Error', 'Failed to load submission history.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSubmissionHistory();
    return () => {
      setIsMounted(false);
    };
  }, [studentId, isLoadingStudentId]);

  if (isLoading || isLoadingStudentId) {
    return (
      <AppSafeView>
        <ScreenHeader title="Submission History" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader title="Submission History" />
      <View style={styles.container}>
        {submissions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>No submission history found.</AppText>
          </View>
        ) : (
          <FlatList
            data={submissions}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <SubmissionHistoryItem {...item} />}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: s(15) }} />}
          />
        )}
      </View>
    </AppSafeView>
  );
};

export default SubmissionHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: s(25),
    paddingVertical: s(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: AppColors.n500,
    fontSize: s(14),
  },
});
