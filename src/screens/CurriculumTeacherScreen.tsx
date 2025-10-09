import React from 'react';
import { StyleSheet } from 'react-native';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import AppSafeView from '../components/views/AppSafeView';
import { AssignmentTeacherList, PETeacherList, SyllabusList } from '../data/coursesData';

const CurriculumTeacherScreen = () => {
  const sections = [
    { title: 'Slides', data: SyllabusList },
    { title: 'Assignments', data: AssignmentTeacherList },
    { title: 'PE', data: PETeacherList },
  ];
  return (
    <AppSafeView>
      <ScreenHeader title="Curriculum" />
      <CurriculumList
        sections={sections}
        // isDownloadable={false}
        // isSaved={true}
        scrollEnabled={true}
      />
    </AppSafeView>
  );
};

export default CurriculumTeacherScreen;

const styles = StyleSheet.create({});
