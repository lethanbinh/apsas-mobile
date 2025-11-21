import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import FileList from './FileList';

interface FileUploadSectionProps {
  selectedFiles: Array<{ uri: string; name: string; type: string }>;
  onPickFiles: () => void;
  onRemoveFile: (index: number) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  selectedFiles,
  onPickFiles,
  onRemoveFile,
}) => {
  return (
    <View style={styles.formGroup}>
      <AppText style={styles.label}>Upload Submissions (Optional)</AppText>
      <AppText style={styles.helpText}>
        ZIP files will be extracted and submissions will be created automatically.
        File names must be in format STUXXXXXX.zip (e.g., STU123456.zip)
      </AppText>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={onPickFiles}
      >
        <Feather name="upload" size={s(20)} color={AppColors.pr500} />
        <AppText style={styles.uploadButtonText}>Select ZIP Files</AppText>
      </TouchableOpacity>

      <FileList files={selectedFiles} onRemove={onRemoveFile} />
    </View>
  );
};

export default FileUploadSection;

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: vs(15),
  },
  label: {
    fontSize: s(14),
    fontWeight: '600',
    color: AppColors.n700,
    marginBottom: vs(8),
  },
  helpText: {
    fontSize: s(12),
    color: AppColors.n500,
    marginBottom: vs(8),
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: vs(12),
    backgroundColor: AppColors.pr100,
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: AppColors.pr300,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    marginLeft: s(8),
    color: AppColors.pr500,
    fontWeight: '600',
  },
});

