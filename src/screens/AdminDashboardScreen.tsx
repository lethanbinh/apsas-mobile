import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { s, vs } from 'react-native-size-matters';
import ScreenHeader from '../components/common/ScreenHeader';
import AppText from '../components/texts/AppText';
import { showErrorToast } from '../components/toasts/AppToast';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { adminDashboardService, DashboardOverview, ChartData } from '../api/adminDashboardService';
import Tabs from '../components/common/Tabs';
import OverviewTab from '../components/admin/OverviewTab';
import UsersTab from '../components/admin/UsersTab';
import AcademicTab from '../components/admin/AcademicTab';
import AssessmentsTab from '../components/admin/AssessmentsTab';
import SubmissionsTab from '../components/admin/SubmissionsTab';
import GradingTab from '../components/admin/GradingTab';

const AdminDashboardScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [overviewData, chartDataResult] = await Promise.all([
        adminDashboardService.getDashboardOverview(),
        adminDashboardService.getChartData(),
      ]);
      setOverview(overviewData);
      setChartData(chartDataResult);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      showErrorToast('Error', 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'academic', label: 'Academic' },
    { key: 'assessments', label: 'Assessments' },
    { key: 'submissions', label: 'Submissions' },
    { key: 'grading', label: 'Grading' },
  ];

  const renderTabContent = () => {
    if (!overview || !chartData) {
      return null;
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab overview={overview} chartData={chartData} />;
      case 'users':
        return <UsersTab overview={overview} chartData={chartData} />;
      case 'academic':
        return <AcademicTab overview={overview} chartData={chartData} />;
      case 'assessments':
        return <AssessmentsTab overview={overview} chartData={chartData} />;
      case 'submissions':
        return <SubmissionsTab overview={overview} chartData={chartData} />;
      case 'grading':
        return <GradingTab overview={overview} chartData={chartData} />;
      default:
        return <OverviewTab overview={overview} chartData={chartData} />;
    }
  };

  return (
    <AppSafeView>
      <ScreenHeader title="Admin Dashboard" />
      {isLoading && !overview ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.pr500} />
          <AppText style={styles.loadingText}>Loading dashboard data...</AppText>
        </View>
      ) : (
        <>
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}
            >
              <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
            </ScrollView>
          </View>
          <ScrollView
            style={styles.contentContainer}
            contentContainerStyle={styles.contentScrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {renderTabContent()}
          </ScrollView>
        </>
      )}
    </AppSafeView>
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  loadingText: {
    marginTop: vs(10),
    fontSize: s(14),
    color: AppColors.n600,
  },
  tabsContainer: {
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
    paddingVertical: vs(10),
  },
  tabsScrollContent: {
    paddingHorizontal: s(20),
  },
  contentContainer: {
    flex: 1,
  },
  contentScrollContent: {
    paddingBottom: vs(40),
  },
});
