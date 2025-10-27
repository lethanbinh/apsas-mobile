import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { s, vs } from 'react-native-size-matters';
import { EditIcon, PassIcon } from '../assets/icons/icon';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import AppText from '../components/texts/AppText';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

const screenWidth = Dimensions.get('window').width;

const DashboardTeacherScreen = () => {
  const chartData = {
    labels: ['Phong', 'Binh', 'Tam', 'An', 'Huy', 'Chau'],
    datasets: [
      {
        data: [1, 4, 2, 7, 5, 10],
        color: () => AppColors.pr500, // màu line
        strokeWidth: 3,
      },
    ],
  };

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
              <AppText style={styles.statNumber}>20</AppText>
              <AppText style={styles.statLabel}>Students Submit</AppText>
            </View>
            <View>
              <EditIcon />
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FF969B' }]}>
            <View>
              <AppText style={[styles.statNumber, { color: AppColors.white }]}>
                5
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
        <AppText style={styles.averageScore}>7.5</AppText>

        <LineChart
          data={chartData}
          width={screenWidth - s(32)}
          height={220}
          fromZero
          chartConfig={{
            backgroundColor: AppColors.white,
            backgroundGradientFrom: AppColors.white,
            backgroundGradientTo: AppColors.white,
            decimalPlaces: 0,
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

        <SectionHeader
          title="Student submits"
          buttonText="View All"
          style={{
            paddingVertical: vs(10),
          }}
        />

        {/* List */}
        <View style={styles.studentItem}>
          <View style={styles.avatar} />
          <AppText style={styles.studentName}>Le Thanh Binh</AppText>
          <View style={[styles.statusTag, { backgroundColor: AppColors.r100 }]}>
            <AppText style={[styles.statusText, { color: AppColors.r500 }]}>
              Not submitted
            </AppText>
          </View>
        </View>

        <View style={styles.studentItem}>
          <View style={styles.avatar} />
          <AppText style={styles.studentName}>Nguyen Thanh Phong</AppText>
          <View style={[styles.statusTag, { backgroundColor: AppColors.g100 }]}>
            <AppText style={[styles.statusText, { color: AppColors.g500 }]}>
              Submitted
            </AppText>
          </View>
        </View>

        <View style={styles.studentItem}>
          <View style={styles.avatar} />
          <AppText style={styles.studentName}>Le Thu An</AppText>
          <View
            style={[styles.statusTag, { backgroundColor: AppColors.pr100 }]}
          >
            <AppText style={[styles.statusText, { color: AppColors.pr500 }]}>
              Submitted late
            </AppText>
          </View>
        </View>
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
});
