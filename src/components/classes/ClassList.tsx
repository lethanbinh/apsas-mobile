import { FlatList, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import ClassItem from './ClassItem';
import { allClasses } from '../../data/class';

const ClassList = () => {
  return (
    <FlatList
      style={{ paddingLeft: 25 }}
      data={allClasses}
      keyExtractor={item => item.id}
      renderItem={({ item }) => {
        return <ClassItem isMyClass={false} item={item} onPress={() => {}} />;
      }}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
    />
  );
};

export default ClassList;

const styles = StyleSheet.create({});
