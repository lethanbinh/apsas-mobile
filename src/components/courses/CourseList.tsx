import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters'; // Import vs
import CourseItem, { CourseItemProps } from './CourseItem';

export interface CourseListProps {
  items: CourseItemProps[];
}
const CourseList = ({ items }: CourseListProps) => {
  return (
    <FlatList
      data={items}
      keyExtractor={item => item.item.id}
      renderItem={({ item }) => {
        return (
          <CourseItem
            isMyCourse={item.isMyCourse}
            item={item.item}
            onPress={item.onPress}
          />
        );
      }}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
      columnWrapperStyle={{
        justifyContent: 'space-between',
      }}
    />
  );
};

export default CourseList;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: s(25),
    paddingTop: vs(10),
  },
});
