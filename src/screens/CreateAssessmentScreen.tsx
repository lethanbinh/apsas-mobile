import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import RadioWithTitle from '../components/inputs/RadioWithTitle';
import AppText from '../components/texts/AppText';
import AppSafeView from '../components/views/AppSafeView';
import { DocumentListUpload } from '../data/coursesData';
import { AppColors } from '../styles/color';
const ASSIGNMENT_TYPE = ['Male', 'Female', 'Others'];

const CreateAssessmentScreen = () => {
  const [selectedItem, setSelectedItem] = useState<string>('Male');
  const handleChangeAssignmentType = (item: string) => {
    setSelectedItem(item);
  };
  const sections = [
    { title: 'Documents', data: DocumentListUpload, sectionButton: 'Add' },
  ];
  return (
    <AppSafeView>
      <ScreenHeader title="Create Assessment" />
      <View style={{ paddingTop: vs(15), paddingHorizontal: s(25) }}>
        <AppText
          style={{
            color: AppColors.n700,
            marginBottom: vs(4),
          }}
          variant="body14pxRegular"
        >
          Assignment Type
        </AppText>
        {ASSIGNMENT_TYPE.map(item => {
          return (
            <RadioWithTitle
              key={item}
              title={item}
              selected={item === selectedItem}
              onPress={() => handleChangeAssignmentType(item)}
            />
          );
        })}
      </View>
      <CurriculumList
        sections={sections}
        isDownloadable={false}
        isSaved={true}
        scrollEnabled={true}
        hasTestCase={true}
      />
    </AppSafeView>
  );
};

export default CreateAssessmentScreen;

const styles = StyleSheet.create({});
