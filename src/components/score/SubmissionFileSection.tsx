import { pick } from '@react-native-documents/picker';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { s } from 'react-native-size-matters';
import { SubmissionIcon } from '../../assets/icons/icon';
import AppText from '../texts/AppText';

type SubmissionFileSectionProps = {
  title?: string;
  onFilePicked: (file: { name: string; uri: string; type: string }) => void;
  fileType?: 'zip' | 'excel';
};

const SubmissionFileSection: React.FC<SubmissionFileSectionProps> = ({
  title = 'Add Zip File',
  onFilePicked,
  fileType = 'zip',
}) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const pickFile = async () => {
    try {
      let allowedTypes: string[] = [];

      if (fileType === 'zip') {
        allowedTypes = ['application/zip'];
      } else if (fileType === 'excel') {
        allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel',
        ];
      }
      const result = await pick({
        type: allowedTypes,
      });

      if (result && result.length > 0) {
        const file = result[0];
        console.log('Picked file:', file);
        setFileName(file.name ?? 'Unknown file');
        onFilePicked({
          name: file.name ?? 'Unknown file',
          uri: file.uri,
          type: file.type ?? allowedTypes[0],
        });
      }
    } catch (err: any) {
      if (err?.message?.includes('User cancelled')) {
        console.log('User cancelled picking');
      } else {
        console.error('File picker error:', err);
      }
    }
  };

  return (
    <View>
      <AppText variant="h4" style={{ marginBottom: 10 }}>
        {title}
      </AppText>

      <TouchableOpacity
        style={styles.uploadBox}
        onPress={pickFile}
        activeOpacity={0.7}
      >
        <SubmissionIcon />
        <AppText style={{ marginTop: 10 }}>
          Click here to Upload {fileType === 'zip' ? 'ZIP' : 'Excel'} File
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

export default SubmissionFileSection;

const styles = StyleSheet.create({
  uploadBox: {
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 16,
    padding: s(20),
    alignItems: 'center',
    justifyContent: 'center',
    height: s(120),
    marginTop: s(10),
  },
});
