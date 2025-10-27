import React from 'react';
import { StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { CriteriaGradeIcon } from '../../assets/icons/icon';
import AppText from '../texts/AppText';

interface CriteriaResultItemProps {
  title: string;
  score: string;
  reason: string;
}
const CriteriaResultItem = ({
  title,
  score,
  reason,
}: CriteriaResultItemProps) => {
  return (
    <View style={{ marginBottom: vs(10) }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: vs(10),
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <CriteriaGradeIcon />
          <AppText style={{ marginLeft: s(5) }}>{title}</AppText>
        </View>

        <AppText variant="body16pxBold">{score}</AppText>
      </View>
      <View>
        <AppText variant="body14pxBold">Reason:</AppText>
        <AppText>{reason}</AppText>
      </View>
    </View>
  );
};

export default CriteriaResultItem;

const styles = StyleSheet.create({});
