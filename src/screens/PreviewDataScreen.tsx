import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import ScreenHeader from '../components/common/ScreenHeader';
import SectionHeader from '../components/common/SectionHeader';
import AppSafeView from '../components/views/AppSafeView';
import { globalStyles } from '../styles/shareStyles';
import AppButton from '../components/buttons/AppButton';
import { AppColors } from '../styles/color';
import { NavigationLarge } from '../assets/icons/icon';
import { useRoute } from '@react-navigation/native';
import AppText from '../components/texts/AppText';

type SheetData = { [key: string]: any[] };
type ExcelData = {
  [fileKey: string]: SheetData | null; // e.g., { semesterCourse: {...}, classTemplate: {...} }
};

const PreviewDataScreen = () => {
  const route = useRoute();
  const excelData = (route.params as { excelData?: ExcelData })?.excelData;

  // Lấy tên các file (ví dụ: 'semesterCourse', 'classTemplate')
  const fileKeys = excelData ? Object.keys(excelData) : [];

  if (
    !excelData ||
    fileKeys.length === 0 ||
    Object.values(excelData).every(v => v === null)
  ) {
    return (
      <AppSafeView>
        <ScreenHeader title="Plan Detail" />
        <View style={styles.emptyContainer}>
          <AppText variant="h5">No Data to Preview</AppText>
          <AppText style={styles.emptyText}>
            Please go back and upload valid Excel files.
          </AppText>
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader title="Plan Detail" />
      <ScrollView style={globalStyles.containerStyle}>
        {/* Lặp qua từng file (semesterCourse, classTemplate) */}
        {fileKeys.map(fileKey => {
          const fileData = excelData[fileKey];
          if (!fileData) return null; // Bỏ qua nếu file đó rỗng
          const sheetNames = Object.keys(fileData);
          return (
            <View key={fileKey} style={styles.fileSection}>
              {sheetNames.map(sheetName => (
                <TableSection
                  key={`${fileKey}-${sheetName}`}
                  title={sheetName}
                  data={fileData[sheetName]}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </AppSafeView>
  );
};

const columnWidths: { [key: string]: number } = {
  No: s(40),
  'Student ID': s(100),
  Name: s(150),
  Class: s(80),
  'Date of Birth': s(100),
  Email: s(200),
  'Course ID': s(80),
  'Course Name': s(150),
  Credits: s(60),
  Lecturer: s(150),
  Semester: s(120),
  'Number of Students': s(100),
  Labs: s(60),
  Assignments: s(90),
  'Practical Exam': s(80),
  Midterm: s(80),
  Final: s(80),
  GPA: s(80),
};
const DEFAULT_COL_WIDTH = s(120);

const TableSection = ({ title, data }: { title: string; data: any[] }) => {
  const [viewAll, setViewAll] = useState(false);
  const [tableData, setTableData] = useState<any[]>(data);

  if (!tableData || tableData.length === 0) {
    return (
      <View style={styles.section}>
        <SectionHeader style={{ marginBottom: vs(10) }} title={title} />
        <Text style={styles.emptySheetText}>No data in this sheet.</Text>
      </View>
    );
  }

  const columns = Object.keys(tableData[0]);
  const visibleData = viewAll ? tableData : tableData.slice(0, 3);

  const handleChange = (rowIndex: number, col: string, value: string) => {
    const newData = [...tableData];
    if (newData[rowIndex]) {
      newData[rowIndex] = { ...newData[rowIndex], [col]: value };
      setTableData(newData);
    }
  };

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
          <View style={styles.rowHeader}>
            {columns.map((col, i) => (
              <Text
                key={i}
                style={[
                  styles.cell,
                  styles.headerText,
                  { width: columnWidths[col] || DEFAULT_COL_WIDTH },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>

          {visibleData.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {columns.map((col, colIndex) => (
                <TextInput
                  key={colIndex}
                  value={String(row[col] ?? '')}
                  onChangeText={text => handleChange(rowIndex, col, text)}
                  style={[
                    styles.inputCell,
                    { width: columnWidths[col] || DEFAULT_COL_WIDTH },
                  ]}
                  placeholder="..."
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default PreviewDataScreen;

const styles = StyleSheet.create({
  fileSection: {
    marginBottom: vs(20),
  },
  fileTitle: {
    paddingHorizontal: s(10),
    marginBottom: vs(10),
    color: AppColors.pr500,
  },
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
    padding: s(10),
    borderRightWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  inputCell: {
    padding: s(10),
    borderRightWidth: 1,
    borderColor: '#ddd',
    fontSize: 13,
    textAlignVertical: 'center',
    color: '#000',
  },
  headerText: {
    fontWeight: 'bold',
    backgroundColor: '#e0e0e0',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  emptyText: {
    marginTop: vs(10),
    color: AppColors.n500,
    textAlign: 'center',
  },
  emptySheetText: {
    paddingHorizontal: s(10),
    color: AppColors.n500,
    fontStyle: 'italic',
  },
});
