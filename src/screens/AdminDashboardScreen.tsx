import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { s, vs } from 'react-native-size-matters';
import { accountService } from '../api/accountService';
import { fetchLecturerList } from '../api/lecturerService';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { assessmentData, coursesData } from '../data/adminData';
import { AppColors } from '../styles/color';

const AdminDashboardScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [bannedUsers, setBannedUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch all users
        const usersResult = await accountService.getAccountList(1, 9999);
        const allUsers = usersResult.users || [];
        setTotalUsers(allUsers.length);

        // Count teachers (lecturers)
        const lecturers = await fetchLecturerList();
        setTotalTeachers(lecturers.length || 0);

        // Count active and banned (assuming all users are active for now)
        setActiveUsers(allUsers.length);
        setBannedUsers(0);
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        showErrorToast('Error', 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AppSafeView>
      <ScreenHeader title="Dashboard" />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {/* Users */}
          <View style={styles.card}>
            <AppText style={styles.cardTitle}>Users</AppText>
            <View style={styles.usersRow}>
              <View style={styles.userItem}>
                <AppText style={[styles.userNumber, { color: AppColors.pr500 }]}>
                  {totalUsers}
                </AppText>
                <AppText style={styles.userLabel}>Users</AppText>
              </View>
              <View style={styles.userItem}>
                <AppText style={[styles.userNumber, { color: AppColors.p500 }]}>
                  {totalTeachers}
                </AppText>
                <AppText style={styles.userLabel}>Teacher</AppText>
              </View>
              <View style={styles.userItem}>
                <AppText style={[styles.userNumber, { color: AppColors.pr500 }]}>
                  {activeUsers}
                </AppText>
                <AppText style={styles.userLabel}>Active</AppText>
              </View>
              <View style={styles.userItem}>
                <AppText style={[styles.userNumber, { color: AppColors.p500 }]}>
                  {bannedUsers}
                </AppText>
                <AppText style={styles.userLabel}>Banded</AppText>
              </View>
            </View>
          </View>

          {/* Assessment */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText style={styles.cardTitle}>Assessment number</AppText>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                stackData={assessmentData}
                barWidth={40}
                spacing={50}
                roundedTop
                noOfSections={6}
                width={assessmentData.length * 120}
                yAxisTextStyle={{ color: AppColors.n700 }}
                xAxisLabelTextStyle={{ color: AppColors.n700, fontSize: 12 }}
              />
            </ScrollView>

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, { backgroundColor: AppColors.b500 }]}
                />
                <AppText style={styles.legendText}>Asm</AppText>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, { backgroundColor: AppColors.g500 }]}
                />
                <AppText style={styles.legendText}>Lab</AppText>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, { backgroundColor: AppColors.pur500 }]}
                />
                <AppText style={styles.legendText}>PE</AppText>
              </View>
            </View>
          </View>

          {/* Courses */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText style={styles.cardTitle}>Courses</AppText>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                stackData={coursesData}
                barWidth={40}
                spacing={50}
                roundedTop
                noOfSections={6}
                width={coursesData.length * 120}
                yAxisTextStyle={{ color: AppColors.n700 }}
                xAxisLabelTextStyle={{ color: AppColors.n700, fontSize: 12 }}
              />
            </ScrollView>

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, { backgroundColor: AppColors.pur500 }]}
                />
                <AppText style={styles.legendText}>Course</AppText>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, { backgroundColor: AppColors.g500 }]}
                />
                <AppText style={styles.legendText}>Lab</AppText>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </AppSafeView>
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  container: { padding: s(20), paddingBottom: vs(40) },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: s(10),
  },
  cardTitle: {
    fontSize: s(16),
    fontWeight: '600',
    color: AppColors.n900,
  },
  viewAll: {
    fontSize: s(13),
    color: AppColors.pr500,
  },
  usersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: s(10),
  },
  userItem: {
    alignItems: 'center',
  },
  userNumber: {
    fontSize: s(20),
    fontWeight: '700',
  },
  userLabel: {
    fontSize: s(13),
    color: AppColors.n500,
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: vs(10),
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: s(10),
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
});
