import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppText from '../texts/AppText';
import CriteriaResultItem from './CriteriaResultItem';
import { AppColors } from '../../styles/color';
import { s, vs } from 'react-native-size-matters';
const data = [
  {
    id: 1,
    title: 'Criteria 1 grade',
    score: '2 / 5',
    reason:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation ven... Read more',
  },
  {
    id: 2,
    title: 'Criteria 2 grade',
    score: '4 / 5',
    reason:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation ven... Read more',
  },
  {
    id: 3,
    title: 'Criteria 3 grade',
    score: '5 / 5',
    reason:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation ven... Read more',
  },
];
const CriteriaResult = () => {
  return (
    <View style={styles.container}>
      <AppText
        style={{ color: AppColors.pr500, marginBottom: vs(10) }}
        variant="h4"
      >
        Criteria Result
      </AppText>
      {data.map(item => (
        <CriteriaResultItem key={item.id} {...item} />
      ))}
    </View>
  );
};

export default CriteriaResult;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(20),
  },
});
