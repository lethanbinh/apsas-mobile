import { FlatList, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import ScreenHeader from '../components/common/ScreenHeader';
import AppSafeView from '../components/views/AppSafeView';
import { courseCategoryList } from '../data/coursesData';
import CourseItem from '../components/courses/CourseItem';
import { s, vs } from 'react-native-size-matters';

const CourseByCategoryScreen = () => {
  return (
    <AppSafeView>
      <ScreenHeader title="Java course Category" />
      <View style={styles.listContainer}>
        <FlatList
          data={courseCategoryList.items}
          keyExtractor={item => item.item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <CourseItem customStyle={{
                width: s(140)
            }} item={item.item} onPress={() => {}} />
          )}
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
    </AppSafeView>
  );
};

export default CourseByCategoryScreen;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: s(25),
    marginTop: vs(20),
  },
});
