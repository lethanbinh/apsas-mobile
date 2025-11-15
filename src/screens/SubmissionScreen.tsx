import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DownloadIcon, NavigationIcon } from '../assets/icons/courses';
import { HistoryIcon, NavigationLarge } from '../assets/icons/icon';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import CourseCardItem from '../components/courses/CourseCardItem';
import SubmissionFileSection from '../components/score/SubmissionFileSection';
import SubmissionItem from '../components/score/SubmissionItem';
import AppSafeView from '../components/views/AppSafeView';
import { AppColors } from '../styles/color';
import { createSubmission } from '../api/submissionService';
import { showErrorToast, showSuccessToast } from '../components/toasts/AppToast';
import RNBlobUtil from 'react-native-blob-util';
import { SecureStorage } from '../utils/SecureStorage';
import { BACKEND_API_URL } from '@env';
import { Platform } from 'react-native';
import { IS_ANDROID } from '../constants/constants';
import AppText from '../components/texts/AppText';

const SubmissionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const classAssessmentId = (route.params as { classAssessmentId?: number })?.classAssessmentId;
  const elementId = (route.params as { elementId?: number })?.elementId;

  const [submittedFile, setSubmittedFile] = useState<{
    name: string;
    uri: string;
    type: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  const handleFilePicked = (file: {
    name: string;
    uri: string;
    type: string;
  }) => {
    setSubmittedFile(file);
  };

  const uploadFile = async (file: { uri: string; name: string; type: string }): Promise<string> => {
    const token = await SecureStorage.getCredentials('authToken');
    if (!token) {
      throw new Error('No auth token found for upload.');
    }

    const url = `${BACKEND_API_URL}/api/File/upload?folder=submission`;
    const filePath = IS_ANDROID ? file.uri : file.uri.replace('file://', '');

    const resp = await RNBlobUtil.fetch(
      'POST',
      url,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      [
        {
          name: 'file',
          filename: file.name,
          type: file.type,
          data: RNBlobUtil.wrap(filePath),
        },
      ],
    );

    const jsonResp = resp.json() as any;
    if (jsonResp.isSuccess && jsonResp.result?.fileUrl) {
      return jsonResp.result.fileUrl;
    } else {
      throw new Error(jsonResp.errorMessages?.join(', ') || 'File upload failed.');
    }
  };

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  const handleSubmit = async () => {
    if (!isMounted) return;

    if (!submittedFile) {
      showErrorToast('Error', 'Please select a file to submit.');
      return;
    }

    if (!classAssessmentId) {
      showErrorToast('Error', 'No assignment ID provided.');
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Upload file first
      const fileUrl = await uploadFile(submittedFile);
      if (!isMounted) return;
      setIsUploading(false);

      // Create submission
      const response = await createSubmission({
        classAssessmentId,
        fileUrl,
        fileName: submittedFile.name || 'submission.zip',
      });

      if (!isMounted) return;

      if (response.isSuccess) {
        showSuccessToast('Success', 'Assignment submitted successfully!');
        navigation.goBack();
      } else {
        throw new Error(response.errorMessages?.join(', ') || 'Failed to submit assignment.');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      if (isMounted) {
        showErrorToast('Error', error.message || 'Failed to submit assignment.');
      }
    } finally {
      if (isMounted) {
        setIsSubmitting(false);
        setIsUploading(false);
      }
    }
  };

  if (!classAssessmentId && !elementId) {
    return (
      <AppSafeView>
        <ScreenHeader title="Submission" />
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>No assignment ID provided.</AppText>
        </View>
      </AppSafeView>
    );
  }

  return (
    <AppSafeView>
      <ScreenHeader title="Submission" />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: vs(20) }}>
        <CourseCardItem
          title={'Submission history'}
          leftIcon={<HistoryIcon />}
          backGroundColor={AppColors.b100}
          rightIcon={<NavigationIcon color={AppColors.b500} />}
          onPress={() => navigation.navigate('SubmissionHistoryScreen')}
        />

        <View style={{ marginVertical: s(20) }}>
          {submittedFile && (
            <SubmissionItem
              fileName={submittedFile.name}
              title="Your file"
              onRemove={() => setSubmittedFile(null)}
            />
          )}
        </View>

        <SubmissionFileSection onFilePicked={handleFilePicked} />

        <View style={styles.submitContainer}>
          {isUploading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={AppColors.pr500} />
              <AppText style={styles.loadingText}>Uploading file...</AppText>
            </View>
          )}
          <AppButton
            style={{
              marginTop: s(30),
              borderRadius: s(30),
              height: s(50),
            }}
            title={isSubmitting ? 'Submitting...' : 'Submit'}
            onPress={handleSubmit}
            textVariant="body16pxBold"
            loading={isSubmitting}
            disabled={isSubmitting || !submittedFile}
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
      </ScrollView>
    </AppSafeView>
  );
};

export default SubmissionScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(25),
    paddingVertical: s(20),
  },
  submitContainer: {
    position: 'relative',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(10),
  },
  loadingText: {
    marginLeft: s(10),
    color: AppColors.n700,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  errorText: {
    color: AppColors.errorColor,
    textAlign: 'center',
  },
});
