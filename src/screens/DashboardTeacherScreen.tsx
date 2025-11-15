import React, { useEffect, useState, useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { s, vs } from 'react-native-size-matters';
import { EditIcon, PassIcon } from '../assets/icons/icon';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import AppText from '../components/texts/AppText';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { useGetCurrentLecturerId } from '../hooks/useGetCurrentLecturerId';
import { getSubmissionList, Submission } from '../api/submissionService';
import { getGradingGroups } from '../api/gradingGroupService';
import { showErrorToast } from '../components/toasts/AppToast';
import dayjs from 'dayjs';

const screenWidth = Dimensions.get('window').width;

interface StudentSubmissionSummary {
  studentId: number;
  studentName: string;
  studentCode: string;
  submissions: Submission[];
  averageScore: number;
  lastSubmission: Submission | null;
}

const DashboardTeacherScreen = () => {
  const { lecturerId, isLoading: isLecturerLoading } = useGetCurrentLecturerId();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<StudentSubmissionSummary[]>([]);

  useEffect(() => {
    setIsMounted(true);

    const fetchDashboardData = async () => {
      if (isLecturerLoading || !lecturerId) {
        return;
      }

      if (!isMounted) return;
      setIsLoading(true);

      try {
        // Fetch grading groups for this lecturer
        const gradingGroups = await getGradingGroups({ lecturerId });

        if (!isMounted) return;

        // Fetch submissions from all grading groups
        const submissionPromises = gradingGroups.map(group =>
          getSubmissionList({ gradingGroupId: group.id }).catch(err => {
            console.error(`Failed to fetch submissions for grading group ${group.id}:`, err);
            return [];
          }),
        );

        const allSubmissions = (await Promise.all(submissionPromises)).flat();

        if (!isMounted) return;

        setSubmissions(allSubmissions);

        // Group submissions by student and calculate statistics
        const studentMap = new Map<number, StudentSubmissionSummary>();

        allSubmissions.forEach(submission => {
          if (!submission?.studentId) return;
          const existing = studentMap.get(submission.studentId);
          if (existing) {
            existing.submissions.push(submission);
            // Update last submission if this one is more recent
            if (
              !existing.lastSubmission ||
              (submission.submittedAt && existing.lastSubmission.submittedAt &&
              dayjs(submission.submittedAt).isAfter(dayjs(existing.lastSubmission.submittedAt)))
            ) {
              existing.lastSubmission = submission;
            }
          } else {
            studentMap.set(submission.studentId, {
              studentId: submission.studentId,
              studentName: submission.studentName || 'Unknown',
              studentCode: submission.studentCode || '',
              submissions: [submission],
              averageScore: 0,
              lastSubmission: submission,
            });
          }
        });

        // Calculate average scores
        const studentSummaries = Array.from(studentMap.values()).map(summary => {
          const gradedSubmissions = summary.submissions.filter(
            s => s && s.lastGrade && s.lastGrade > 0 && s.submittedAt,
          );
          const avgScore =
            gradedSubmissions.length > 0
              ? gradedSubmissions.reduce((sum, s) => sum + (s.lastGrade || 0), 0) /
                gradedSubmissions.length
              : 0;
          return {
            ...summary,
            averageScore: avgScore,
          };
        });

        if (!isMounted) return;
        setStudentSubmissions(studentSummaries);
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        if (isMounted) {
          showErrorToast('Error', 'Failed to load dashboard data.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      setIsMounted(false);
    };
  }, [lecturerId, isLecturerLoading]);

  // Calculate statistics
  const stats = useMemo(() => {
    const submittedCount = submissions.filter(s => s && s.submittedAt).length;
    const passedCount = submissions.filter(
      s => s && s.submittedAt && s.lastGrade && s.lastGrade >= 5.0,
    ).length;
    const gradedSubmissions = submissions.filter(s => s && s.lastGrade && s.lastGrade > 0 && s.submittedAt);
    const averageScore =
      gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + (s.lastGrade || 0), 0) / gradedSubmissions.length
        : 0;

    return {
      studentsSubmit: submittedCount,
      passAssignments: passedCount,
      averageScore: averageScore,
    };
  }, [submissions]);

  // Prepare chart data (top 6 students by average score)
  const chartData = useMemo(() => {
    const sortedStudents = [...studentSubmissions]
      .filter(s => s && s.studentName)
      .sort((a, b) => (b?.averageScore || 0) - (a?.averageScore || 0))
      .slice(0, 6);

    return {
      labels: sortedStudents.map(s => {
        const name = s?.studentName || 'Unknown';
        const parts = name.split(' ');
        return parts.length > 0 ? parts[parts.length - 1] : name;
      }),
      datasets: [
        {
          data: sortedStudents.map(s => Math.round((s?.averageScore || 0) * 10) / 10),
          color: () => AppColors.pr500,
          strokeWidth: 3,
        },
      ],
    };
  }, [studentSubmissions]);

  // Get recent student submissions for display
  const recentSubmissions = useMemo(() => {
    return studentSubmissions
      .filter(s => s && s.lastSubmission && s.lastSubmission.submittedAt)
      .sort((a, b) => {
        if (!a?.lastSubmission?.submittedAt || !b?.lastSubmission?.submittedAt) return 0;
        return dayjs(b.lastSubmission.submittedAt).diff(dayjs(a.lastSubmission.submittedAt));
      })
      .slice(0, 10)
      .map(summary => {
        const submission = summary.lastSubmission!;
        // Determine status based on submission
        let status: 'Submitted' | 'Submitted late' | 'Not submitted' = 'Not submitted';
        let statusColor = AppColors.r500;
        let statusBgColor = AppColors.r100;

        if (submission && submission.submittedAt) {
          // Check if late (would need classAssessment endAt, for now assume on time)
          status = 'Submitted';
          statusColor = AppColors.g500;
          statusBgColor = AppColors.g100;
        }

        return {
          studentName: summary.studentName || 'Unknown',
          status,
          statusColor,
          statusBgColor,
          submission,
        };
      });
  }, [studentSubmissions]);

  if (isLoading || isLecturerLoading) {
    return (
      <AppSafeView>
        <ScreenHeader title="Dashboard" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader title="Dashboard" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: vs(20) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Statistic Cards */}
        <View style={styles.cardsRow}>
          <View style={[styles.statCard, { backgroundColor: '#7D80FF' }]}>
            <View>
              <AppText style={styles.statNumber}>{stats.studentsSubmit}</AppText>
              <AppText style={styles.statLabel}>Students Submit</AppText>
            </View>
            <View>
              <EditIcon />
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FF969B' }]}>
            <View>
              <AppText style={[styles.statNumber, { color: AppColors.white }]}>
                {stats.passAssignments}
              </AppText>
              <AppText style={styles.statLabel}>Pass Assignments</AppText>
            </View>
            <View>
              <PassIcon />
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <SectionHeader
          title="Statistics"
          style={{
            paddingVertical: vs(10),
          }}
        />
        <AppText style={styles.averageLabel}>Average Score</AppText>
        <AppText style={styles.averageScore}>
          {stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '0.0'}
        </AppText>

        {chartData.labels.length > 0 ? (
          <LineChart
            data={chartData}
            width={screenWidth - s(50)}
            height={220}
            fromZero
            chartConfig={{
              backgroundColor: AppColors.white,
              backgroundGradientFrom: AppColors.white,
              backgroundGradientTo: AppColors.white,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(55, 135, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: AppColors.white,
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.emptyChart}>
            <AppText style={styles.emptyChartText}>No data available for chart</AppText>
          </View>
        )}

        <SectionHeader
          title="Student submits"
          buttonText="View All"
          style={{
            paddingVertical: vs(10),
          }}
        />

        {/* List */}
        {recentSubmissions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>No student submissions yet</AppText>
          </View>
        ) : (
          recentSubmissions.map((item, index) => (
            <View key={`${item.studentName}-${index}`} style={styles.studentItem}>
              <View style={styles.avatar} />
              <AppText style={styles.studentName}>{item.studentName}</AppText>
              <View style={[styles.statusTag, { backgroundColor: item.statusBgColor }]}>
                <AppText style={[styles.statusText, { color: item.statusColor }]}>
                  {item.status}
                </AppText>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </AppSafeView>
  );
};

export default DashboardTeacherScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: s(25),
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: vs(16),
    gap: s(10),
  },
  statCard: {
    flex: 1,
    borderRadius: s(12),
    paddingVertical: vs(20),
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexDirection: "row",
    paddingHorizontal: s(10)
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.white,
  },
  statLabel: {
    fontSize: 13,
    color: AppColors.white,
    marginTop: vs(4),
  },
  sectionTitle: {
    marginTop: vs(20),
    marginBottom: vs(10),
  },
  averageLabel: {
    textAlign: 'center',
    color: AppColors.n700,
    fontSize: 14,
    marginBottom: vs(5),
  },
  averageScore: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.b500,
    marginBottom: vs(10),
  },
  chart: {
    borderRadius: 12,
    marginBottom: vs(20),
  },
  submitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  viewAll: {
    fontSize: 13,
    color: AppColors.b500,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.n300,
    marginRight: s(12),
  },
  studentName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  statusTag: {
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.n50,
    borderRadius: s(12),
    marginBottom: vs(20),
  },
  emptyChartText: {
    color: AppColors.n500,
    fontSize: s(14),
  },
  emptyContainer: {
    paddingVertical: vs(40),
    alignItems: 'center',
  },
  emptyText: {
    color: AppColors.n500,
    fontSize: s(14),
  },
});
