import { FlatList, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import ParticipantItem from '../components/courses/ParticipantItem';
import { participantList } from '../data/coursesData';

const ParticipantsScreen = () => {
  return (
    <AppSafeView>
      <ScreenHeader title="Participants" />
      <FlatList
        data={participantList}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          return (
            <ParticipantItem
              key={item.id}
              avatar={item.avatar}
              title={item.title}
              className={item.className}
              joinDate={item.joinDate}
              role={item.role}
            />
          );
        }}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
      />
    </AppSafeView>
  );
};

export default ParticipantsScreen;

const styles = StyleSheet.create({});
