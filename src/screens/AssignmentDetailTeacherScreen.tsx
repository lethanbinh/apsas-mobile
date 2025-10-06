import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import AssignmentCardInfo from '../components/courses/AssignmentCardInfo';
import CurriculumList from '../components/courses/CurriculumList';
import { DocumentList, SubmissionList } from '../data/coursesData';
import { AppColors } from '../styles/color';

const sections = [
  { title: 'Documents', data: DocumentList },
  { title: 'Submissions', data: SubmissionList },
];

const AssignmentDetailTeacherScreen = () => {
  const [listHeight, setListHeight] = useState(0);
  const navigation = useNavigation<any>();
  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled
      contentContainerStyle={{ paddingBottom: listHeight }}
    >
      <Image
        style={styles.image}
        source={require('../assets/images/assignment.png')}
      />
      <AssignmentCardInfo
        assignmentType="Basic Assignment"
        assignmentTitle="Assignment 1"
        dueDate="18/10/2025"
        lecturerName="NguyenNT"
        description="Graphic Design now a popular profession graphic design by off your carrer about tantas regiones barbarorum pedibus obiit Graphic Design now a popular profession graphic design by off your carrer about tantas regiones barbarorum pedibus obiit"
        isSubmitted={false}
        onSubmitPress={() => {
          navigation.navigate('SubmissionScreen');
        }}
        isAssessment={true}
        onDashboardPress={() => {
          navigation.navigate('DashboardTeacherScreen' as never);
        }}
      />
      <View />
      <View
        style={{ position: 'absolute', top: s(430), width: '100%' }}
        onLayout={e => setListHeight(e.nativeEvent.layout.height + s(100))} // 👈 đo chiều cao
      >
        <CurriculumList
          sections={sections}
          buttonText="Download All Submissions"
        />
      </View>
    </ScrollView>
  );
};

export default AssignmentDetailTeacherScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  image: {
    width: '100%',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(10),
  },
  scoreItem: {
    width: '22%',
    height: vs(50),
    justifyContent: 'center',
    borderRadius: s(5),
    paddingLeft: s(8),
  },
});
