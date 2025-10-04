import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { s } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { SubmissionIcon } from '../../assets/icons/icon';
import { pick } from '@react-native-documents/picker';

type SubmissionFileSectionProps = {
  onFilePicked: (file: { name: string; uri: string; type: string }) => void;
};

const SubmissionFileSection: React.FC<SubmissionFileSectionProps> = ({
  onFilePicked,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const pickFile = async () => {
    try {
      const result = await pick({
        type: ['application/zip'],
      });

      if (result && result.length > 0) {
        const file = result[0];
        console.log('Picked file:', file);
        setFileName(file.name ?? 'Unknown file');
        onFilePicked({
          name: file.name ?? 'Unknown file',
          uri: file.uri,
          type: file.type ?? 'application/zip',
        }); // gửi file ra ngoài
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
        Add Zip File
      </AppText>

      <TouchableOpacity
        style={styles.uploadBox}
        onPress={pickFile}
        activeOpacity={0.7}
      >
        <SubmissionIcon />
        <AppText style={{ marginTop: 10 }}>Click here to Upload</AppText>
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
