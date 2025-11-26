import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { BarChart } from 'react-native-gifted-charts';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { DashboardOverview, ChartData } from '../../api/adminDashboardService';

interface SubmissionsTabProps {
  overview: DashboardOverview;
  chartData: ChartData;
}

const SubmissionsTab: React.FC<SubmissionsTabProps> = ({ overview, chartData }) => {
  const submissionTypeData = [
    {
      value: overview.submissions.submissionsByType.assignment,
      label: 'Asm',
      frontColor: AppColors.b500,
    },
    {
      value: overview.submissions.submissionsByType.lab,
      label: 'Lab',
      frontColor: AppColors.g500,
    },
    {
      value: overview.submissions.submissionsByType.practicalExam,
      label: 'PE',
      frontColor: AppColors.pur500,
    },
  ];

  const submissionStatusData = chartData.submissionStatus.map((item, index) => ({
    value: item.count,
    label: item.status.substring(0, 3),
    frontColor: index === 0 ? AppColors.g500 : index === 1 ? AppColors.y500 : AppColors.r500,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Submission Statistics */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Submission Statistics</AppText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.pr500 }]}>
              {overview.submissions.total}
            </AppText>
            <AppText style={styles.statLabel}>Total</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.g500 }]}>
              {overview.submissions.graded}
            </AppText>
            <AppText style={styles.statLabel}>Graded</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.y500 }]}>
              {overview.submissions.pending}
            </AppText>
            <AppText style={styles.statLabel}>Pending</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.r500 }]}>
              {overview.submissions.notSubmitted}
            </AppText>
            <AppText style={styles.statLabel}>Not Submitted</AppText>
          </View>
        </View>
      </View>

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

      {/* Submission Types */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Submissions by Type</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={submissionTypeData}
            barWidth={40}
            spacing={50}
            roundedTop
            noOfSections={4}
            width={submissionTypeData.length * 120}
            yAxisTextStyle={{ color: AppColors.n700 }}
            xAxisLabelTextStyle={{ color: AppColors.n700, fontSize: 12 }}
          />
        </ScrollView>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.b500 }]} />
            <AppText style={styles.legendText}>
              Assignment: {overview.submissions.submissionsByType.assignment}
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.g500 }]} />
            <AppText style={styles.legendText}>
              Lab: {overview.submissions.submissionsByType.lab}
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.pur500 }]} />
            <AppText style={styles.legendText}>
              PE: {overview.submissions.submissionsByType.practicalExam}
            </AppText>
          </View>
        </View>
      </View>

      {/* Grade Information */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Grade Information</AppText>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Average Grade:</AppText>
          <AppText style={styles.infoValue}>
            {overview.submissions.averageGrade.toFixed(2)}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Completion Rate:</AppText>
          <AppText style={styles.infoValue}>
            {overview.submissions.completionRate.toFixed(1)}%
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>On Time:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.g500 }]}>
            {overview.submissions.onTimeSubmissions}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Late:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.r500 }]}>
            {overview.submissions.lateSubmissions}
          </AppText>
        </View>
      </View>

      {/* Grade Ranges */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Grade Ranges</AppText>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Excellent (≥8.5):</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.g500 }]}>
            {overview.submissions.submissionsByGradeRange.excellent}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Good (7.0-8.4):</AppText>
          <AppText style={styles.infoValue}>
            {overview.submissions.submissionsByGradeRange.good}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Average (5.5-6.9):</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.y500 }]}>
            {overview.submissions.submissionsByGradeRange.average}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Below Average (&lt;5.5):</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.r500 }]}>
            {overview.submissions.submissionsByGradeRange.belowAverage}
          </AppText>
        </View>
      </View>

      {/* Top Students by Submissions */}
      {overview.submissions.topStudentsBySubmissions.length > 0 && (
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Top Students by Submissions</AppText>
          {overview.submissions.topStudentsBySubmissions.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.studentItem}>
              <View style={styles.studentHeader}>
                <AppText style={styles.studentName}>{item.studentName}</AppText>
                <AppText style={styles.studentCount}>{item.submissionCount} submissions</AppText>
              </View>
              <View style={styles.studentInfo}>
                <AppText style={styles.studentCode}>{item.studentCode}</AppText>
                <AppText style={styles.studentGrade}>
                  Avg: {item.averageGrade.toFixed(2)}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default SubmissionsTab;

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
  studentItem: {
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(5),
  },
  studentName: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n900,
    flex: 1,
  },
  studentCount: {
    fontSize: s(12),
    color: AppColors.pr500,
    fontWeight: '600',
  },
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentCode: {
    fontSize: s(12),
    color: AppColors.n600,
  },
  studentGrade: {
    fontSize: s(12),
    color: AppColors.g500,
    fontWeight: '600',
  },
});

