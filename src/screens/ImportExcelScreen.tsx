import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import {
  CurriculumIcon,
  DownloadIcon,
  ViewIcon,
} from '../assets/icons/courses';
import { NavigationLarge } from '../assets/icons/icon';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import CourseCardItem from '../components/courses/CourseCardItem';
import SubmissionFileSection from '../components/score/SubmissionFileSection';
import SubmissionItem from '../components/score/SubmissionItem';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { useNavigation } from '@react-navigation/native';

const ImportExcelScreen = () => {
  const navigation = useNavigation();
  const [submittedFile, setSubmittedFile] = useState<{
    name: string;
    uri: string;
    type: string;
  } | null>(null);

  const handleFilePicked = (file: {
    name: string;
    uri: string;
    type: string;
  }) => {
    setSubmittedFile(file);
  };

  const handleSubmit = () => {
    if (!submittedFile) {
      console.log('No file selected');
      return;
    }
    console.log('Submitting file:', submittedFile);
  };

  return (
    <AppSafeView>
      <ScreenHeader title="Import Excel" />
      <View style={styles.container}>
        <CourseCardItem
          title={'Download Template'}
          leftIcon={<CurriculumIcon />}
          backGroundColor={AppColors.b100}
          rightIcon={<DownloadIcon color={AppColors.b500} />}
          linkTo={''}
        />

        <AppButton
          title="Preview"
          style={{
            marginTop: vs(20),
            minWidth: 0,
            width: s(120),
            alignSelf: 'flex-start',
          }}
          size="small"
          leftIcon={<ViewIcon color={AppColors.black} />}
          textColor={AppColors.black}
          variant="secondary"
          onPress={() => {
            navigation.navigate('PreviewDataScreen' as never);
          }}
        />

        <View style={{ marginVertical: s(20) }}>
          {submittedFile && (
            <SubmissionItem
              fileName={submittedFile.name}
              title="Your file"
              onRemove={() => setSubmittedFile(null)} // ✅ xoá file
            />
          )}
        </View>

        <SubmissionFileSection
          title="Add Excel File"
          fileType="excel"
          onFilePicked={handleFilePicked}
        />
        <View>
          <AppButton
            style={{
              marginTop: s(30),
              borderRadius: s(30),
              height: s(50),
            }}
            title="Publish Plan"
            onPress={handleSubmit}
            textVariant="body16pxBold"
          />
          <View
            style={{
              alignItems: 'center',
              backgroundColor: AppColors.white,
              position: 'absolute',
              top: s(38),
              right: s(10),
              padding: s(10),
              borderRadius: s(25),
            }}
          >
            <NavigationLarge />
          </View>
        </View>
      </View>
    </AppSafeView>
  );
};

export default ImportExcelScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(25),
    paddingVertical: s(20),
  },
});
