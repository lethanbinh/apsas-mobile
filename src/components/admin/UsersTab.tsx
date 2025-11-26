import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { BarChart } from 'react-native-gifted-charts';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { DashboardOverview, ChartData } from '../../api/adminDashboardService';

interface UsersTabProps {
  overview: DashboardOverview;
  chartData: ChartData;
}

const UsersTab: React.FC<UsersTabProps> = ({ overview, chartData }) => {
  const roleData = [
    {
      value: overview.users.byRole.admin,
      label: 'Admin',
      frontColor: AppColors.pr500,
    },
    {
      value: overview.users.byRole.lecturer,
      label: 'Lect',
      frontColor: AppColors.p500,
    },
    {
      value: overview.users.byRole.student,
      label: 'Stud',
      frontColor: AppColors.b500,
    },
    {
      value: overview.users.byRole.hod,
      label: 'HOD',
      frontColor: AppColors.g500,
    },
  ];

  const genderData = [
    {
      value: overview.users.byGender.male,
      label: 'M',
      frontColor: AppColors.b500,
    },
    {
      value: overview.users.byGender.female,
      label: 'F',
      frontColor: AppColors.p500,
    },
    {
      value: overview.users.byGender.other,
      label: 'O',
      frontColor: AppColors.n500,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* User Statistics */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>User Statistics</AppText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.pr500 }]}>
              {overview.users.total}
            </AppText>
            <AppText style={styles.statLabel}>Total Users</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.g500 }]}>
              {overview.users.active}
            </AppText>
            <AppText style={styles.statLabel}>Active</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.y500 }]}>
              {overview.users.inactive}
            </AppText>
            <AppText style={styles.statLabel}>Inactive</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.r500 }]}>
              {overview.users.neverLoggedIn}
            </AppText>
            <AppText style={styles.statLabel}>Never Logged In</AppText>
          </View>
        </View>
      </View>

      {/* Users by Role */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Users by Role</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={roleData}
            barWidth={40}
            spacing={50}
            roundedTop
            noOfSections={4}
            width={roleData.length * 120}
            yAxisTextStyle={{ color: AppColors.n700 }}
            xAxisLabelTextStyle={{ color: AppColors.n700, fontSize: 12 }}
          />
        </ScrollView>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.pr500 }]} />
            <AppText style={styles.legendText}>Admin: {overview.users.byRole.admin}</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.p500 }]} />
            <AppText style={styles.legendText}>
              Lecturer: {overview.users.byRole.lecturer}
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.b500 }]} />
            <AppText style={styles.legendText}>Student: {overview.users.byRole.student}</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.g500 }]} />
            <AppText style={styles.legendText}>HOD: {overview.users.byRole.hod}</AppText>
          </View>
        </View>
      </View>

      {/* Gender Distribution */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Gender Distribution</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={genderData}
            barWidth={40}
            spacing={50}
            roundedTop
            noOfSections={4}
            width={genderData.length * 120}
            yAxisTextStyle={{ color: AppColors.n700 }}
            xAxisLabelTextStyle={{ color: AppColors.n700, fontSize: 12 }}
          />
        </ScrollView>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.b500 }]} />
            <AppText style={styles.legendText}>Male: {overview.users.byGender.male}</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.p500 }]} />
            <AppText style={styles.legendText}>Female: {overview.users.byGender.female}</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: AppColors.n500 }]} />
            <AppText style={styles.legendText}>Other: {overview.users.byGender.other}</AppText>
          </View>
        </View>
      </View>

      {/* Profile Completion */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Profile Completion</AppText>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Users with Avatar:</AppText>
          <AppText style={styles.infoValue}>{overview.users.usersWithAvatar}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Users without Avatar:</AppText>
          <AppText style={styles.infoValue}>{overview.users.usersWithoutAvatar}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Users with Phone:</AppText>
          <AppText style={styles.infoValue}>{overview.users.usersWithPhone}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Users without Phone:</AppText>
          <AppText style={styles.infoValue}>{overview.users.usersWithoutPhone}</AppText>
        </View>
        {overview.users.averageAge && (
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Average Age:</AppText>
            <AppText style={styles.infoValue}>{overview.users.averageAge} years</AppText>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default UsersTab;

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
});

