// SemesterCard.tsx
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/color';
import { s, vs } from 'react-native-size-matters';

type SemesterCardProps = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
  semesterName: string;
};

const SemesterCard: React.FC<SemesterCardProps> = ({
  title,
  actionLabel,
  onPressAction,
  semesterName,
}) => {
  return (
    <View
      style={{
        backgroundColor: AppColors.pr100,
        paddingVertical: vs(10),
        paddingHorizontal: s(15),
        borderRadius: s(10),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: vs(10),
        }}
      >
        <AppText style={{ color: AppColors.black }}>{title}</AppText>

        {actionLabel && (
          <TouchableOpacity onPress={onPressAction}>
            <AppText style={{ color: AppColors.pr500 }}>{actionLabel}</AppText>
          </TouchableOpacity>
        )}
      </View>

      <AppText variant="h3">{semesterName}</AppText>
    </View>
  );
};

export default SemesterCard;

const styles = StyleSheet.create({});
