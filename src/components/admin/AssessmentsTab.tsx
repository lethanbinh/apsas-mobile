import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { BarChart } from 'react-native-gifted-charts';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { DashboardOverview, ChartData } from '../../api/adminDashboardService';

interface AssessmentsTabProps {
  overview: DashboardOverview;
  chartData: ChartData;
}

const AssessmentsTab: React.FC<AssessmentsTabProps> = ({ overview, chartData }) => {
  const assessmentTypeData = [
    {
      value: overview.assessments.byType.assignment,
      label: 'Asm',
      frontColor: AppColors.b500,
    },
    {
      value: overview.assessments.byType.lab,
      label: 'Lab',
      frontColor: AppColors.g500,
    },
    {
      value: overview.assessments.byType.practicalExam,
      label: 'PE',
      frontColor: AppColors.pur500,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Assessment Statistics */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Assessment Statistics</AppText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.pr500 }]}>
              {overview.assessments.totalTemplates}
            </AppText>
            <AppText style={styles.statLabel}>Templates</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.g500 }]}>
              {overview.assessments.totalClassAssessments}
            </AppText>
            <AppText style={styles.statLabel}>Class Assessments</AppText>
          </View>
        </View>
      </View>

      {/* Assessment Types */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Assessment Types</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={assessmentTypeData}
            barWidth={40}
            spacing={50}
            roundedTop
            noOfSections={4}
            width={assessmentTypeData.length * 120}
            yAxisTextStyle={{ color: AppColors.n700 }}
            xAxisLabelTextStyle={{ color: AppColors.n700, fontSize: 12 }}
          />
        </ScrollView>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.b500 }]} />
            <AppText style={styles.legendText}>
              Assignment: {overview.assessments.byType.assignment}
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.g500 }]} />
            <AppText style={styles.legendText}>Lab: {overview.assessments.byType.lab}</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.pur500 }]} />
            <AppText style={styles.legendText}>
              PE: {overview.assessments.byType.practicalExam}
            </AppText>
          </View>
        </View>
      </View>

      {/* Assessment Status */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Assessment Status</AppText>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Active:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.g500 }]}>
            {overview.assessments.assessmentsByStatus.active}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Completed:</AppText>
          <AppText style={styles.infoValue}>
            {overview.assessments.assessmentsByStatus.completed}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Pending:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.y500 }]}>
            {overview.assessments.assessmentsByStatus.pending}
          </AppText>
        </View>
      </View>

      {/* Assessment Details */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Details</AppText>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Avg Submissions/Assessment:</AppText>
          <AppText style={styles.infoValue}>
            {overview.assessments.averageSubmissionsPerAssessment.toFixed(1)}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Assessments Without Submissions:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.r500 }]}>
            {overview.assessments.assessmentsWithoutSubmissions}
          </AppText>
        </View>
      </View>

      {/* Top Assessments by Submissions */}
      {overview.assessments.topAssessmentsBySubmissions.length > 0 && (
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Top Assessments by Submissions</AppText>
          {overview.assessments.topAssessmentsBySubmissions.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.assessmentItem}>
              <View style={styles.assessmentHeader}>
                <AppText style={styles.assessmentName}>{item.name}</AppText>
                <AppText style={styles.assessmentCount}>{item.submissionCount} submissions</AppText>
              </View>
              <AppText style={styles.assessmentCourse}>{item.courseName}</AppText>
              <AppText style={styles.assessmentLecturer}>Lecturer: {item.lecturerName}</AppText>
            </View>
          ))}
        </View>
      )}

      {/* Upcoming Deadlines */}
      {overview.assessments.upcomingDeadlines.length > 0 && (
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Upcoming Deadlines</AppText>
          {overview.assessments.upcomingDeadlines.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.deadlineItem}>
              <View style={styles.deadlineHeader}>
                <AppText style={styles.deadlineName}>{item.name}</AppText>
                <AppText style={[styles.deadlineDays, { color: AppColors.r500 }]}>
                  {item.daysRemaining} days
                </AppText>
              </View>
              <AppText style={styles.deadlineDate}>
                {new Date(item.endAt).toLocaleDateString()}
              </AppText>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default AssessmentsTab;

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
  assessmentItem: {
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(5),
  },
  assessmentName: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n900,
    flex: 1,
  },
  assessmentCount: {
    fontSize: s(12),
    color: AppColors.pr500,
    fontWeight: '600',
  },
  assessmentCourse: {
    fontSize: s(13),
    color: AppColors.n700,
    marginBottom: vs(3),
  },
  assessmentLecturer: {
    fontSize: s(12),
    color: AppColors.n600,
  },
  deadlineItem: {
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  deadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(5),
  },
  deadlineName: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n900,
    flex: 1,
  },
  deadlineDays: {
    fontSize: s(12),
    fontWeight: '600',
  },
  deadlineDate: {
    fontSize: s(12),
    color: AppColors.n600,
  },
});

