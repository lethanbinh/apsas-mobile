import React from 'react';
import { StyleSheet } from 'react-native';
import ManageUserList from '../components/admin/ManageUserList';
import LecturerHeader from '../components/common/LecturerHeader';
import AppSafeView from '../components/views/AppSafeView';

const UserManagementScreen = () => {
  return (
    <AppSafeView>
      <LecturerHeader title="Hi, Binh" role="Admin" />
      <ManageUserList />
    </AppSafeView>
  );
};

export default UserManagementScreen;

const styles = StyleSheet.create({});
