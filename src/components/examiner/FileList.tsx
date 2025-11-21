import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';

interface FileListProps {
  files: Array<{ uri: string; name: string; type: string }>;
  onRemove: (index: number) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove }) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <View style={styles.fileList}>
      {files.map((file, index) => (
        <View key={index} style={styles.fileItem}>
          <Feather name="file" size={s(16)} color={AppColors.n600} />
          <AppText style={styles.fileName} numberOfLines={1}>
            {file.name}
          </AppText>
          <TouchableOpacity onPress={() => onRemove(index)}>
            <Feather name="x" size={s(16)} color={AppColors.r500} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default FileList;

const styles = StyleSheet.create({
  fileList: {
    marginTop: vs(10),
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: vs(8),
    backgroundColor: AppColors.n100,
    borderRadius: s(6),
    marginBottom: vs(6),
  },
  fileName: {
    flex: 1,
    marginLeft: s(8),
    fontSize: s(12),
    color: AppColors.n700,
  },
});

