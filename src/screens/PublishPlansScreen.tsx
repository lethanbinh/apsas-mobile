import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import AppSafeView from '../components/views/AppSafeView';
import { globalStyles } from '../styles/shareStyles';

const sheet1 = [
  {
    No: '1',
    'Student ID': 'SE150001',
    Name: 'Nguyen Van A',
    Class: 'SE1501',
    'Date of Birth': '2001-01-01',
    Email: 'vana@example.com',
  },
  {
    No: '2',
    'Student ID': 'SE150002',
    Name: 'Tran Thi B',
    Class: 'SE1501',
    'Date of Birth': '2001-02-02',
    Email: 'thib@example.com',
  },
  {
    No: '3',
    'Student ID': 'SE150003',
    Name: 'Le Van C',
    Class: 'SE1502',
    'Date of Birth': '2001-03-03',
    Email: 'vanc@example.com',
  },
];

const sheet2 = [
  {
    'Course ID': 'PRJ301',
    'Course Name': 'Java Web',
    Credits: '3',
    Lecturer: 'Nguyen Van D',
    Semester: 'Summer 2025',
  },
  {
    'Course ID': 'DBI202',
    'Course Name': 'Database',
    Credits: '3',
    Lecturer: 'Tran Van E',
    Semester: 'Summer 2025',
  },
];

const sheet3 = [
  {
    Class: 'SE1501',
    'Number of Students': '35',
    Labs: '10',
    Assignments: '5',
    'Practical Exam': '1',
  },
  {
    Class: 'SE1502',
    'Number of Students': '40',
    Labs: '12',
    Assignments: '6',
    'Practical Exam': '1',
  },
];

const sheet4 = [
  { Email: 'vana@example.com', Midterm: '7', Final: '8', GPA: '7.5' },
  { Email: 'thib@example.com', Midterm: '6', Final: '9', GPA: '7.5' },
];

const PublishPlansScreen = () => {
  return (
    <AppSafeView>
      <ScreenHeader title="Plan Detail" />
      <ScrollView style={globalStyles.containerStyle}>
        <TableSection title="Students" data={sheet1} />
        <TableSection title="Courses" data={sheet2} />
        <TableSection title="Classes" data={sheet3} />
        <TableSection title="Assignments" data={sheet4} />
      </ScrollView>
    </AppSafeView>
  );
};

const TableSection = ({ title, data }: { title: string; data: any[] }) => {
  const [viewAll, setViewAll] = useState(false);
  const columns = Object.keys(data[0]);
  const visibleData = viewAll ? data : data.slice(0, 3);

  return (
    <View style={styles.section}>
      <SectionHeader
        style={{ marginBottom: vs(10) }}
        title={title}
        buttonText={viewAll ? 'Collapse' : 'View All'}
        onPress={() => setViewAll(!viewAll)}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          {/* Header */}
          <View style={styles.rowHeader}>
            {columns.map((col, i) => (
              <Text key={i} style={[styles.cell, styles.headerText]}>
                {col}
              </Text>
            ))}
          </View>

          {/* Rows */}
          {visibleData.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {columns.map((col, colIndex) => (
                <Text key={colIndex} style={styles.cell}>
                  {row[col]}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default PublishPlansScreen;

const styles = StyleSheet.create({
  section: {
    marginBottom: vs(20),
    borderRadius: 6,
    paddingVertical: vs(10),
  },
  rowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cell: {
    minWidth: s(120),
    padding: s(10),
    borderRightWidth: 1,
    borderColor: '#ddd',
    fontSize: 13,
    textAlignVertical: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    backgroundColor: '#e0e0e0',
  },
});
