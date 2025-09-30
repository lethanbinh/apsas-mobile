import React from 'react';
import { StyleSheet } from 'react-native';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import AppSafeView from '../components/views/AppSafeView';
import { AssignmentList, PEList, SyllabusList } from '../data/coursesData';

const CurriculumScreen = () => {
  const sections = [
    { title: 'Slides', data: SyllabusList },
    { title: 'Assignments', data: AssignmentList },
    { title: 'PE', data: PEList },
  ];
  return (
    <AppSafeView>
      <ScreenHeader title="Curriculum" />
      <CurriculumList sections={sections} />
    </AppSafeView>
  );
};

export default CurriculumScreen;

const styles = StyleSheet.create({});
