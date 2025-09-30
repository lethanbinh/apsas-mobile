import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import CourseItem, { CourseItemProps } from './CourseItem';

export interface CourseListProps {
  items: CourseItemProps[];
}
const CourseList = ({ items }: CourseListProps) => {
  return (
    <FlatList
      style={{ paddingLeft: 25 }}
      contentContainerStyle={{ paddingRight: 40 }}
      data={items}
      keyExtractor={item => item.item.id}
      renderItem={({ item }) => {
        return (
          <CourseItem
            isMyCourse={item.isMyCourse}
            item={item.item}
            onPress={(item.onPress)}
          />
        );
      }}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
    />
  );
};

export default CourseList;

const styles = StyleSheet.create({});
