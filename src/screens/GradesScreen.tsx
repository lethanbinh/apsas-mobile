import React from 'react';
import { StyleSheet } from 'react-native';
import ScreenHeader from '../components/common/ScreenHeader';
import AppSafeView from '../components/views/AppSafeView';
import { gradeAssignmentList, gradeExerciseList } from '../data/coursesData';
import CurriculumList from '../components/courses/CurriculumList';

const GradesScreen = () => {
  const sections = [
    { title: 'Assignments', data: gradeAssignmentList },
    { title: 'Exercises', data: gradeExerciseList },
  ];
  return (
    <AppSafeView>
      <ScreenHeader title="Grades" />
      <CurriculumList sections={sections} isGraded={true} />
    </AppSafeView>
  );
};

export default GradesScreen;

const styles = StyleSheet.create({});
