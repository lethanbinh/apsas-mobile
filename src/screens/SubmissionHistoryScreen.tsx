import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { s } from 'react-native-size-matters';
import ScreenHeader from '../components/common/ScreenHeader';
import SubmissionHistoryItem from '../components/gradeHistory/SubmissionHistoryItem';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

const data = [
  {
    id: 1,
    backgroundColor: AppColors.pr100,
    submissionTime: '10:30 AM, Sep 20, 2023',
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    assignmentTitle: 'Homework 1',
    teacherName: 'NguyenNT',
    fileName: 'homework1.zip',
    status: 'Late' as 'Late',
    timeSubmit: 'Submission 3',
  },
  {
    id: 2,
    backgroundColor: AppColors.g100,
    submissionTime: '11:00 AM, Sep 18, 2023',
    courseCode: 'MA101',
    courseName: 'Calculus I',
    assignmentTitle: 'Assignment 1',
    teacherName: 'TranTV',
    fileName: 'assignment1.pdf',
    status: 'On time' as 'On time',
    timeSubmit: 'Submission 2',
  },
  {
    id: 3,
    backgroundColor: AppColors.pur100,
    submissionTime: '09:00 AM, Sep 15, 2023',
    courseCode: 'PH101',
    courseName: 'Physics I',
    assignmentTitle: 'Lab Report 1',
    teacherName: 'LeHQ',
    fileName: 'labreport1.docx',
    status: 'Missing' as 'Missing',
    timeSubmit: 'Submission 1',
  },
];

const SubmissionHistoryScreen = () => {
  return (
    <AppSafeView>
      <ScreenHeader title="Submission History" />
      <View style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <SubmissionHistoryItem {...item} />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: s(15) }} />}
        />
      </View>
    </AppSafeView>
  );
};

export default SubmissionHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: s(25),
    paddingVertical: s(20),
  },
});
