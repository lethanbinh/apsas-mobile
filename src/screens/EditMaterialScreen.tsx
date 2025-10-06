import React from 'react';
import { StyleSheet } from 'react-native';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import AppSafeView from '../components/views/AppSafeView';
import { AssignmentListUpload, PEListUpload, SyllabusListUpload } from '../data/coursesData';

const EditMaterialScreen = () => {
  const sections = [
    { title: 'Slides', data: SyllabusListUpload, sectionButton: "Add" },
    { title: 'Assignments', data: AssignmentListUpload },
    { title: 'PE', data: PEListUpload },
  ];
  return (
    <AppSafeView>
      <ScreenHeader title="Material" />
      <CurriculumList
        sections={sections}
        isDownloadable={false}
        isSaved={true}
        scrollEnabled={true}
      />
    </AppSafeView>
  );
};

export default EditMaterialScreen;

const styles = StyleSheet.create({});
