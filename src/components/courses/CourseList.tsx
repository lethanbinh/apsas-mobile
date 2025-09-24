import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { allCourses } from '../../data/coursesData';
import CourseItem from './CourseItem';

const CourseList = () => {
  return (
    <FlatList
      style={{ paddingLeft: 25 }}
      data={allCourses}
      keyExtractor={item => item.id}
      renderItem={({ item }) => {
        return <CourseItem isMyCourse={false} item={item} onPress={() => {}} />;
      }}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
    />
  );
};

export default CourseList;

const styles = StyleSheet.create({});
