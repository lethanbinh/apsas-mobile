import { StyleSheet, View, FlatList } from 'react-native';
import React from 'react';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import FeedbackItem from '../components/score/FeedbackItem';
import { s } from 'react-native-size-matters';

const feedbackData = [
  {
    title: 'Overall Feedback',
    textColor: '#2F80ED',
    backgroundColor: '#EAF4FF',
    content:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation ven...',
  },
  {
    title: 'What you should avoid',
    textColor: '#27AE60',
    backgroundColor: '#F0FAF3',
    content:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation ven...',
  },
  {
    title: 'What you should improve',
    textColor: '#EB5757',
    backgroundColor: '#FFF0F0',
    content:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation ven...',
  },
  {
    title: 'Performance',
    textColor: '#BB6BD9',
    backgroundColor: '#FAF0FF',
    content:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation ven...',
  },
  {
    title: 'Code Style',
    textColor: '#2D9CDB',
    backgroundColor: '#F0F8FF',
    content:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation ven...',
  },
  {
    title: 'Optimization',
    textColor: '#EB5757',
    backgroundColor: '#FFF0F0',
    content:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation ven...',
  },
];

const FeedbackScreen = () => {
  return (
    <AppSafeView>
      <ScreenHeader title="Feedbacks" />
      <View
        style={{
          paddingHorizontal: s(25),
          paddingVertical: s(20),
        }}
      >
        <FlatList
          data={feedbackData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <FeedbackItem
              title={item.title}
              content={item.content}
              textColor={item.textColor}
              backgroundColor={item.backgroundColor}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </AppSafeView>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({});
