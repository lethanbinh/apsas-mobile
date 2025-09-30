import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import SectionHeader from '../components/common/SectionHeader';
import AssignmentCardInfo from '../components/courses/AssignmentCardInfo';
import CurriculumList from '../components/courses/CurriculumList';
import AppText from '../components/texts/AppText';
import { AssignmentList, SyllabusList } from '../data/coursesData';
import { AppColors } from '../styles/color';

const data = [
  { id: 1, title: 'Overall', score: 5, backgroundColor: AppColors.pr500 },
  { id: 2, title: 'TC1', score: 4, backgroundColor: AppColors.g500 },
  { id: 3, title: 'TC2', score: 5, backgroundColor: AppColors.r500 },
  { id: 4, title: 'TC3', score: 3, backgroundColor: AppColors.pur500 },
];

const sections = [
  { title: 'Documents', data: SyllabusList },
  { title: 'Submissions', data: AssignmentList },
];

const AssignmentDetailScreen = () => {
  const [listHeight, setListHeight] = useState(0);

  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled
      contentContainerStyle={{ paddingBottom: listHeight }}
    >
      <Image
        style={styles.image}
        source={require('../assets/images/assignment.png')}
      />
      <AssignmentCardInfo />
      <View
        style={{
          position: 'absolute',
          top: s(430),
          width: s(300),
          alignSelf: 'center',
        }}
      >
        <SectionHeader title="Score" buttonText="View Detail" />
        <View style={styles.scoreContainer}>
          {data.map(item => (
            <View
              key={item.id}
              style={[
                styles.scoreItem,
                { backgroundColor: item.backgroundColor },
              ]}
            >
              <AppText variant="label16pxRegular" style={{ color: AppColors.white }}>
                {item.title}
              </AppText>
              <AppText variant="label16pxRegular" style={{ color: AppColors.white }}>
                {item.score}
              </AppText>
            </View>
          ))}
        </View>
      </View>
      <View
        style={{ position: 'absolute', top: s(520), width: '100%' }}
        onLayout={e => setListHeight(e.nativeEvent.layout.height + s(100))} // 👈 đo chiều cao
      >
        <CurriculumList sections={sections} />
      </View>
    </ScrollView>
  );
};

export default AssignmentDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  image: {
    width: '100%',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(10),
  },
  scoreItem: {
    width: '22%',
    height: vs(50),
    justifyContent: 'center',
    borderRadius: s(5),
    paddingLeft: s(8),
  },
});
