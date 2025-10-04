import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { s } from 'react-native-size-matters';
import { DownloadIcon, NavigationIcon } from '../assets/icons/courses';
import { HistoryIcon, NavigationLarge } from '../assets/icons/icon';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import CourseCardItem from '../components/courses/CourseCardItem';
import SubmissionFileSection from '../components/score/SubmissionFileSection';
import SubmissionItem from '../components/score/SubmissionItem';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';

const SubmissionScreen = () => {
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
    setSubmittedFile(file); // ✅ luôn thay thế file cũ
  };

  const handleSubmit = () => {
    if (!submittedFile) {
      console.log('No file selected');
      return;
    }
    console.log('Submitting file:', submittedFile);
    // TODO: Gọi API upload file ở đây
  };

  return (
    <AppSafeView>
      <ScreenHeader title="Submission" />
      <View style={styles.container}>
        <CourseCardItem
          title={'Submission history'}
          leftIcon={<HistoryIcon />}
          backGroundColor={AppColors.b100}
          rightIcon={<NavigationIcon color={AppColors.b500} />}
          linkTo={'SubmissionHistoryScreen'}
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

        <SubmissionFileSection onFilePicked={handleFilePicked} />

        <View>
          <AppButton
            style={{
              marginTop: s(30),
              borderRadius: s(30),
              height: s(50),
            }}
            title="Submit"
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

export default SubmissionScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(25),
    paddingVertical: s(20),
  },
});
