import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { BarChart } from 'react-native-gifted-charts';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { DashboardOverview, ChartData } from '../../api/adminDashboardService';

interface GradingTabProps {
  overview: DashboardOverview;
  chartData: ChartData;
}

const GradingTab: React.FC<GradingTabProps> = ({ overview, chartData }) => {
  const gradingStatusData = [
    {
      value: overview.grading.gradingSessionsByStatus.processing,
      label: 'Proc',
      frontColor: AppColors.y500,
    },
    {
      value: overview.grading.gradingSessionsByStatus.completed,
      label: 'Done',
      frontColor: AppColors.g500,
    },
    {
      value: overview.grading.gradingSessionsByStatus.failed,
      label: 'Fail',
      frontColor: AppColors.r500,
    },
  ];

  const gradingTypeData = [
    {
      value: overview.grading.gradingSessionsByType.ai,
      label: 'AI',
      frontColor: AppColors.b500,
    },
    {
      value: overview.grading.gradingSessionsByType.lecturer,
      label: 'Lect',
      frontColor: AppColors.p500,
    },
    {
      value: overview.grading.gradingSessionsByType.both,
      label: 'Both',
      frontColor: AppColors.pur500,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Grading Statistics */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Grading Statistics</AppText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.pr500 }]}>
              {overview.grading.totalGradingGroups}
            </AppText>
            <AppText style={styles.statLabel}>Grading Groups</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.g500 }]}>
              {overview.grading.totalGradingSessions}
            </AppText>
            <AppText style={styles.statLabel}>Grading Sessions</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.b500 }]}>
              {overview.grading.completedGradingSessions}
            </AppText>
            <AppText style={styles.statLabel}>Completed</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.r500 }]}>
              {overview.grading.pendingAssignRequests}
            </AppText>
            <AppText style={styles.statLabel}>Pending Requests</AppText>
          </View>
        </View>
      </View>

      {/* Grading Status */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Grading Sessions by Status</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={gradingStatusData}
            barWidth={40}
            spacing={50}
            roundedTop
            noOfSections={4}
            width={gradingStatusData.length * 120}
            yAxisTextStyle={{ color: AppColors.n700 }}
            xAxisLabelTextStyle={{ color: AppColors.n700, fontSize: 12 }}
          />
        </ScrollView>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.y500 }]} />
            <AppText style={styles.legendText}>
              Processing: {overview.grading.gradingSessionsByStatus.processing}
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.g500 }]} />
            <AppText style={styles.legendText}>
              Completed: {overview.grading.gradingSessionsByStatus.completed}
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.r500 }]} />
            <AppText style={styles.legendText}>
              Failed: {overview.grading.gradingSessionsByStatus.failed}
            </AppText>
          </View>
        </View>
      </View>

      {/* Grading Types */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Grading Sessions by Type</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={gradingTypeData}
            barWidth={40}
            spacing={50}
            roundedTop
            noOfSections={4}
            width={gradingTypeData.length * 120}
            yAxisTextStyle={{ color: AppColors.n700 }}
            xAxisLabelTextStyle={{ color: AppColors.n700, fontSize: 12 }}
          />
        </ScrollView>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.b500 }]} />
            <AppText style={styles.legendText}>
              AI: {overview.grading.gradingSessionsByType.ai}
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.p500 }]} />
            <AppText style={styles.legendText}>
              Lecturer: {overview.grading.gradingSessionsByType.lecturer}
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.pur500 }]} />
            <AppText style={styles.legendText}>
              Both: {overview.grading.gradingSessionsByType.both}
            </AppText>
          </View>
        </View>
      </View>

      {/* Grading Groups Status */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Grading Groups Status</AppText>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Active:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.g500 }]}>
            {overview.grading.gradingGroupsByStatus.active}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Completed:</AppText>
          <AppText style={styles.infoValue}>
            {overview.grading.gradingGroupsByStatus.completed}
          </AppText>
        </View>
      </View>

      {/* Pending Assign Requests by Lecturer */}
      {overview.grading.pendingAssignRequestsByLecturer.length > 0 && (
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Pending Requests by Lecturer</AppText>
          {overview.grading.pendingAssignRequestsByLecturer.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.lecturerItem}>
              <View style={styles.lecturerHeader}>
                <AppText style={styles.lecturerName}>{item.lecturerName}</AppText>
                <AppText style={[styles.lecturerCount, { color: AppColors.r500 }]}>
                  {item.requestCount} requests
                </AppText>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Grading by Lecturer */}
      {overview.grading.gradingByLecturer.length > 0 && (
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Grading by Lecturer</AppText>
          {overview.grading.gradingByLecturer.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.lecturerItem}>
              <View style={styles.lecturerHeader}>
                <AppText style={styles.lecturerName}>{item.lecturerName}</AppText>
                <AppText style={styles.lecturerCount}>
                  {item.completedCount}/{item.sessionCount} completed
                </AppText>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Average Grading Time */}
      {overview.grading.averageGradingTime && (
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Performance</AppText>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Average Grading Time:</AppText>
            <AppText style={styles.infoValue}>
              {overview.grading.averageGradingTime.toFixed(1)} hours
            </AppText>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default GradingTab;

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
  lecturerItem: {
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  lecturerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lecturerName: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n900,
    flex: 1,
  },
  lecturerCount: {
    fontSize: s(12),
    fontWeight: '600',
  },
});

