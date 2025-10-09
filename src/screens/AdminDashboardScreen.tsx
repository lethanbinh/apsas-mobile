import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { BarChart } from 'react-native-gifted-charts';
import ScreenHeader from '../components/common/ScreenHeader';
import AppSafeView from '../components/views/AppSafeView';

const AdminDashboardScreen = () => {
  // Assessment data
  const assessmentData = [
    {
      label: 'Fall2025',
      stacks: [
        { value: 50, color: '#007bff' }, // Asm
        { value: 30, color: '#28a745' }, // Lab
        { value: 45, color: '#6f42c1' }, // PE
      ],
    },
    {
      label: 'Summer2025',
      stacks: [
        { value: 60, color: '#007bff' },
        { value: 40, color: '#28a745' },
        { value: 50, color: '#6f42c1' },
      ],
    },
    {
      label: 'Spring2025',
      stacks: [
        { value: 55, color: '#007bff' },
        { value: 35, color: '#28a745' },
        { value: 52, color: '#6f42c1' },
      ],
    },
  ];

  // Courses data
  const coursesData = [
    {
      label: 'Fall2024',
      stacks: [
        { value: 20, color: '#007bff' }, // Course
        { value: 35, color: '#28a745' }, // Lab
      ],
    },
    {
      label: 'Spring2025',
      stacks: [
        { value: 30, color: '#007bff' },
        { value: 40, color: '#28a745' },
      ],
    },
    {
      label: 'Spring2025',
      stacks: [
        { value: 28, color: '#007bff' },
        { value: 45, color: '#28a745' },
      ],
    },
    {
      label: 'Fall2025',
      stacks: [
        { value: 25, color: '#007bff' },
        { value: 60, color: '#28a745' },
      ],
    },
  ];

  return (
    <AppSafeView>
      <ScreenHeader title="Data" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Users */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Users</Text>
          <View style={styles.usersRow}>
            <View style={styles.userItem}>
              <Text style={[styles.userNumber, { color: '#007bff' }]}>100</Text>
              <Text style={styles.userLabel}>Users</Text>
            </View>
            <View style={styles.userItem}>
              <Text style={[styles.userNumber, { color: '#28a745' }]}>55</Text>
              <Text style={styles.userLabel}>Active</Text>
            </View>
            <View style={styles.userItem}>
              <Text style={[styles.userNumber, { color: '#dc3545' }]}>45</Text>
              <Text style={styles.userLabel}>Banned</Text>
            </View>
          </View>
        </View>

        {/* Assessment */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Assessment number</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              stackData={assessmentData}
              barWidth={40}
              spacing={50}
              roundedTop
              noOfSections={6}
              width={assessmentData.length * 120} // làm chart dài ra
              yAxisTextStyle={{ color: '#333' }}
              xAxisLabelTextStyle={{ color: '#333', fontSize: 12 }}
            />
          </ScrollView>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#007bff' }]} />
              <Text style={styles.legendText}>Asm</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#28a745' }]} />
              <Text style={styles.legendText}>Lab</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#6f42c1' }]} />
              <Text style={styles.legendText}>PE</Text>
            </View>
          </View>
        </View>

        {/* Courses */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Courses</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              stackData={coursesData}
              barWidth={40}
              spacing={50}
              roundedTop
              noOfSections={6}
              width={coursesData.length * 120}
              yAxisTextStyle={{ color: '#333' }}
              xAxisLabelTextStyle={{ color: '#333', fontSize: 12 }}
            />
          </ScrollView>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#007bff' }]} />
              <Text style={styles.legendText}>Course</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#28a745' }]} />
              <Text style={styles.legendText}>Lab</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppSafeView>
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  container: { padding: s(20), paddingBottom: vs(40) },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: s(15),
    marginBottom: vs(20),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: s(10) },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  viewAll: { fontSize: 13, color: '#007bff' },
  usersRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: s(10) },
  userItem: { alignItems: 'center' },
  userNumber: { fontSize: 20, fontWeight: '700' },
  userLabel: { fontSize: 13, color: '#777' },
  legendContainer: { flexDirection: 'row', marginTop: 10, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  legendBox: { width: 14, height: 14, borderRadius: 3, marginRight: 6 },
  legendText: { fontSize: 12, color: '#333' },
});
