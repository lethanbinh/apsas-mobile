import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { BarChart } from 'react-native-gifted-charts';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { DashboardOverview, ChartData } from '../../api/adminDashboardService';

interface OverviewTabProps {
  overview: DashboardOverview;
  chartData: ChartData;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ overview, chartData }) => {
  // Prepare chart data for user growth
  const userGrowthData = chartData.userGrowth.map((item, index) => ({
    value: item.total,
    label: item.month.split('-')[1] || '',
    frontColor: AppColors.pr500,
    topLabelComponent: () => (
      <AppText style={styles.chartLabel}>{item.total}</AppText>
    ),
  }));

  // Prepare assessment distribution data
  const assessmentDistributionData = chartData.assessmentDistribution.map((item, index) => ({
    value: item.count,
    label: item.type.substring(0, 3),
    frontColor: index === 0 ? AppColors.b500 : index === 1 ? AppColors.g500 : AppColors.pur500,
  }));

  // Prepare submission status data
  const submissionStatusData = chartData.submissionStatus.map((item, index) => ({
    value: item.count,
    label: item.status.substring(0, 3),
    frontColor: index === 0 ? AppColors.g500 : index === 1 ? AppColors.y500 : AppColors.r500,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Key Statistics */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Key Statistics</AppText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.pr500 }]}>
              {overview.users.total}
            </AppText>
            <AppText style={styles.statLabel}>Total Users</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.g500 }]}>
              {overview.academic.totalClasses}
            </AppText>
            <AppText style={styles.statLabel}>Total Classes</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.b500 }]}>
              {overview.submissions.total}
            </AppText>
            <AppText style={styles.statLabel}>Submissions</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.pur500 }]}>
              {overview.assessments.totalTemplates}
            </AppText>
            <AppText style={styles.statLabel}>Templates</AppText>
          </View>
        </View>
      </View>

      {/* User Statistics */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Users</AppText>
        <View style={styles.usersRow}>
          <View style={styles.userItem}>
            <AppText style={[styles.userNumber, { color: AppColors.pr500 }]}>
              {overview.users.total}
            </AppText>
            <AppText style={styles.userLabel}>Total</AppText>
          </View>
          <View style={styles.userItem}>
            <AppText style={[styles.userNumber, { color: AppColors.g500 }]}>
              {overview.users.active}
            </AppText>
            <AppText style={styles.userLabel}>Active</AppText>
          </View>
          <View style={styles.userItem}>
            <AppText style={[styles.userNumber, { color: AppColors.p500 }]}>
              {overview.users.byRole.lecturer}
            </AppText>
            <AppText style={styles.userLabel}>Lecturers</AppText>
          </View>
          <View style={styles.userItem}>
            <AppText style={[styles.userNumber, { color: AppColors.b500 }]}>
              {overview.users.byRole.student}
            </AppText>
            <AppText style={styles.userLabel}>Students</AppText>
          </View>
        </View>
      </View>

      {/* Academic Statistics */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Academic</AppText>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Active Semesters:</AppText>
          <AppText style={styles.infoValue}>{overview.academic.activeSemesters}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Total Courses:</AppText>
          <AppText style={styles.infoValue}>{overview.academic.totalCourses}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Total Students:</AppText>
          <AppText style={styles.infoValue}>{overview.academic.totalStudents}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Avg Students/Class:</AppText>
          <AppText style={styles.infoValue}>
            {overview.academic.averageStudentsPerClass.toFixed(1)}
          </AppText>
        </View>
      </View>

      {/* Submissions Statistics */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Submissions</AppText>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Total:</AppText>
          <AppText style={styles.infoValue}>{overview.submissions.total}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Graded:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.g500 }]}>
            {overview.submissions.graded}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Pending:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.y500 }]}>
            {overview.submissions.pending}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Completion Rate:</AppText>
          <AppText style={styles.infoValue}>
            {overview.submissions.completionRate.toFixed(1)}%
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Average Grade:</AppText>
          <AppText style={styles.infoValue}>
            {overview.submissions.averageGrade.toFixed(2)}
          </AppText>
        </View>
      </View>

      {/* Grading Statistics */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Grading</AppText>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Grading Groups:</AppText>
          <AppText style={styles.infoValue}>{overview.grading.totalGradingGroups}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Grading Sessions:</AppText>
          <AppText style={styles.infoValue}>{overview.grading.totalGradingSessions}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Completed:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.g500 }]}>
            {overview.grading.completedGradingSessions}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Pending Requests:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.r500 }]}>
            {overview.grading.pendingAssignRequests}
          </AppText>
        </View>
      </View>

      {/* Assessment Distribution Chart */}
      {assessmentDistributionData.length > 0 && (
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Assessment Distribution</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={assessmentDistributionData}
              barWidth={40}
              spacing={50}
              roundedTop
              noOfSections={4}
              width={assessmentDistributionData.length * 120}
              yAxisTextStyle={{ color: AppColors.n700 }}
              xAxisLabelTextStyle={{ color: AppColors.n700, fontSize: 12 }}
            />
          </ScrollView>
          <View style={styles.legendContainer}>
            {chartData.assessmentDistribution.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendBox,
                    {
                      backgroundColor:
                        index === 0
                          ? AppColors.b500
                          : index === 1
                            ? AppColors.g500
                            : AppColors.pur500,
                    },
                  ]}
                />
                <AppText style={styles.legendText}>{item.type}</AppText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Submission Status Chart */}
      {submissionStatusData.length > 0 && (
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Submission Status</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={submissionStatusData}
              barWidth={40}
              spacing={50}
              roundedTop
              noOfSections={4}
              width={submissionStatusData.length * 120}
              yAxisTextStyle={{ color: AppColors.n700 }}
              xAxisLabelTextStyle={{ color: AppColors.n700, fontSize: 12 }}
            />
          </ScrollView>
          <View style={styles.legendContainer}>
            {chartData.submissionStatus.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendBox,
                    {
                      backgroundColor:
                        index === 0
                          ? AppColors.g500
                          : index === 1
                            ? AppColors.y500
                            : AppColors.r500,
                    },
                  ]}
                />
                <AppText style={styles.legendText}>{item.status}</AppText>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default OverviewTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: s(20),
    paddingBottom: vs(40),
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: s(12),
    padding: s(15),
    marginBottom: vs(20),
    shadowColor: AppColors.black,
    shadowOpacity: 0.1,
    shadowRadius: s(6),
    elevation: 3,
  },
  cardTitle: {
    fontSize: s(16),
    fontWeight: '600',
    color: AppColors.n900,
    marginBottom: vs(15),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: vs(15),
  },
  statNumber: {
    fontSize: s(24),
    fontWeight: '700',
    marginBottom: vs(5),
  },
  statLabel: {
    fontSize: s(12),
    color: AppColors.n600,
    textAlign: 'center',
  },
  usersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userItem: {
    alignItems: 'center',
  },
  userNumber: {
    fontSize: s(20),
    fontWeight: '700',
    marginBottom: vs(5),
  },
  userLabel: {
    fontSize: s(12),
    color: AppColors.n600,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(8),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  infoLabel: {
    fontSize: s(14),
    color: AppColors.n700,
  },
  infoValue: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n900,
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: vs(10),
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: s(8),
    marginVertical: vs(5),
  },
  legendBox: {
    width: s(14),
    height: s(14),
    borderRadius: s(3),
    marginRight: s(6),
  },
  legendText: {
    fontSize: s(12),
    color: AppColors.n700,
  },
  chartLabel: {
    fontSize: s(10),
    color: AppColors.n700,
  },
});

