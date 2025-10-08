import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { s } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { CloneIcon } from '../../assets/icons/icon';

type SubmissionItemProps = {
  fileName: string;
  title?: string;
  onRemove?: () => void;
  onNavigate?: () => void;
  onClone?: () => void;
};

const SubmissionItem: React.FC<SubmissionItemProps> = ({
  fileName,
  title,
  onRemove,
  onNavigate,
  onClone,
}) => {
  return (
    <View style={styles.container}>
      <View
        style={{
          width: s(90),
          height: s(90),
          borderRadius: s(16),
          backgroundColor: AppColors.black,
        }}
      />

      <TouchableOpacity style={{ flex: 1 }} onPress={onNavigate}>
        <AppText
          variant="body14pxBold"
          style={{
            color: AppColors.pr500,
          }}
        >
          {fileName}
        </AppText>
        {title && (
          <AppText
            variant="body14pxBold"
            style={{
              color: AppColors.black,
            }}
          >
            {title}
          </AppText>
        )}
      </TouchableOpacity>

      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <AppText variant="body12pxBold" style={{ color: AppColors.white }}>
            x
          </AppText>
        </TouchableOpacity>
      )}

      {onClone && (
        <TouchableOpacity onPress={onClone} style={{}}>
          <CloneIcon />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SubmissionItem;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: s(16),
    padding: s(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(15),
  },
  removeBtn: {
    backgroundColor: AppColors.r500,
    borderRadius: s(12),
    paddingHorizontal: s(8),
    paddingVertical: s(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
