import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { DashboardOverview, ChartData } from '../../api/adminDashboardService';

interface AcademicTabProps {
  overview: DashboardOverview;
  chartData: ChartData;
}

const AcademicTab: React.FC<AcademicTabProps> = ({ overview, chartData }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Academic Statistics */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Academic Statistics</AppText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.pr500 }]}>
              {overview.academic.totalSemesters}
            </AppText>
            <AppText style={styles.statLabel}>Total Semesters</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.g500 }]}>
              {overview.academic.activeSemesters}
            </AppText>
            <AppText style={styles.statLabel}>Active Semesters</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.b500 }]}>
              {overview.academic.totalClasses}
            </AppText>
            <AppText style={styles.statLabel}>Total Classes</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: AppColors.pur500 }]}>
              {overview.academic.totalCourses}
            </AppText>
            <AppText style={styles.statLabel}>Total Courses</AppText>
          </View>
        </View>
      </View>

      {/* Detailed Information */}
      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Details</AppText>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Total Students:</AppText>
          <AppText style={styles.infoValue}>{overview.academic.totalStudents}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Total Lecturers:</AppText>
          <AppText style={styles.infoValue}>{overview.academic.totalLecturers}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Course Elements:</AppText>
          <AppText style={styles.infoValue}>{overview.academic.totalCourseElements}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Avg Students/Class:</AppText>
          <AppText style={styles.infoValue}>
            {overview.academic.averageStudentsPerClass.toFixed(1)}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Student/Lecturer Ratio:</AppText>
          <AppText style={styles.infoValue}>
            {overview.academic.studentToLecturerRatio.toFixed(1)}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Classes Overloaded:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.r500 }]}>
            {overview.academic.classesOverloaded}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Classes Without Students:</AppText>
          <AppText style={[styles.infoValue, { color: AppColors.y500 }]}>
            {overview.academic.classesWithoutStudents}
          </AppText>
        </View>
      </View>

      {/* Classes by Semester */}
      {overview.academic.classesBySemester.length > 0 && (
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Classes by Semester</AppText>
          {overview.academic.classesBySemester.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.semesterItem}>
              <AppText style={styles.semesterName}>{item.semesterName}</AppText>
              <View style={styles.semesterStats}>
                <AppText style={styles.semesterStatText}>
                  {item.classCount} classes, {item.studentCount} students
                </AppText>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Top Classes by Students */}
      {overview.academic.topClassesByStudents.length > 0 && (
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Top Classes by Students</AppText>
          {overview.academic.topClassesByStudents.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.classItem}>
              <View style={styles.classHeader}>
                <AppText style={styles.classCode}>{item.classCode}</AppText>
                <AppText style={styles.classStudents}>{item.studentCount} students</AppText>
              </View>
              <AppText style={styles.classCourse}>{item.courseName}</AppText>
              <AppText style={styles.classLecturer}>Lecturer: {item.lecturerName}</AppText>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default AcademicTab;

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
  semesterItem: {
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  semesterName: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n900,
    marginBottom: vs(5),
  },
  semesterStats: {
    flexDirection: 'row',
  },
  semesterStatText: {
    fontSize: s(12),
    color: AppColors.n600,
  },
  classItem: {
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.n200,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(5),
  },
  classCode: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n900,
  },
  classStudents: {
    fontSize: s(12),
    color: AppColors.pr500,
    fontWeight: '600',
  },
  classCourse: {
    fontSize: s(13),
    color: AppColors.n700,
    marginBottom: vs(3),
  },
  classLecturer: {
    fontSize: s(12),
    color: AppColors.n600,
  },
});

