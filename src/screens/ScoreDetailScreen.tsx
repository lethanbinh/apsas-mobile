import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { CriteriaGradeIcon } from '../assets/icons/icon';
import AppButton from '../components/buttons/AppButton';
import ScreenHeader from '../components/common/ScreenHeader';
import CurriculumList from '../components/courses/CurriculumList';
import CriteriaResult from '../components/score/CriteriaResult';
import AppText from '../components/texts/AppText';
import AppSafeView from '../components/views/AppSafeView';
import { submissionList } from '../data/coursesData';
import { AppColors } from '../styles/color';
const sections = [{ title: 'File Submit', data: submissionList }];
const ScoreDetailScreen = () => {
  const navigation = useNavigation();
  return (
    <AppSafeView>
      <ScrollView>
        <ScreenHeader title="Score Detail" />
        <View style={{ marginBottom: vs(-50) }}>
          <CurriculumList sections={sections} isDownloadable={false} />
        </View>

        <CriteriaResult />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: vs(10),
            paddingHorizontal: s(20),
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
            <AppText style={{ marginLeft: s(5) }}>Total Grade</AppText>
          </View>

          <AppText
            style={{ color: AppColors.pur500 }}
            variant="label16pxRegular"
          >
            10 / 10
          </AppText>
        </View>
        <AppButton
          style={{
            width: s(200),
            marginTop: vs(20),
            borderRadius: s(10),
          }}
          title="View feedback"
          onPress={() => {
            navigation.navigate('FeedbackScreen' as never);
          }}
        />
      </ScrollView>
    </AppSafeView>
  );
};

export default ScoreDetailScreen;

const styles = StyleSheet.create({});
