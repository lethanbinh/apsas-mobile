import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { courseCategories } from '../../data/coursesData';
import CourseCategoryItem from './CourseCategoryItem';

const CourseCategoryList = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={courseCategories}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item }) => <CourseCategoryItem item={item} />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        columnWrapperStyle={{
          justifyContent: 'space-between',
        }}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      />
    </View>
  );
};

export default CourseCategoryList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
